import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { homeQuery } from "@/sanity/queries";
import type { PostCard as PostCardType } from "@/sanity/types";
import { PostCard } from "@/components/PostCard";
import { ArticleRail } from "@/components/ArticleRail";
import { Movers } from "@/components/Movers";
import { SectionHeading } from "@/components/SectionHeading";
import { Newsletter } from "@/components/Newsletter";
import { href, isLang, t, type Lang } from "@/lib/i18n";
import { absolute, hreflangAlternates, SITE_URL } from "@/lib/site";

type HomeData = {
  featured: PostCardType[];
  latest: PostCardType[];
  categories: Array<{
    _id: string;
    title: string;
    slug: string;
    coinId?: string;
    posts: PostCardType[];
  }>;
};

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (isLang(raw) ? raw : "nl") as Lang;
  const dict = t[lang];

  return {
    title: `${dict.siteName} — ${dict.tagline}`,
    description:
      lang === "nl"
        ? "Dagelijks crypto nieuws over bitcoin, ethereum en de rest van de markt. Nuchter geschreven, zonder promoties."
        : "Daily crypto news on bitcoin, ethereum and the wider market. Written plainly, without promotions.",
    alternates: {
      canonical: `/${lang}`,
      languages: hreflangAlternates({ nl: "/nl", en: "/en" }),
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw as Lang;
  const dict = t[lang];

  const data = await sanityFetch<HomeData>({
    query: homeQuery,
    params: { lang },
    tags: ["post", "category"],
  });

  const featured = data?.featured ?? [];
  const latest = data?.latest ?? [];

  // Uitgelicht heeft voorrang; wat overblijft vult het raster.
  const lead = featured[0] ?? latest[0];
  const usedIds = new Set(lead ? [lead._id] : []);
  const secondary = [...featured.slice(1), ...latest]
    .filter((p) => !usedIds.has(p._id) && usedIds.add(p._id))
    .slice(0, 4);
  const rest = latest.filter((p) => !usedIds.has(p._id)).slice(0, 8);
  const sidebar = latest.filter((p) => !usedIds.has(p._id)).slice(0, 6);

  if (!lead) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="headline text-3xl">{dict.homeHeading}</h1>
        <p className="text-muted mt-4">{dict.nothingYet}</p>
      </div>
    );
  }

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: dict.siteName,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: absolute("/icon.svg") },
    description: dict.homeIntro,
    inLanguage: lang,
  };

  const siteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: dict.siteName,
    url: SITE_URL,
    inLanguage: lang,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absolute(href.search(lang))}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${dict.homeHeading} — ${dict.siteName}`,
    itemListElement: [lead, ...latest.filter((p) => p._id !== lead._id)]
      .slice(0, 10)
      .map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absolute(href.post(lang, post.slug)),
        name: post.title,
      })),
  };

  const railPosts = (featured.length ? featured : latest).slice(0, 6);
  const coinLinks = (data?.categories ?? []).map((c) => ({
    coinId: c.coinId,
    slug: c.slug,
    title: c.title,
  }));

  return (
    <div className="container-page py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([orgLd, siteLd, listLd]) }}
      />

      <header className="border-line mb-8 border-b pb-7">
        <h1 className="headline text-3xl sm:text-4xl">{dict.homeHeading}</h1>
        <p className="text-muted mt-3 max-w-[46rem] text-[0.98rem] leading-relaxed">
          {dict.homeIntro}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        {/* Leeslijst links: kort, genummerd, zonder beeld. */}
        <aside className="order-2 space-y-8 lg:order-1 lg:sticky lg:top-32 lg:self-start">
          <ArticleRail title={dict.railTitle} posts={railPosts} lang={lang} />

          {data?.categories?.length ? (
            <nav>
              <h2 className="text-subtle mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.09em]">
                {dict.categories}
              </h2>
              <ul className="divide-line divide-y">
                {data.categories.map((c) => (
                  <li key={c._id}>
                    <Link
                      href={href.category(lang, c.slug)}
                      className="block py-2.5 text-[0.88rem] hover:underline"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </aside>

        {/* Het nieuws zelf. */}
        <main className="order-1 min-w-0 lg:order-2">
          <PostCard post={lead} lang={lang} variant="hero" priority />

          {secondary.length ? (
            <section className="mt-12">
              <SectionHeading title={dict.latest} href={href.newsIndex(lang)} action={dict.allNews} />
              <div className="grid gap-8 sm:grid-cols-2">
                {secondary.map((post) => (
                  <PostCard key={post._id} post={post} lang={lang} />
                ))}
              </div>
            </section>
          ) : null}

          {rest.length ? (
            <section className="mt-14">
              <SectionHeading title={dict.allNews} href={href.newsIndex(lang)} action={dict.readMore} />
              <div className="grid gap-8 sm:grid-cols-2">
                {rest.map((post) => (
                  <PostCard key={post._id} post={post} lang={lang} />
                ))}
              </div>
            </section>
          ) : null}

          {(data?.categories ?? [])
            .filter((c) => c.posts?.length)
            .map((category) => (
              <section key={category._id} className="mt-14">
                <SectionHeading
                  title={category.title}
                  href={href.category(lang, category.slug)}
                  action={dict.readMore}
                />
                <div className="grid gap-8 sm:grid-cols-2">
                  {category.posts.map((post) => (
                    <PostCard key={post._id} post={post} lang={lang} />
                  ))}
                </div>
              </section>
            ))}
        </main>

        {/* Markt rechts: wat beweegt, met een pad naar het nieuws erachter. */}
        <aside className="order-3 space-y-8 lg:col-span-2 xl:col-span-1 xl:sticky xl:top-32 xl:self-start">
          <Movers lang={lang} coinLinks={coinLinks} />
        </aside>
      </div>

      <div className="mt-16">
        <Newsletter lang={lang} />
      </div>
    </div>
  );
}
