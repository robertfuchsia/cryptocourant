import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { postQuery, postSlugsQuery, relatedQuery } from "@/sanity/queries";
import type { Post, PostCard as PostCardType } from "@/sanity/types";
import { PortableBody, headings } from "@/components/PortableBody";
import { PriceSince } from "@/components/PriceSince";
import { PostCard } from "@/components/PostCard";
import { SanityImage } from "@/components/SanityImage";
import { SectionHeading } from "@/components/SectionHeading";
import { ShareBar } from "@/components/ShareBar";
import { CategoryPill } from "@/components/Pill";
import { formatDate, formatDateTime, href, isLang, t, type Lang } from "@/lib/i18n";
import { SITE_URL, absolute, hreflangAlternates } from "@/lib/site";
import { imageUrl } from "@/sanity/image";

export const revalidate = 60;

type Params = { lang: string; slug: string };

export async function generateStaticParams() {
  const rows = await sanityFetch<Array<{ slug: string; language: Lang }>>({
    query: postSlugsQuery,
    tags: ["post"],
  });
  return (rows ?? []).map((r) => ({ lang: r.language, slug: r.slug }));
}

async function getPost(lang: Lang, slug: string) {
  return sanityFetch<Post | null>({
    query: postQuery,
    params: { lang, slug },
    tags: ["post"],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) return {};
  const lang = raw as Lang;
  const post = await getPost(lang, slug);
  if (!post) return {};

  const canonical = href.post(lang, post.slug);
  const other = post.translation;
  const languages = hreflangAlternates({
    [lang]: canonical,
    ...(other ? { [other.language]: href.post(other.language, other.slug) } : {}),
  } as Record<Lang, string>);

  const ogImage = imageUrl(post.mainImage, 1200, 630) ?? absolute(`/${lang}/opengraph-image`);

  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical, languages },
    robots: post.noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: absolute(canonical),
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: post.author ? [post.author.name] : undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw as Lang;
  const dict = t[lang];

  const post = await getPost(lang, slug);
  if (!post) notFound();

  const related = await sanityFetch<PostCardType[]>({
    query: relatedQuery,
    params: {
      lang,
      id: post._id,
      categoryIds: (post.categories ?? []).map((c) => c._id),
    },
    tags: ["post"],
  });

  const toc = headings(post.body);
  const url = absolute(href.post(lang, post.slug));
  const ogImage = imageUrl(post.mainImage, 1200, 630);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: ogImage ? [ogImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: lang,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
          url: absolute(href.author(lang, post.author.slug)),
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: dict.siteName,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: absolute("/icon.svg") },
    },
    articleSection: post.categories?.[0]?.title,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.siteName, item: absolute(href.home(lang)) },
      ...(post.categories?.[0]
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: post.categories[0].title,
              item: absolute(href.category(lang, post.categories[0].slug)),
            },
          ]
        : []),
      { "@type": "ListItem", position: post.categories?.[0] ? 3 : 2, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <article className="container-page py-8 sm:py-12">
        <nav
          className="text-subtle mx-auto mb-5 flex max-w-[46rem] flex-wrap items-center gap-2 text-xs"
          aria-label="Breadcrumb"
        >
          <Link href={href.home(lang)} className="hover:underline">
            {dict.siteName}
          </Link>
          {post.categories?.[0] ? (
            <>
              <span aria-hidden="true">/</span>
              <Link href={href.category(lang, post.categories[0].slug)} className="hover:underline">
                {post.categories[0].title}
              </Link>
            </>
          ) : null}
        </nav>

        <header className="mx-auto max-w-[46rem]">
          {post.categories?.length ? (
            <div className="mb-3 flex flex-wrap gap-3">
              {post.categories.map((c) => (
                <CategoryPill key={c._id} category={c} lang={lang} />
              ))}
            </div>
          ) : null}

          <h1 className="headline text-3xl sm:text-4xl lg:text-[2.9rem]">{post.title}</h1>
          <p className="text-muted mt-4 text-lg leading-relaxed">{post.excerpt}</p>

          <div className="text-subtle mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {post.author ? (
              <>
                <Link
                  href={href.author(lang, post.author.slug)}
                  className="text-fg font-medium hover:underline"
                >
                  {post.author.name}
                </Link>
                <span aria-hidden="true">·</span>
              </>
            ) : null}
            <time dateTime={post.publishedAt}>{formatDateTime(post.publishedAt, lang)}</time>
            <span aria-hidden="true">·</span>
            <span>{dict.readingTime(post.readingTime)}</span>
            {post.updatedAt ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {dict.updated} {formatDate(post.updatedAt, lang)}
                </span>
              </>
            ) : null}
          </div>
        </header>

        <figure className="mx-auto mt-8 max-w-[56rem]">
          <SanityImage
            image={post.mainImage}
            alt={post.mainImage?.alt ?? post.title}
            width={1200}
            height={600}
            priority
            quality={90}
            sizes="(min-width: 1024px) 900px, 100vw"
            className="aspect-[2/1] w-full rounded-[var(--radius-card)] object-cover"
          />
          {post.mainImage?.credit ? (
            <figcaption className="text-subtle mt-2 text-xs">{post.mainImage.credit}</figcaption>
          ) : null}
        </figure>

        <PriceSince
          coinId={post.coin || post.categories?.find((c) => c.coinId)?.coinId}
          publishedAt={post.publishedAt}
          lang={lang}
        />

        <div className="mx-auto mt-10 max-w-[46rem]">
          {toc.length >= 3 ? (
            <nav className="border-line bg-soft mb-9 rounded-[var(--radius-card)] border p-5" aria-label={dict.toc}>
              <p className="text-subtle mb-3 text-xs font-semibold uppercase tracking-[0.08em]">
                {dict.toc}
              </p>
              <ol className="space-y-2">
                {toc.map((h, i) => (
                  <li key={h.id} className="flex gap-3 text-sm">
                    <span className="text-subtle tabular-nums">{i + 1}.</span>
                    <a href={`#${h.id}`} className="link-underline">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <PortableBody value={post.body} lang={lang} />

          {post.sources?.length ? (
            <section className="mt-12">
              <h2 className="text-subtle mb-3 text-xs font-semibold uppercase tracking-[0.08em]">
                {dict.sources}
              </h2>
              <ul className="space-y-1.5">
                {post.sources.map((s) => (
                  <li key={s.url} className="text-sm">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener nofollow"
                      className="text-muted hover:text-fg link-underline"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-10">
            <ShareBar lang={lang} url={url} title={post.title} />
          </div>

          {post.author?.bio ? (
            <section className="border-line mt-10 flex gap-4 rounded-[var(--radius-card)] border p-5">
              {post.author.image ? (
                <SanityImage
                  image={post.author.image}
                  alt={post.author.name}
                  width={120}
                  height={120}
                  sizes="60px"
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
              ) : null}
              <div>
                <Link
                  href={href.author(lang, post.author.slug)}
                  className="font-semibold hover:underline"
                >
                  {post.author.name}
                </Link>
                {post.author.role ? (
                  <p className="text-subtle text-xs">{post.author.role}</p>
                ) : null}
                <p className="text-muted mt-2 text-sm leading-relaxed">{post.author.bio}</p>
              </div>
            </section>
          ) : null}
        </div>

        {related?.length ? (
          <section className="mt-16">
            <SectionHeading title={dict.relatedTitle} />
            <div className="grid gap-8 sm:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p._id} post={p} lang={lang} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </>
  );
}
