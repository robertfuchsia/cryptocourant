import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { footerPagesQuery, navCategoriesQuery, settingsQuery } from "@/sanity/queries";
import type { CategoryLite, Settings } from "@/sanity/types";
import { href, t, type Lang } from "@/lib/i18n";
import { Wordmark } from "./Wordmark";

type FooterPage = { _id: string; title: string; slug: string };

export async function Footer({ lang }: { lang: Lang }) {
  const dict = t[lang];

  const [categories, pages, settings] = await Promise.all([
    sanityFetch<CategoryLite[]>({
      query: navCategoriesQuery,
      params: { lang },
      tags: ["category"],
    }),
    sanityFetch<FooterPage[]>({
      query: footerPagesQuery,
      params: { lang },
      tags: ["page"],
    }),
    sanityFetch<Settings | null>({ query: settingsQuery, tags: ["siteSettings"] }),
  ]);

  const social = [
    { label: "X", url: settings?.social?.x },
    { label: "LinkedIn", url: settings?.social?.linkedin },
    { label: "YouTube", url: settings?.social?.youtube },
    { label: "Telegram", url: settings?.social?.telegram },
  ].filter((s): s is { label: string; url: string } => Boolean(s.url));

  return (
    <footer className="border-line mt-20 border-t">
      <div className="container-page py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Wordmark />
            <p className="text-muted mt-3 max-w-sm text-sm leading-relaxed">
              {settings?.description?.[lang] ?? dict.tagline}
            </p>
            {social.length ? (
              <div className="mt-5 flex flex-wrap gap-4">
                {social.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener"
                    className="text-muted hover:text-fg text-sm transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <h2 className="text-subtle text-xs font-semibold uppercase tracking-[0.08em]">
              {dict.categories}
            </h2>
            <ul className="mt-3 space-y-2">
              {(categories ?? []).map((c) => (
                <li key={c._id}>
                  <Link
                    href={href.category(lang, c.slug)}
                    className="text-muted hover:text-fg text-sm transition-colors"
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-subtle text-xs font-semibold uppercase tracking-[0.08em]">
              {dict.siteName}
            </h2>
            <ul className="mt-3 space-y-2">
              {(pages ?? []).map((p) => (
                <li key={p._id}>
                  <Link
                    href={href.page(lang, p.slug)}
                    className="text-muted hover:text-fg text-sm transition-colors"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={href.rss(lang)}
                  className="text-muted hover:text-fg text-sm transition-colors"
                >
                  RSS
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-line mt-10 border-t pt-6">
          <p className="text-subtle max-w-3xl text-xs leading-relaxed">{dict.disclaimer}</p>
          <p className="text-subtle mt-3 text-xs">
            © {new Date().getFullYear()} {settings?.title ?? dict.siteName}
          </p>
        </div>
      </div>
    </footer>
  );
}
