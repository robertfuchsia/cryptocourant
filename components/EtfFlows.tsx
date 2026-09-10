import { compact } from "@/lib/marketdata";
import { getXrpEtfFlows, signedCompact, type EtfFlows as Flows } from "@/lib/etf";
import type { Lang } from "@/lib/i18n";

const UP = "var(--color-up)";
const DOWN = "var(--color-down)";

function shortDate(iso: string, lang: Lang) {
  const d = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat(lang === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(d);
}

/**
 * Tien dagen netto stroom rond een nullijn: groen erboven, rood eronder.
 * Eén reeks, dus geen legenda; de kop zegt wat het is. De waarden staan in
 * een titel per staafje en in een tabel voor schermlezers, zodat de kleur
 * nooit de enige drager van de betekenis is.
 */
function FlowBars({ history, lang }: { history: Flows["history"]; lang: Lang }) {
  if (history.length < 2) return null;

  const w = 268;
  const h = 74;
  const gap = 2;
  const barW = (w - gap * (history.length - 1)) / history.length;
  const peak = Math.max(...history.map((d) => Math.abs(d.netFlow)), 1);
  const mid = h / 2;

  return (
    <figure className="mt-3">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        role="img"
        aria-label={
          lang === "nl"
            ? "Netto stroom per dag over de laatste tien handelsdagen"
            : "Daily net flow over the last ten trading days"
        }
      >
        <line x1="0" y1={mid} x2={w} y2={mid} stroke="currentColor" strokeWidth="1" opacity="0.18" />
        {history.map((d, i) => {
          const magnitude = (Math.abs(d.netFlow) / peak) * (mid - 4);
          const barH = Math.max(magnitude, d.netFlow === 0 ? 0 : 1.5);
          const up = d.netFlow >= 0;
          return (
            <rect
              key={d.date}
              x={i * (barW + gap)}
              y={up ? mid - barH : mid}
              width={barW}
              height={barH}
              rx="1.5"
              fill={up ? UP : DOWN}
              opacity={i === history.length - 1 ? 1 : 0.62}
            >
              <title>{`${shortDate(d.date, lang)}: ${signedCompact(d.netFlow, lang)}`}</title>
            </rect>
          );
        })}
      </svg>

      <figcaption className="text-subtle mt-1.5 flex justify-between text-[0.64rem]">
        <span>{shortDate(history[0].date, lang)}</span>
        <span>{shortDate(history[history.length - 1].date, lang)}</span>
      </figcaption>

      <table className="sr-only">
        <caption>
          {lang === "nl" ? "Netto stroom per dag" : "Net flow per day"}
        </caption>
        <tbody>
          {history.map((d) => (
            <tr key={d.date}>
              <th scope="row">{shortDate(d.date, lang)}</th>
              <td>{signedCompact(d.netFlow, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/**
 * Wat er per dag in en uit de spot-ETF's loopt. Voor XRP is dat vrij
 * beschikbaar inclusief uitsplitsing per uitgever; voor bitcoin en ethereum
 * vraagt elke bron een betaalde sleutel.
 */
export async function EtfFlows({ lang }: { lang: Lang }) {
  const data = await getXrpEtfFlows();
  if (!data) return null;

  const nl = lang === "nl";
  const positive = data.netFlow >= 0;
  const movers = data.issuers.filter((i) => i.flow !== 0).slice(0, 3);

  return (
    <section className="border-line bg-soft rounded-[var(--radius-card)] border p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[0.95rem] font-semibold tracking-tight">
          {nl ? "XRP ETF-stromen" : "XRP ETF flows"}
        </h2>
        <span className="text-subtle text-[0.68rem]">{shortDate(data.date, lang)}</span>
      </div>

      <p
        className="text-[1.6rem] font-semibold leading-none tabular-nums tracking-tight"
        style={{ color: positive ? UP : DOWN }}
      >
        {signedCompact(data.netFlow, lang)}
      </p>
      <p className="text-subtle mt-1 text-[0.7rem]">
        {nl ? "netto op de laatste handelsdag" : "net on the last trading day"}
      </p>

      <FlowBars history={data.history} lang={lang} />

      <dl className="divide-line mt-3 divide-y">
        <div className="flex items-baseline justify-between gap-3 py-2 first:pt-0">
          <dt className="text-[0.78rem]">{nl ? "Beheerd vermogen" : "Assets under management"}</dt>
          <dd className="text-[0.82rem] font-semibold tabular-nums">
            {compact(data.totalAum, lang)}
          </dd>
        </div>
        {movers.map((i) => (
          <div key={i.ticker} className="flex items-baseline justify-between gap-3 py-2 last:pb-0">
            <dt className="min-w-0 text-[0.78rem]">
              <span className="font-semibold">{i.ticker}</span>{" "}
              <span className="text-subtle">{i.issuer}</span>
            </dt>
            <dd
              className="shrink-0 text-[0.8rem] font-semibold tabular-nums"
              style={{ color: i.flow >= 0 ? UP : DOWN }}
            >
              {signedCompact(i.flow, lang)}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-subtle mt-3 text-[0.66rem] leading-relaxed">
        {nl ? "Bron: " : "Source: "}
        <a href={data.sourceUrl} target="_blank" rel="noopener nofollow" className="hover:underline">
          {data.source}
        </a>
        {nl
          ? ". Bitcoin- en ethereum-ETF's volgen zodra daar een bron voor is."
          : ". Bitcoin and ethereum ETFs follow once a source is available."}
      </p>
    </section>
  );
}
