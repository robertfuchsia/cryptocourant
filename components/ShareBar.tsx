"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

export function ShareBar({
  lang,
  url,
  title,
}: {
  lang: Lang;
  url: string;
  title: string;
}) {
  const dict = t[lang];
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard geblokkeerd */
    }
  }

  const items = [
    {
      label: "X",
      href: `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
  ];

  return (
    <div className="border-line flex flex-wrap items-center gap-2 border-y py-3">
      <span className="text-subtle mr-1 text-xs font-semibold uppercase tracking-[0.08em]">
        {dict.share}
      </span>
      {items.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener nofollow"
          className="border-line text-muted hover:text-fg rounded-full border px-3 py-1 text-xs font-medium transition-colors"
        >
          {s.label}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        className="border-line text-muted hover:text-fg rounded-full border px-3 py-1 text-xs font-medium transition-colors"
      >
        {copied ? dict.copied : dict.copyLink}
      </button>
    </div>
  );
}
