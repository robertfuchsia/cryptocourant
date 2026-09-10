import { compact, getDerivatives } from "@/lib/marketdata";
import type { Lang } from "@/lib/i18n";

/**
 * Derivatenstand voor bitcoin. Positieve funding betekent dat longs betalen
 * om hun positie aan te houden: de markt zit vol aan de kooprkant. Open
 * interest zegt hoeveel geld er open staat, de balk hoe de rekeningen staan.
 */
export async function Derivatives({ lang }: { lang: Lang }) {
  const d = await getDerivatives();
  if (!d) return null;

  const nl = lang === "nl";
  const locale = nl ? "nl-NL" : "en-GB";
  const fundingPositive = d.fundingRate >= 0;

  const longPct = d.longShort ? (d.longShort / (1 + d.longShort)) * 100 : null;

  return (
    <section className="border-line bg-soft rounded-[var(--radius-card)] border p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[0.95rem] font-semibold tracking-tight">
          {nl ? "Bitcoin derivaten" : "Bitcoin derivatives"}
        </h2>
        <span className="text-subtle text-[0.68rem]">BTC-USDT</span>
      </div>

      <dl className="divide-line divide-y">
        <div className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0">
          <dt className="text-[0.8rem]">{nl ? "Financieringsrente" : "Funding rate"}</dt>
          <dd
            className="text-[0.85rem] font-semibold tabular-nums"
            style={{ color: fundingPositive ? "var(--color-up)" : "var(--color-down)" }}
          >
            {fundingPositive ? "+" : "−"}
            {new Intl.NumberFormat(locale, {
              minimumFractionDigits: 4,
              maximumFractionDigits: 4,
            }).format(Math.abs(d.fundingRate))}
            %
          </dd>
        </div>

        {d.openInterestUsd > 0 ? (
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-[0.8rem]">{nl ? "Open interest" : "Open interest"}</dt>
            <dd className="text-[0.85rem] font-semibold tabular-nums">
              {compact(d.openInterestUsd, lang)}
            </dd>
          </div>
        ) : null}

        {longPct != null ? (
          <div className="py-2.5 last:pb-0">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[0.8rem]">{nl ? "Long tegen short" : "Long vs short"}</dt>
              <dd className="text-[0.85rem] font-semibold tabular-nums">
                {longPct.toFixed(0)}% / {(100 - longPct).toFixed(0)}%
              </dd>
            </div>
            <div
              className="mt-2 flex h-1.5 overflow-hidden rounded-full"
              style={{ background: "var(--line)" }}
            >
              <span
                style={{ width: `${longPct}%`, background: "var(--color-up)" }}
                aria-hidden="true"
              />
              <span
                style={{ width: `${100 - longPct}%`, background: "var(--color-down)" }}
                aria-hidden="true"
              />
            </div>
          </div>
        ) : null}
      </dl>

      <p className="text-subtle mt-3 text-[0.66rem] leading-relaxed">
        {nl
          ? "Positieve funding betekent dat longs betalen om open te blijven. Bron: OKX."
          : "Positive funding means longs pay to stay open. Source: OKX."}
      </p>
    </section>
  );
}
