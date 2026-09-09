"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

export function Newsletter({ lang }: { lang: Lang }) {
  const dict = t[lang];
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="border-line bg-soft rounded-[var(--radius-card)] border p-6 sm:p-8">
      <h2 className="headline text-xl sm:text-2xl">{dict.newsletterTitle}</h2>
      <p className="text-muted mt-2 max-w-lg text-sm leading-relaxed">
        {dict.newsletterBody}
      </p>

      {done ? (
        <p className="text-accent mt-5 text-sm font-medium">{dict.newsletterThanks}</p>
      ) : (
        <form
          className="mt-5 flex max-w-md flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            // Koppel hier je maildienst (Mailchimp, Buttondown, Resend).
            setDone(true);
          }}
        >
          <label className="sr-only" htmlFor="newsletter-email">
            {dict.newsletterPlaceholder}
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={dict.newsletterPlaceholder}
            className="bg-page border-line min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-accent on-accent rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          >
            {dict.newsletterButton}
          </button>
        </form>
      )}
      <p className="text-subtle mt-3 text-xs">{dict.newsletterNote}</p>
    </section>
  );
}
