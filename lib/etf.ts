/**
 * Dagelijkse in- en uitstroom van spot-ETF's.
 *
 * Voor XRP is er een vrij toegankelijke bron met uitsplitsing per uitgever.
 * Voor bitcoin en ethereum bestaat die niet: Farside blokkeert bots, en
 * CoinGlass, SoSoValue en CryptoDataAPI vragen een betaalde sleutel. Komt die
 * sleutel er, dan sluit die kant hier aan; tot die tijd toont de site XRP.
 */

export type EtfIssuer = { ticker: string; issuer: string; flow: number; aum: number };

export type EtfFlows = {
  asset: "XRP" | "BTC" | "ETH";
  date: string;
  netFlow: number;
  totalAum: number;
  /** Oudste eerst, zodat de staafjes van links naar rechts lopen. */
  history: Array<{ date: string; netFlow: number }>;
  issuers: EtfIssuer[];
  source: string;
  sourceUrl: string;
};

type XrpInsights = {
  daily?: Array<{
    date: string;
    netFlow: number;
    totalAUM: number;
    etfFlows?: Array<{ ticker: string; issuer: string; flow: number; aum: number }>;
  }>;
};

/** XRP spot-ETF stromen. Bron: xrp-insights.com, geen sleutel nodig. */
export async function getXrpEtfFlows(): Promise<EtfFlows | null> {
  try {
    const res = await fetch("https://xrp-insights.com/api/flows", {
      next: { revalidate: 1800, tags: ["markets"] },
      headers: { accept: "application/json", "user-agent": "cryptocourant.com" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as XrpInsights;
    const days = data?.daily;
    if (!Array.isArray(days) || !days.length) return null;

    const last = days[days.length - 1];
    const issuers = (last.etfFlows ?? [])
      .map((e) => ({ ticker: e.ticker, issuer: e.issuer, flow: e.flow, aum: e.aum }))
      .sort((a, b) => Math.abs(b.flow) - Math.abs(a.flow));

    return {
      asset: "XRP",
      date: last.date,
      netFlow: last.netFlow ?? 0,
      totalAum: last.totalAUM ?? 0,
      history: days.slice(-10).map((d) => ({ date: d.date, netFlow: d.netFlow ?? 0 })),
      issuers,
      source: "xrp-insights.com",
      sourceUrl: "https://xrp-insights.com/",
    };
  } catch {
    return null;
  }
}

/**
 * Bedrag met teken. Miljoenen en miljarden kort; alles daaronder voluit met
 * puntscheiding, zoals de huisstijl voorschrijft: +$6,1 mln, −$161.025.
 */
export function signedCompact(value: number, lang: "nl" | "en") {
  const sign = value >= 0 ? "+" : "−";
  const abs = Math.abs(value);
  const locale = lang === "nl" ? "nl-NL" : "en-GB";
  const units: Array<[number, string]> =
    lang === "nl"
      ? [
          [1e9, " mrd"],
          [1e6, " mln"],
        ]
      : [
          [1e9, "B"],
          [1e6, "M"],
        ];

  for (const [size, suffix] of units) {
    if (abs >= size) {
      const n = abs / size;
      return `${sign}$${new Intl.NumberFormat(locale, {
        maximumFractionDigits: n >= 100 ? 0 : n >= 10 ? 1 : 2,
      }).format(n)}${suffix}`;
    }
  }
  return `${sign}$${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(abs)}`;
}
