import { sanityFetch } from "@/sanity/fetch";
import { feedQuery, settingsQuery } from "@/sanity/queries";
import { imageUrl } from "@/sanity/image";
import type { Settings, SanityImage } from "@/sanity/types";
import { href, isLang, t, type Lang } from "@/lib/i18n";
import { absolute } from "@/lib/site";

export const revalidate = 900;

type FeedItem = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  mainImage?: SanityImage;
  author?: { name: string };
  categories?: Array<{ title: string }>;
};

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang: raw } = await params;
  if (!isLang(raw)) return new Response("Not found", { status: 404 });
  const lang = raw as Lang;
  const dict = t[lang];

  const [items, settings] = await Promise.all([
    sanityFetch<FeedItem[]>({ query: feedQuery, params: { lang }, tags: ["post"] }),
    sanityFetch<Settings | null>({ query: settingsQuery, tags: ["siteSettings"] }),
  ]);

  const self = absolute(href.rss(lang));
  const home = absolute(href.home(lang));

  const body = (items ?? [])
    .map((item) => {
      const url = absolute(href.post(lang, item.slug));
      const image = imageUrl(item.mainImage, 1200, 630);
      return `    <item>
      <title>${escape(item.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
      <description>${escape(item.excerpt ?? "")}</description>
${item.author?.name ? `      <dc:creator>${escape(item.author.name)}</dc:creator>\n` : ""}${(item.categories ?? [])
        .map((c) => `      <category>${escape(c.title)}</category>`)
        .join("\n")}
${image ? `      <enclosure url="${image}" type="image/jpeg" />\n` : ""}    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(settings?.title ?? dict.siteName)}${lang === "en" ? " (EN)" : ""}</title>
    <link>${home}</link>
    <description>${escape(settings?.description?.[lang] ?? dict.tagline)}</description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
${body}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}

export function generateStaticParams() {
  return [{ lang: "nl" }, { lang: "en" }];
}

export const dynamicParams = false;

export const runtime = "nodejs";

