import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { newsIndexQuery } from "@/sanity/queries";
import type { Paginated, PostCard as PostCardType } from "@/sanity/types";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { href, isLang, t, type Lang } from "@/lib/i18n";
import { POSTS_PER_PAGE, hreflangAlternates, pageRange, parsePage } from "@/lib/site";

export const revalidate = 60;

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

  const page = parsePage((await searchParams).page);
  const { from, to } = pageRange(page);

  const data = await sanityFetch<Paginated<PostCardType>>({
    query: newsIndexQuery,
    params: { lang, from, to },
    tags: ["post"],
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / POSTS_PER_PAGE));

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="headline text-3xl sm:text-4xl">{dict.allNews}</h1>

      {items.length ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post, i) => (
            <PostCard key={post._id} post={post} lang={lang} priority={i < 3} />
          ))}
        </div>
      ) : (
        <p className="text-muted mt-10">{dict.nothingYet}</p>
      )}

      <Pagination lang={lang} basePath={href.newsIndex(lang)} page={page} totalPages={totalPages} />
    </div>
  );
}
