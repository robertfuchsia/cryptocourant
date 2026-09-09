"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { DEFAULT_LANG, LANGUAGES, type Lang } from "@/lib/i18n";

/**
 * Wijst naar de vertaling van de huidige pagina.
 * De hreflang-tag in de <head> is leidend; anders wordt het pad omgezet.
 */
const SEGMENT_MAP: Record<string, string> = {
  nieuws: "news",
  news: "nieuws",
  categorie: "category",
  category: "categorie",
  auteur: "author",
  author: "auteur",
  zoeken: "search",
  search: "zoeken",
};

export function LangSwitch({ lang, label }: { lang: Lang; label: string }) {
  const pathname = usePathname();
  const other = LANGUAGES.find((l) => l !== lang) ?? DEFAULT_LANG;
  const [target, setTarget] = useState(`/${other}`);

  useEffect(() => {
    const tag = document.querySelector<HTMLLinkElement>(
      `link[rel="alternate"][hreflang="${other}"]`
    );
    if (tag?.href) {
      try {
        setTarget(new URL(tag.href).pathname);
        return;
      } catch {
        /* val terug op het pad */
      }
    }
    const parts = (pathname ?? `/${lang}`).split("/").filter(Boolean);
    parts[0] = other;
    if (parts[1] && SEGMENT_MAP[parts[1]]) parts[1] = SEGMENT_MAP[parts[1]];
    setTarget("/" + parts.join("/"));
  }, [pathname, lang, other]);

  return (
    <Link
      href={target}
      hrefLang={other}
      className="text-muted hover:text-fg rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors"
    >
      {label}
    </Link>
  );
}
