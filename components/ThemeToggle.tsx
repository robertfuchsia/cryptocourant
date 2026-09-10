"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle({ label }: { label: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next: Theme = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    // Sommige ingesloten onderdelen (o.a. X-berichten) kijken naar data-theme.
    root.dataset.theme = next;
    try {
      localStorage.setItem("cc-theme", next);
    } catch {
      /* private browsing */
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="text-muted hover:text-fg grid h-9 w-9 place-items-center rounded-full transition-colors"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[18px] w-[18px]">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[18px] w-[18px]">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

/** Zet het thema vóór de eerste paint, zodat de pagina niet flitst. */
export function ThemeScript() {
  const code = `(function(){try{var s=localStorage.getItem('cc-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;if(d)r.classList.add('dark');r.dataset.theme=d?'dark':'light'}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
