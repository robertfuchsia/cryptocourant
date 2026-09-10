import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { authorPostsQuery, authorQuery, authorSlugsQuery } from "@/sanity/queries";
import type { Author } from "@/sanity/types";
import { PostList } from "@/components/PostList";
import { SanityImage } from "@/components/SanityImage";
import { href, isLang, t, type Lang } from "@/lib/i18n";
import { absolute, hreflangAlternates } from "@/lib/site";

export const revalidate = 300;

type Params = { lang: string; slug: string };

export async function generateStaticParams() {
  const rows = await sanityFetch<Array<{ slug: string }>>({
    query: authorSlugsQuery,
    tags: ["author"],
  });
  return (rows ?? []).flatMap((r) => [
    { lang: "nl", slug: r.slug },
    { lang: "en", slug: r.slug },
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
  const author = await sanityFetch<Author | null>({
    query: authorQuery,
    params: { lang, slug },
    tags: ["author"],
  });
  if (!author) return {};

  return {
    title: author.name,
    description: author.bio ?? `${t[lang].byAuthor} ${author.name}`,
    alternates: {
      canonical: href.author(lang, author.slug),
      languages: hreflangAlternates({
        nl: href.author("nl", author.slug),
        en: href.author("en", author.slug),
      }),
    },
  };
}

export default async function AuthorPage({
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

  const author = await sanityFetch<Author | null>({
    query: authorQuery,
    params: { lang, slug },
    tags: ["author"],
  });
  if (!author) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    url: absolute(href.author(lang, author.slug)),
    sameAs: [author.x ? `https://x.com/${author.x}` : null, author.linkedin].filter(Boolean),
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {author.image ? (
          <SanityImage
            image={author.image}
            alt={author.name}
            width={200}
            height={200}
            sizes="88px"
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : null}
        <div>
          <h1 className="headline text-3xl sm:text-4xl">{author.name}</h1>
          {author.role ? <p className="text-subtle mt-1 text-sm">{author.role}</p> : null}
          {author.bio ? (
            <p className="text-muted mt-3 max-w-2xl leading-relaxed">{author.bio}</p>
          ) : null}
          <div className="mt-3 flex gap-4">
            {author.x ? (
              <a
                href={`https://x.com/${author.x}`}
                target="_blank"
                rel="noopener"
                className="text-muted hover:text-fg text-sm"
              >
                X
              </a>
            ) : null}
            {author.linkedin ? (
              <a
                href={author.linkedin}
                target="_blank"
                rel="noopener"
                className="text-muted hover:text-fg text-sm"
              >
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <h2 className="text-subtle border-line mt-12 border-b pb-3 text-xs font-semibold uppercase tracking-[0.1em]">
        {dict.byAuthor} {author.name}
      </h2>

      <PostList
        lang={lang}
        query={authorPostsQuery}
        params={{ id: author._id }}
        basePath={href.author(lang, author.slug)}
        searchParams={searchParams}
        gridClassName="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      />

    </div>
  );
}
