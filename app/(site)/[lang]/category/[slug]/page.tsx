import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { categoryPostsQuery, categoryQuery, categorySlugsQuery } from "@/sanity/queries";
import type { Category, Paginated, PostCard as PostCardType } from "@/sanity/types";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { CoinHeader } from "@/components/Ticker";
import { href, isLang, t, type Lang } from "@/lib/i18n";
import { POSTS_PER_PAGE, hreflangAlternates, pageRange, parsePage } from "@/lib/site";

export const revalidate = 60;

type Params = { lang: string; slug: string };

export async function generateStaticParams() {
  const rows = await sanityFetch<Array<{ nl: string; en: string }>>({
    query: categorySlugsQuery,
    tags: ["category"],
  });
  return (rows ?? []).flatMap((r) => [
    { lang: "nl", slug: r.nl },
    { lang: "en", slug: r.en },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) return {};
  const lang = raw as Lang;
  const category = await sanityFetch<Category | null>({
    query: categoryQuery,
    params: { lang, slug },
    tags: ["category"],
  });
  if (!category) return {};

  const nl = await sanityFetch<Category | null>({
    query: categoryQuery,
    params: { lang: "nl", slug },
    tags: ["category"],
  });
  const en = await sanityFetch<Category | null>({
    query: categoryQuery,
    params: { lang: "en", slug },
    tags: ["category"],
  });

  return {
    title: `${category.title} — ${t[lang].inCategory.toLowerCase()} ${category.title}`.slice(0, 65),
    description:
      category.description ??
      `${t[lang].inCategory} ${category.title}. ${t[lang].tagline}.`,
    alternates: {
      canonical: href.category(lang, category.slug),
      languages: hreflangAlternates({
        nl: nl ? href.category("nl", nl.slug) : undefined,
        en: en ? href.category("en", en.slug) : undefined,
      }),
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw as Lang;
  const dict = t[lang];

  const category = await sanityFetch<Category | null>({
    query: categoryQuery,
    params: { lang, slug },
    tags: ["category"],
  });
  if (!category) notFound();

  const page = parsePage((await searchParams).page);
  const { from, to } = pageRange(page);

  const data = await sanityFetch<Paginated<PostCardType>>({
    query: categoryPostsQuery,
    params: { lang, id: category._id, from, to },
    tags: ["post"],
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / POSTS_PER_PAGE));

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="text-subtle text-xs font-semibold uppercase tracking-[0.1em]">
          {dict.inCategory}
        </p>
        <h1 className="headline mt-2 text-3xl sm:text-4xl">{category.title}</h1>
        {category.description ? (
          <p className="text-muted mt-3 leading-relaxed">{category.description}</p>
        ) : null}
        {category.coinId ? <CoinHeader lang={lang} coinId={category.coinId} /> : null}
      </header>

      {items.length ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post, i) => (
            <PostCard key={post._id} post={post} lang={lang} priority={i < 3} />
          ))}
        </div>
      ) : (
        <p className="text-muted mt-10">{dict.nothingYet}</p>
      )}

      <Pagination
        lang={lang}
        basePath={href.category(lang, category.slug)}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
