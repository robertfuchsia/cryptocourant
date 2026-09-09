import raw from "./content.json";
import * as Q from "../queries";
import type { Lang } from "@/lib/i18n";

/**
 * Demo-inhoud. Wordt alleen gebruikt als er geen Sanity-project is ingesteld
 * of als NEXT_PUBLIC_DEMO_MODE=1 staat, zodat je de site meteen kunt bekijken.
 */
type RawPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  featured: boolean;
  demoImage: string;
  language: Lang;
  categoryIds: string[];
  authorId: string;
  readingTime: number;
  body: unknown[];
  translationId: string | null;
  sources: Array<{ label: string; url: string }> | null;
};

type RawCategory = {
  _id: string;
  title: Record<Lang, string>;
  slug: string;
  slugEn: string;
  coinId: string | null;
  order: number;
};

type RawAuthor = {
  _id: string;
  name: string;
  slug: string;
  demo: number;
  role: Record<Lang, string>;
  bio: Record<Lang, string>;
  x: string | null;
};

const db = raw as unknown as {
  authors: RawAuthor[];
  categories: RawCategory[];
  posts: RawPost[];
};

const img = (src: string) => ({ _type: "image", demoSrc: src });

const author = (id: string, lang: Lang) => {
  const a = db.authors.find((x) => x._id === id);
  if (!a) return undefined;
  return {
    _id: a._id,
    name: a.name,
    slug: a.slug,
    image: img(`/demo/${a.demo}.svg`),
    role: a.role[lang],
    bio: a.bio[lang],
    x: a.x ?? undefined,
  };
};

const category = (id: string, lang: Lang) => {
  const c = db.categories.find((x) => x._id === id);
  if (!c) return undefined;
  return {
    _id: c._id,
    title: c.title[lang],
    slug: lang === "en" ? c.slugEn || c.slug : c.slug,
  };
};

const card = (p: RawPost, lang: Lang) => ({
  _id: p._id,
  title: p.title,
  slug: p.slug,
  excerpt: p.excerpt,
  publishedAt: p.publishedAt,
  featured: p.featured,
  mainImage: img(p.demoImage),
  readingTime: p.readingTime,
  author: author(p.authorId, lang),
  categories: p.categoryIds
    .map((c) => category(c, lang))
    .filter((c): c is NonNullable<typeof c> => Boolean(c)),
});

const byLang = (lang: Lang) =>
  db.posts
    .filter((p) => p.language === lang)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function demoResult(query: string, params: Record<string, unknown>): unknown {
  const lang = (params.lang as Lang) ?? "nl";
  const posts = byLang(lang);

  if (query === Q.settingsQuery) {
    return {
      title: "CryptoCourant",
      description: {
        nl: "Dagelijks crypto nieuws in het Nederlands en Engels. Geen presales, geen promoties.",
        en: "Daily crypto news in Dutch and English. No presales, no promotions.",
      },
      tickerCoins: ["bitcoin", "ethereum", "ripple", "solana", "cardano"],
      social: { x: "https://x.com", linkedin: "https://linkedin.com" },
    };
  }

  if (query === Q.navCategoriesQuery) {
    return db.categories
      .sort((a, b) => a.order - b.order)
      .map((c) => category(c._id, lang));
  }

  if (query === Q.footerPagesQuery) {
    return [
      { _id: "pg1", title: lang === "nl" ? "Over ons" : "About", slug: lang === "nl" ? "over-ons" : "about" },
      { _id: "pg2", title: lang === "nl" ? "Redactiestatuut" : "Editorial policy", slug: lang === "nl" ? "redactiestatuut" : "editorial-policy" },
      { _id: "pg3", title: lang === "nl" ? "Contact" : "Contact", slug: "contact" },
    ];
  }

  if (query === Q.homeQuery) {
    return {
      featured: posts.filter((p) => p.featured).map((p) => card(p, lang)),
      latest: posts.map((p) => card(p, lang)),
      categories: db.categories
        .sort((a, b) => a.order - b.order)
        .slice(0, 3)
        .map((c) => ({
          ...category(c._id, lang)!,
          posts: posts.filter((p) => p.categoryIds.includes(c._id)).map((p) => card(p, lang)),
        }))
        .filter((c) => c.posts.length > 0),
    };
  }

  if (query === Q.postSlugsQuery) {
    return db.posts.map((p) => ({ slug: p.slug, language: p.language }));
  }

  if (query === Q.postQuery) {
    const p = posts.find((x) => x.slug === params.slug);
    if (!p) return null;
    const other = db.posts.find((x) => x._id === p.translationId);
    return {
      ...card(p, lang),
      body: p.body,
      sources: p.sources ?? undefined,
      translation: other ? { slug: other.slug, language: other.language, title: other.title } : null,
    };
  }

  if (query === Q.relatedQuery) {
    return posts
      .filter((p) => p._id !== params.id)
      .slice(0, 3)
      .map((p) => card(p, lang));
  }

  if (query === Q.newsIndexQuery) {
    const from = Number(params.from ?? 0);
    const to = Number(params.to ?? 12);
    return { items: posts.slice(from, to).map((p) => card(p, lang)), total: posts.length };
  }

  if (query === Q.categoryQuery) {
    const c = db.categories.find(
      (x) => x.slug === params.slug || x.slugEn === params.slug
    );
    if (!c) return null;
    return {
      ...category(c._id, lang)!,
      description:
        lang === "nl"
          ? `Al het nieuws over ${c.title.nl}, elke dag bijgewerkt.`
          : `All the news on ${c.title.en}, updated daily.`,
      coinId: c.coinId ?? undefined,
    };
  }

  if (query === Q.categorySlugsQuery) {
    return db.categories.map((c) => ({ nl: c.slug, en: c.slugEn || c.slug }));
  }

  if (query === Q.categoryPostsQuery) {
    const items = posts.filter((p) => p.categoryIds.includes(String(params.id)));
    const from = Number(params.from ?? 0);
    const to = Number(params.to ?? 12);
    return { items: items.slice(from, to).map((p) => card(p, lang)), total: items.length };
  }

  if (query === Q.authorQuery) {
    const a = db.authors.find((x) => x.slug === params.slug);
    return a ? author(a._id, lang) : null;
  }

  if (query === Q.authorSlugsQuery) {
    return db.authors.map((a) => ({ slug: a.slug }));
  }

  if (query === Q.authorPostsQuery) {
    const items = posts.filter((p) => p.authorId === String(params.id));
    const from = Number(params.from ?? 0);
    const to = Number(params.to ?? 12);
    return { items: items.slice(from, to).map((p) => card(p, lang)), total: items.length };
  }

  if (query === Q.searchQuery) {
    const q = String(params.q ?? "").replace(/\*$/, "").toLowerCase();
    return posts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)
      )
      .map((p) => card(p, lang));
  }

  if (query === Q.pageSlugsQuery) return [];
  if (query === Q.pageQuery) return null;

  if (query === Q.sitemapQuery) {
    return {
      posts: db.posts.map((p) => ({
        slug: p.slug,
        language: p.language,
        publishedAt: p.publishedAt,
      })),
      pages: [],
      categories: db.categories.map((c) => ({ nl: c.slug, en: c.slugEn || c.slug })),
      authors: db.authors.map((a) => ({ slug: a.slug })),
    };
  }

  if (query === Q.feedQuery) {
    return posts.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      publishedAt: p.publishedAt,
      author: { name: db.authors.find((a) => a._id === p.authorId)?.name },
      categories: p.categoryIds.map((c) => ({ title: category(c, lang)?.title })),
    }));
  }

  return null;
}
