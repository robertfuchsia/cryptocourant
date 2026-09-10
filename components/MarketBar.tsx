import { compact, getFearGreed, getGlobalStats } from "@/lib/marketdata";
import { formatChange } from "@/lib/markets";
import type { Lang } from "@/lib/i18n";

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="min-w-0">
      <p className="text-subtle text-[0.64rem] font-semibold uppercase tracking-[0.1em]">
        {label}
      </p>
      <p
        className="mt-1 text-[1.05rem] font-semibold tabular-nums tracking-tight"
        style={
          tone ? { color: tone === "up" ? "var(--color-up)" : "var(--color-down)" } : undefined
        }
      >
        {value}
      </p>
    </div>
  );
}

/** Kleurband van angst (rood) naar hebzucht (groen). */
export function fearColor(value: number) {
  if (value < 25) return "#e5484d";
  if (value < 45) return "#f76b15";
  if (value < 55) return "#e0b341";
  if (value < 75) return "#3fb950";
  return "#2ea043";
}

/**
 * De stand van de markt in één regel, direct onder de kop. Vervangt de
 * inleidende alinea: dezelfde ruimte, maar met cijfers die elk uur kloppen.
 */
export async function MarketBar({ lang }: { lang: Lang }) {
  const [stats, fng] = await Promise.all([getGlobalStats(), getFearGreed()]);
  if (!stats && !fng) return null;

  const nl = lang === "nl";

  return (
    <div className="border-line bg-soft grid grid-cols-2 gap-x-6 gap-y-5 rounded-[var(--radius-card)] border p-5 sm:grid-cols-3 lg:grid-cols-5">
      {stats ? (
        <>
          <Stat
            label={nl ? "Marktwaarde" : "Market cap"}
            value={compact(stats.marketCap, lang)}
          />
          <Stat
            label={nl ? "24u verandering" : "24h change"}
            value={formatChange(stats.marketCapChange24h, lang)}
            tone={stats.marketCapChange24h >= 0 ? "up" : "down"}
          />
          <Stat label={nl ? "Dagvolume" : "24h volume"} value={compact(stats.volume24h, lang)} />
          <Stat
            label={nl ? "BTC dominantie" : "BTC dominance"}
            value={`${stats.btcDominance.toFixed(1)}%`}
          />
        </>
      ) : null}

      {fng ? (
        <div className="min-w-0">
          <p className="text-subtle text-[0.64rem] font-semibold uppercase tracking-[0.1em]">
            {nl ? "Angst en hebzucht" : "Fear and greed"}
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span
              className="text-[1.05rem] font-semibold tabular-nums"
              style={{ color: fearColor(fng.value) }}
            >
              {fng.value}
            </span>
            <span className="text-muted truncate text-[0.78rem]">{fng.label}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
