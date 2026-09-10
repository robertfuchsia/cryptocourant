import { getFearGreed } from "@/lib/marketdata";
import { fearColor } from "./MarketBar";
import type { Lang } from "@/lib/i18n";

const LABELS_NL: Record<string, string> = {
  "Extreme Fear": "Extreme angst",
  Fear: "Angst",
  Neutral: "Neutraal",
  Greed: "Hebzucht",
  "Extreme Greed": "Extreme hebzucht",
};

/** Halve boog van 0 tot 100, met de naald op de huidige stand. */
export async function FearGreedGauge({ lang }: { lang: Lang }) {
  const fng = await getFearGreed();
  if (!fng) return null;

  const nl = lang === "nl";
  const label = nl ? LABELS_NL[fng.label] ?? fng.label : fng.label;

  const r = 66;
  const cx = 80;
  const cy = 78;
  const angle = Math.PI * (1 - fng.value / 100);
  const nx = cx + Math.cos(angle) * (r - 12);
  const ny = cy - Math.sin(angle) * (r - 12);
  const arcLength = Math.PI * r;

  const delta = (a?: number) =>
    a == null ? null : (
      <span className="tabular-nums">
        {a} <span className="text-subtle">→</span> {fng.value}
      </span>
    );

  return (
    <section className="border-line bg-soft rounded-[var(--radius-card)] border p-4">
      <h2 className="mb-1 text-[0.95rem] font-semibold tracking-tight">
        {nl ? "Angst en hebzucht" : "Fear and greed"}
      </h2>

      <div className="flex items-end justify-center">
        <svg viewBox="0 0 160 92" className="w-full max-w-[190px]" role="img" aria-label={`${fng.value} — ${label}`}>
          <defs>
            <linearGradient id="fng" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e5484d" />
              <stop offset="35%" stopColor="#f76b15" />
              <stop offset="55%" stopColor="#e0b341" />
              <stop offset="100%" stopColor="#2ea043" />
            </linearGradient>
          </defs>
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="url(#fng)"
            strokeWidth="11"
            strokeLinecap="round"
            opacity="0.85"
            strokeDasharray={arcLength}
          />
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="4" fill="currentColor" />
          <text
            x={cx}
            y={cy - 16}
            textAnchor="middle"
            fontSize="26"
            fontWeight="700"
            fill={fearColor(fng.value)}
          >
            {fng.value}
          </text>
        </svg>
      </div>

      <p className="text-center text-[0.85rem] font-medium" style={{ color: fearColor(fng.value) }}>
        {label}
      </p>

      <dl className="text-subtle mt-3 space-y-1 text-[0.72rem]">
        {fng.yesterday != null ? (
          <div className="flex justify-between gap-2">
            <dt>{nl ? "Gisteren" : "Yesterday"}</dt>
            <dd>{delta(fng.yesterday)}</dd>
          </div>
        ) : null}
        {fng.lastWeek != null ? (
          <div className="flex justify-between gap-2">
            <dt>{nl ? "Vorige week" : "Last week"}</dt>
            <dd>{delta(fng.lastWeek)}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
