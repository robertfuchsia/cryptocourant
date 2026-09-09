"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { href, t, type Lang } from "@/lib/i18n";
import type { CategoryLite } from "@/sanity/types";

export function MobileNav({
  lang,
  categories,
}: {
  lang: Lang;
  categories: CategoryLite[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dict = t[lang];

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dict.menu}
        aria-expanded={open}
        className="text-muted hover:text-fg -ml-2 grid h-9 w-9 place-items-center rounded-full lg:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div className="bg-page fixed inset-0 z-[60] lg:hidden">
          <div className="container-page flex h-16 items-center justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={dict.close}
              className="text-muted hover:text-fg -mr-2 grid h-9 w-9 place-items-center rounded-full"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav className="container-page flex flex-col gap-1 pt-4" aria-label={dict.categories}>
            <Link href={href.home(lang)} className="headline border-line border-b py-3 text-2xl">
              {dict.latest}
            </Link>
            {categories.map((c) => (
              <Link
                key={c._id}
                href={href.category(lang, c.slug)}
                className="headline border-line border-b py-3 text-2xl"
              >
                {c.title}
              </Link>
            ))}
            <Link href={href.search(lang)} className="text-muted py-3 text-base">
              {dict.searchTitle}
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
