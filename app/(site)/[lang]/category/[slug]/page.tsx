import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { PostList } from "@/components/PostList";
import { categoryPostsQuery, categoryQuery, categorySlugsQuery } from "@/sanity/queries";
import type { Category } from "@/sanity/types";
import { CoinHeader } from "@/components/Ticker";
import { href, isLang, t, type Lang } from "@/lib/i18n";
import { hreflangAlternates } from "@/lib/site";

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

      <PostList
        lang={lang}
        query={categoryPostsQuery}
        params={{ id: category._id }}
        basePath={href.category(lang, category.slug)}
        searchParams={searchParams}
      />

    </div>
  );
}
