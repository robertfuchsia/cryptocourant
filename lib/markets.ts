import type { Lang } from "./i18n";

export type Quote = {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change24h: number;
  marketCap?: number;
};

const ENDPOINT = "https://api.coingecko.com/api/v3/coins/markets";

/**
 * Koersen van CoinGecko. Faalt stil: als de API plat ligt verdwijnt alleen
 * de koersbalk, niet de pagina.
 */
export async function getQuotes(ids: string[]): Promise<Quote[]> {
  if (!ids.length) return [];
  const url = `${ENDPOINT}?vs_currency=usd&ids=${ids.join(",")}&order=market_cap_desc&per_page=${ids.length}&page=1&sparkline=false&price_change_percentage=24h`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 120, tags: ["markets"] },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      id: string;
      symbol: string;
      name: string;
      image: string;
      current_price: number;
      price_change_percentage_24h: number | null;
      market_cap: number | null;
    }>;
    if (!Array.isArray(data)) return [];

    const byId = new Map(data.map((c) => [c.id, c]));
    return ids
      .map((id) => byId.get(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => ({
        id: c.id,
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        image: c.image,
        price: c.current_price,
        change24h: c.price_change_percentage_24h ?? 0,
        marketCap: c.market_cap ?? undefined,
      }));
  } catch {
    return [];
  }
}

/** Eén rij in de stijgers- en dalerslijst. */
export type Mover = Quote & { volume24h: number };

/**
 * Grootste stijgers en dalers over 24 uur. CoinGecko's eigen gainers/losers
 * zit achter hun betaalde plan, dus we halen de top 250 op marktwaarde op en
 * sorteren zelf. Dat is bovendien schoner: een minimumvolume houdt illiquide
 * muntjes met een schijnrally eruit.
 */
export async function getMovers(count = 5, minVolume = 25_000_000, minMarketCap = 150_000_000): Promise<{
  gainers: Mover[];
  losers: Mover[];
}> {
  const url = `${ENDPOINT}?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300, tags: ["markets"] },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return { gainers: [], losers: [] };
    const data = (await res.json()) as Array<{
      id: string;
      symbol: string;
      name: string;
      image: string;
      current_price: number;
      price_change_percentage_24h: number | null;
      market_cap: number | null;
      total_volume: number | null;
    }>;
    if (!Array.isArray(data)) return { gainers: [], losers: [] };

    const rows: Mover[] = data
      .filter(
        (c) =>
          (c.total_volume ?? 0) >= minVolume &&
          (c.market_cap ?? 0) >= minMarketCap &&
          c.price_change_percentage_24h != null
      )
      .map((c) => ({
        id: c.id,
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        image: c.image,
        price: c.current_price,
        change24h: c.price_change_percentage_24h ?? 0,
        marketCap: c.market_cap ?? undefined,
        volume24h: c.total_volume ?? 0,
      }));

    const sorted = [...rows].sort((a, b) => b.change24h - a.change24h);
    return {
      gainers: sorted.slice(0, count),
      losers: sorted.slice(-count).reverse(),
    };
  } catch {
    return { gainers: [], losers: [] };
  }
}

export function formatPrice(value: number, lang: Lang) {
  const locale = lang === "nl" ? "nl-NL" : "en-GB";
  const digits = value >= 1000 ? 0 : value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatChange(value: number, lang: Lang) {
  const locale = lang === "nl" ? "nl-NL" : "en-GB";
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  return `${value >= 0 ? "+" : "−"}${formatted}%`;
}
