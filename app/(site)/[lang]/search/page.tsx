import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { searchQuery } from "@/sanity/queries";
import type { PostCard as PostCardType } from "@/sanity/types";
import { PostCard } from "@/components/PostCard";
import { href, isLang, t, type Lang } from "@/lib/i18n";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (isLang(raw) ? raw : "nl") as Lang;
  return {
    title: t[lang].searchTitle,
    robots: { index: false, follow: true },
    alternates: { canonical: href.search(lang) },
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw as Lang;
  const dict = t[lang];

  const q = ((await searchParams).q ?? "").trim();
  const results = q
    ? await sanityFetch<PostCardType[]>({
        query: searchQuery,
        params: { lang, q: `${q}*` },
        tags: ["post"],
        revalidate: 60,
      })
    : [];

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="headline text-3xl sm:text-4xl">{dict.searchTitle}</h1>

      <form action={href.search(lang)} method="get" className="mt-6 flex max-w-xl gap-2">
        <label className="sr-only" htmlFor="q">
          {dict.searchPlaceholder}
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={dict.searchPlaceholder}
          className="bg-soft border-line min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          className="bg-accent on-accent rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          {dict.searchButton}
        </button>
      </form>

      {q ? (
        <>
          <p className="text-subtle mt-8 text-sm">{dict.searchResults(results.length, q)}</p>
          {results.length ? (
            <div className="mt-6 max-w-3xl">
              {results.map((post) => (
                <PostCard key={post._id} post={post} lang={lang} variant="row" />
              ))}
            </div>
          ) : (
            <p className="text-muted mt-6">{dict.searchEmpty}</p>
          )}
        </>
      ) : (
        <p className="text-muted mt-8">{dict.searchPrompt}</p>
      )}
    </div>
  );
}
