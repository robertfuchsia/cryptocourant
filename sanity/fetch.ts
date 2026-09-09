import "server-only";
import { draftMode } from "next/headers";
import { client } from "./client";
import { readToken } from "./env";
import { demoResult } from "./demo";

type FetchOptions = {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
};

/** Tijdens `next build` mag een lege of onbereikbare dataset de build niet slopen. */
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

/**
 * Demo-modus draait op ingebouwde voorbeeldartikelen. Staat automatisch aan
 * zolang er geen Sanity-project is ingevuld, zodat `npm run dev` meteen werkt.
 */
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" ||
  !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === "jouw-project-id";

/**
 * Eén plek voor alle Sanity-reads.
 * In preview-modus wordt met een token gelezen zodat concepten zichtbaar zijn.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = ["sanity"],
  revalidate = 60,
}: FetchOptions): Promise<T> {
  if (DEMO_MODE) return demoResult(query, params) as T;

  try {
    const isDraft = (await draftMode()).isEnabled;

    if (isDraft) {
      if (!readToken) {
        throw new Error(
          "Preview-modus vraagt om SANITY_API_READ_TOKEN in je omgevingsvariabelen."
        );
      }
      return await client.fetch<T>(query, params, {
        token: readToken,
        perspective: "drafts",
        useCdn: false,
        stega: true,
        cache: "no-store",
      });
    }

    return await client.fetch<T>(query, params, {
      perspective: "published",
      useCdn: true,
      next: { revalidate, tags },
    });
  } catch (error) {
    if (IS_BUILD) {
      console.warn(
        `[sanity] Query mislukt tijdens de build, pagina wordt leeg opgeleverd: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return null as T;
    }
    throw error;
  }
}
