/**
 * Marktdata die niet over losse munten gaat: de stand van de hele markt,
 * het sentiment en de derivatenkant. Alles faalt stil — valt een bron weg,
 * dan verdwijnt dat ene blokje en niet de pagina.
 *
 * Bronnen zijn bewust gekozen op bereikbaarheid vanaf Vercel (VS-IP):
 * Binance en Bybit blokkeren dat, OKX en alternative.me niet.
 */

const HOUR = 3600;

async function json<T>(url: string, revalidate: number, tag: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate, tags: [tag] },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type GlobalStats = {
  marketCap: number;
  marketCapChange24h: number;
  volume24h: number;
  btcDominance: number;
  ethDominance: number;
};

/** Totale marktwaarde, dagvolume en dominantie. Bron: CoinGecko. */
export async function getGlobalStats(): Promise<GlobalStats | null> {
  const data = await json<{
    data: {
      total_market_cap: Record<string, number>;
      total_volume: Record<string, number>;
      market_cap_percentage: Record<string, number>;
      market_cap_change_percentage_24h_usd: number;
    };
  }>("https://api.coingecko.com/api/v3/global", 300, "markets");
  if (!data?.data) return null;

  const d = data.data;
  return {
    marketCap: d.total_market_cap?.usd ?? 0,
    marketCapChange24h: d.market_cap_change_percentage_24h_usd ?? 0,
    volume24h: d.total_volume?.usd ?? 0,
    btcDominance: d.market_cap_percentage?.btc ?? 0,
    ethDominance: d.market_cap_percentage?.eth ?? 0,
  };
}

export type FearGreed = {
  value: number;
  label: string;
  yesterday?: number;
  lastWeek?: number;
};

/** Angst en hebzucht, 0 tot 100. Bron: alternative.me. Ververst dagelijks. */
export async function getFearGreed(): Promise<FearGreed | null> {
  const data = await json<{
    data: Array<{ value: string; value_classification: string }>;
  }>("https://api.alternative.me/fng/?limit=8", HOUR, "markets");
  const rows = data?.data;
  if (!rows?.length) return null;

  const num = (i: number) => (rows[i] ? Number(rows[i].value) : undefined);
  return {
    value: Number(rows[0].value),
    label: rows[0].value_classification,
    yesterday: num(1),
    lastWeek: num(7),
  };
}

export type Derivatives = {
  fundingRate: number;
  openInterestUsd: number;
  longShort?: number;
};

/**
 * Derivatenstand voor bitcoin: financieringsrente, open interest en de
 * verhouding long tegenover short. Bron: OKX.
 */
export async function getDerivatives(): Promise<Derivatives | null> {
  const [funding, oi, ls] = await Promise.all([
    json<{ data: Array<{ fundingRate: string }> }>(
      "https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP",
      600,
      "markets"
    ),
    json<{ data: Array<{ oiCcy: string; oiUsd?: string }> }>(
      "https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=BTC-USDT-SWAP",
      600,
      "markets"
    ),
    json<{ data: Array<[string, string]> }>(
      "https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=BTC&period=5m",
      600,
      "markets"
    ),
  ]);

  const rate = funding?.data?.[0]?.fundingRate;
  if (rate == null) return null;

  const oiUsd = Number(oi?.data?.[0]?.oiUsd ?? 0);
  const ratio = ls?.data?.length ? Number(ls.data[ls.data.length - 1][1]) : undefined;

  return {
    fundingRate: Number(rate) * 100,
    openInterestUsd: oiUsd,
    longShort: Number.isFinite(ratio) ? ratio : undefined,
  };
}

/** $1,84 bln, $912 mld, $4,2 mln — kort genoeg voor een statregel. */
export function compact(value: number, lang: "nl" | "en") {
  const units =
    lang === "nl"
      ? [[1e12, " bln"], [1e9, " mrd"], [1e6, " mln"]]
      : [[1e12, "T"], [1e9, "B"], [1e6, "M"]];
  for (const [size, suffix] of units as Array<[number, string]>) {
    if (value >= size) {
      const n = value / size;
      return `$${new Intl.NumberFormat(lang === "nl" ? "nl-NL" : "en-GB", {
        maximumFractionDigits: n >= 100 ? 0 : n >= 10 ? 1 : 2,
      }).format(n)}${suffix}`;
    }
  }
  return `$${Math.round(value)}`;
}
