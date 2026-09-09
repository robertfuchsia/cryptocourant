import Link from "next/link";
import { getQuotes, formatChange, formatPrice } from "@/lib/markets";
import type { Lang } from "@/lib/i18n";

export async function Ticker({ lang, coins }: { lang: Lang; coins: string[] }) {
  const quotes = await getQuotes(coins);
  if (!quotes.length) return null;

  const items = [...quotes, ...quotes];

  return (
    <div className="border-line bg-soft overflow-hidden border-b">
      <div className="relative flex">
        <div className="marquee flex shrink-0 items-center gap-7 py-2 pr-7">
          {items.map((q, i) => (
            <span
              key={`${q.id}-${i}`}
              className="flex shrink-0 items-center gap-2 text-[0.78rem] whitespace-nowrap"
              aria-hidden={i >= quotes.length}
            >
              <span className="font-semibold">{q.symbol}</span>
              <span className="text-muted tabular-nums">{formatPrice(q.price, lang)}</span>
              <span
                className="font-medium tabular-nums"
                style={{ color: q.change24h >= 0 ? "var(--color-up)" : "var(--color-down)" }}
              >
                {formatChange(q.change24h, lang)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function PriceTable({ lang, coins }: { lang: Lang; coins: string[] }) {
  const quotes = await getQuotes(coins);
  if (!quotes.length) return null;

  return (
    <div className="border-line bg-soft my-8 overflow-hidden rounded-[var(--radius-card)] border">
      <table className="w-full text-sm">
        <tbody>
          {quotes.map((q) => (
            <tr key={q.id} className="border-line border-b last:border-b-0">
              <td className="px-4 py-3 font-medium">
                {q.name} <span className="text-subtle">{q.symbol}</span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatPrice(q.price, lang)}
              </td>
              <td
                className="px-4 py-3 text-right font-medium tabular-nums"
                style={{ color: q.change24h >= 0 ? "var(--color-up)" : "var(--color-down)" }}
              >
                {formatChange(q.change24h, lang)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-subtle border-line border-t px-4 py-2 text-[0.7rem]">
        <Link href="https://www.coingecko.com" rel="nofollow noopener" target="_blank" className="hover:underline">
          CoinGecko
        </Link>
      </p>
    </div>
  );
}

export async function CoinHeader({ lang, coinId }: { lang: Lang; coinId: string }) {
  const [quote] = await getQuotes([coinId]);
  if (!quote) return null;

  return (
    <div className="border-line bg-soft mt-5 inline-flex items-center gap-3 rounded-full border px-4 py-2">
      <span className="text-sm font-semibold">{quote.symbol}</span>
      <span className="text-sm tabular-nums">{formatPrice(quote.price, lang)}</span>
      <span
        className="text-sm font-medium tabular-nums"
        style={{ color: quote.change24h >= 0 ? "var(--color-up)" : "var(--color-down)" }}
      >
        {formatChange(quote.change24h, lang)}
      </span>
    </div>
  );
}
