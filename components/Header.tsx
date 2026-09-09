import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import { navCategoriesQuery, settingsQuery } from "@/sanity/queries";
import type { CategoryLite, Settings } from "@/sanity/types";
import { href, t, type Lang } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { LangSwitch } from "./LangSwitch";
import { MobileNav } from "./MobileNav";
import { Ticker } from "./Ticker";
import { Wordmark } from "./Wordmark";

export async function Header({ lang }: { lang: Lang }) {
  const dict = t[lang];

  const [categories, settings] = await Promise.all([
    sanityFetch<CategoryLite[]>({
      query: navCategoriesQuery,
      params: { lang },
      tags: ["category"],
    }),
    sanityFetch<Settings | null>({ query: settingsQuery, tags: ["siteSettings"] }),
  ]);

  const nav = (categories ?? []).slice(0, 6);
  const coins = settings?.tickerCoins?.length
    ? settings.tickerCoins
    : ["bitcoin", "ethereum", "ripple", "solana"];

  return (
    <>
      {/* De koersbalk scrollt weg, de navigatie blijft staan. */}
      <Ticker lang={lang} coins={coins} />

      <header className="border-line bg-page/85 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4">
          <MobileNav lang={lang} categories={nav} />

          <Link href={href.home(lang)} className="shrink-0" aria-label={dict.siteName}>
            <Wordmark />
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-6 lg:flex" aria-label={dict.categories}>
            {nav.map((c) => (
              <Link
                key={c._id}
                href={href.category(lang, c.slug)}
                className="text-muted hover:text-fg text-sm font-medium transition-colors"
              >
                {c.title}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href={href.search(lang)}
              aria-label={dict.searchTitle}
              className="text-muted hover:text-fg grid h-9 w-9 place-items-center rounded-full transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px]">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </Link>
            <LangSwitch lang={lang} label={dict.switchTo} />
            <ThemeToggle label="Thema" />
          </div>
        </div>
      </header>
    </>
  );
}
