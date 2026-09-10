import { formatChange, formatPrice, getPriceOnDate, getQuotes } from "@/lib/markets";
import { formatDate, type Lang } from "@/lib/i18n";

/** De historische koers is een dagslot, dus vandaag valt er niets te vergelijken. */
function isEarlierDay(iso: string) {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return false;
  const today = new Date();
  return (
    Date.UTC(then.getUTCFullYear(), then.getUTCMonth(), then.getUTCDate()) <
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
}

/**
 * Wat de koers deed sinds dit artikel verscheen.
 *
 * Een nieuwsartikel noemt harde niveaus en veroudert daardoor snel. Dit
 * strookje zet de koers van de publicatiedag naast de koers van nu, zodat een
 * lezer meteen ziet of de cijfers in de tekst nog kloppen. De historische
 * koers komt van CoinGecko en verandert niet meer, dus die blijft een dag in
 * de cache staan.
 */
export async function PriceSince({
  coinId,
  publishedAt,
  lang,
}: {
  coinId?: string;
  publishedAt?: string;
  lang: Lang;
}) {
  if (!coinId || !publishedAt) return null;

  if (!isEarlierDay(publishedAt)) return null;

  const [quotes, then] = await Promise.all([
    getQuotes([coinId]),
    getPriceOnDate(coinId, publishedAt),
  ]);

  const now = quotes[0];
  if (!now || !then) return null;

  const change = ((now.price - then) / then) * 100;
  const up = change >= 0;
  const nl = lang === "nl";

  return (
    <aside className="border-line bg-soft mx-auto mt-6 max-w-[46rem] rounded-[var(--radius-card)] border px-4 py-3">
      <p className="text-subtle text-[0.66rem] font-semibold uppercase tracking-[0.09em]">
        {nl ? `${now.symbol} sinds dit artikel` : `${now.symbol} since this article`}
      </p>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[0.95rem]">
        <span className="text-muted tabular-nums">
          {formatDate(publishedAt, lang)} {formatPrice(then, lang)}
        </span>
        <span className="text-subtle" aria-hidden="true">
          →
        </span>
        <span className="font-semibold tabular-nums">
          {nl ? "nu" : "now"} {formatPrice(now.price, lang)}
        </span>
        <span
          className="font-semibold tabular-nums"
          style={{ color: up ? "var(--color-up)" : "var(--color-down)" }}
        >
          {formatChange(change, lang)}
        </span>
      </div>

      <p className="text-subtle mt-1.5 text-[0.68rem] leading-relaxed">
        {nl
          ? "De niveaus in dit artikel zijn van de publicatiedatum. Koersen van CoinGecko."
          : "The levels in this article are from the publication date. Prices from CoinGecko."}
      </p>
    </aside>
  );
}
