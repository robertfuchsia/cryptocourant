import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { PostList } from "@/components/PostList";
import { newsIndexQuery } from "@/sanity/queries";
import { href, isLang, t, type Lang } from "@/lib/i18n";
import { hreflangAlternates } from "@/lib/site";

// Paginering leest searchParams, dus deze route rendert per request.
// Data blijft gecached via de revalidate/tags in sanityFetch.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (isLang(raw) ? raw : "nl") as Lang;
  return {
    title: t[lang].allNews,
    alternates: {
      canonical: href.newsIndex(lang),
      languages: hreflangAlternates({ nl: href.newsIndex("nl"), en: href.newsIndex("en") }),
    },
  };
}

export default async function NewsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw as Lang;
  const dict = t[lang];

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="headline text-3xl sm:text-4xl">{dict.allNews}</h1>

      <PostList
        lang={lang}
        query={newsIndexQuery}
        basePath={href.newsIndex(lang)}
        searchParams={searchParams}
      />

    </div>
  );
}
