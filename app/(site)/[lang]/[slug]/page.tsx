import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/fetch";
import { pageQuery, pageSlugsQuery } from "@/sanity/queries";
import type { SitePage } from "@/sanity/types";
import { PortableBody } from "@/components/PortableBody";
import { href, isLang, type Lang } from "@/lib/i18n";

export const revalidate = 3600;

type Params = { lang: string; slug: string };

export async function generateStaticParams() {
  const rows = await sanityFetch<Array<{ slug: string; language: Lang }>>({
    query: pageSlugsQuery,
    tags: ["page"],
  });
  return (rows ?? []).map((r) => ({ lang: r.language, slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) return {};
  const lang = raw as Lang;
  const page = await sanityFetch<SitePage | null>({
    query: pageQuery,
    params: { lang, slug },
    tags: ["page"],
  });
  if (!page) return {};

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: href.page(lang, page.slug) },
  };
}

export default async function StaticPage({ params }: { params: Promise<Params> }) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw as Lang;

  const page = await sanityFetch<SitePage | null>({
    query: pageQuery,
    params: { lang, slug },
    tags: ["page"],
  });
  if (!page) notFound();

  return (
    <div className="container-page py-10 sm:py-16">
      <div className="mx-auto max-w-[46rem]">
        <h1 className="headline text-3xl sm:text-4xl">{page.title}</h1>
        {page.body ? (
          <div className="mt-8">
            <PortableBody value={page.body} lang={lang} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
