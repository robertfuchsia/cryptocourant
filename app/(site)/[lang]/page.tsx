import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { homeQuery } from "@/sanity/queries";
import type { PostCard as PostCardType } from "@/sanity/types";
import { PostCard } from "@/components/PostCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Newsletter } from "@/components/Newsletter";
import { href, isLang, t, type Lang } from "@/lib/i18n";
import { absolute, hreflangAlternates, SITE_URL } from "@/lib/site";

type HomeData = {
  featured: PostCardType[];
  latest: PostCardType[];
  categories: Array<{ _id: string; title: string; slug: string; posts: PostCardType[] }>;
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

  return (
    <div className="container-page py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([orgLd, siteLd, listLd]) }}
      />

      <header className="border-line mb-10 border-b pb-8">
        <h1 className="headline text-3xl sm:text-4xl">{dict.homeHeading}</h1>
        <p className="text-muted mt-3 max-w-[46rem] text-[0.98rem] leading-relaxed">
          {dict.homeIntro}
        </p>
      </header>

      <PostCard post={lead} lang={lang} variant="hero" priority />

      {secondary.length ? (
        <section className="mt-14">
          <SectionHeading title={dict.latest} href={href.newsIndex(lang)} action={dict.allNews} />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {secondary.map((post) => (
              <PostCard key={post._id} post={post} lang={lang} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          {rest.length ? (
            <>
              <SectionHeading title={dict.allNews} href={href.newsIndex(lang)} action={dict.readMore} />
              <div className="grid gap-8 sm:grid-cols-2">
                {rest.map((post) => (
                  <PostCard key={post._id} post={post} lang={lang} />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          {sidebar.length ? (
            <>
              <SectionHeading title={dict.latest} />
              <div className="border-line divide-line divide-y">
                {sidebar.map((post) => (
                  <div key={post._id} className="py-3.5 first:pt-0">
                    <PostCard post={post} lang={lang} variant="compact" />
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </aside>
      </div>

      {(data?.categories ?? [])
        .filter((c) => c.posts?.length)
        .map((category) => (
          <section key={category._id} className="mt-16">
            <SectionHeading
              title={category.title}
              href={href.category(lang, category.slug)}
              action={dict.readMore}
            />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {category.posts.map((post) => (
                <PostCard key={post._id} post={post} lang={lang} />
              ))}
            </div>
          </section>
        ))}

      <div className="mt-16">
        <Newsletter lang={lang} />
      </div>
    </div>
  );
}
