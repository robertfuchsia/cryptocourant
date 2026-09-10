import { Suspense } from "react";
import { sanityFetch } from "@/sanity/fetch";
import type { Paginated, PostCard as PostCardType } from "@/sanity/types";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { t, type Lang } from "@/lib/i18n";
import { POSTS_PER_PAGE, pageRange, parsePage } from "@/lib/site";

type Props = {
  lang: Lang;
  query: string;
  params?: Record<string, unknown>;
  basePath: string;
  searchParams: Promise<{ page?: string }>;
  gridClassName?: string;
};

/**
 * Leest `searchParams` bewust pas hier, binnen een Suspense-grens.
 * Zo blijft de rest van de pagina statisch te prerenderen; alleen deze lijst
 * rendert per request. Wordt dit naar de pagina zelf getild, dan valt de hele
 * route om met DYNAMIC_SERVER_USAGE zodra er ook `revalidate` op staat.
 */
async function PostListInner({
  lang,
  query,
  params = {},
  basePath,
  searchParams,
  gridClassName,
}: Props) {
  const page = parsePage((await searchParams).page);
  const { from, to } = pageRange(page);

  const data = await sanityFetch<Paginated<PostCardType>>({
    query,
    params: { ...params, lang, from, to },
    tags: ["post"],
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / POSTS_PER_PAGE));

  return (
    <>
      {items.length ? (
        <div className={gridClassName ?? "mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"}>
          {items.map((post, i) => (
            <PostCard key={post._id} post={post} lang={lang} priority={i < 3} />
          ))}
        </div>
      ) : (
        <p className="text-muted mt-10">{t[lang].nothingYet}</p>
      )}

      <Pagination lang={lang} basePath={basePath} page={page} totalPages={totalPages} />
    </>
  );
}

export function PostList(props: Props) {
  return (
    <Suspense fallback={<div className="mt-10 min-h-64" aria-hidden />}>
      <PostListInner {...props} />
    </Suspense>
  );
}
