"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "chart" | "mini" | "ticker";

const SCRIPTS: Record<Variant, string> = {
  chart: "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js",
  mini: "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js",
  ticker: "https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js",
};

const DEFAULT_HEIGHT: Record<Variant, number> = { chart: 480, mini: 220, ticker: 130 };

function config(variant: Variant, symbol: string, locale: string, theme: string, height: number) {
  const base = { symbol, colorTheme: theme, locale, isTransparent: true, width: "100%" };

  if (variant === "chart") {
    return {
      ...base,
      height,
      interval: "D",
      timezone: "Etc/UTC",
      theme,
      style: "1",
      hide_side_toolbar: true,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    };
  }

  if (variant === "mini") {
    return { ...base, height, dateRange: "3M", trendLineColor: "#4f7cff", chartOnly: false, noTimeScale: false };
  }

  return base;
}

/**
 * TradingView-widget. Laadt het script pas als het blok in beeld komt, zodat
 * een artikel met meerdere grafieken de pagina niet vertraagt.
 */
export function TradingViewWidget({
  symbol,
  variant = "chart",
  height,
  lang,
}: {
  symbol: string;
  variant?: Variant;
  height?: number;
  lang: "nl" | "en";
}) {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = holder.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && setVisible(true),
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    const el = holder.current;
    if (!el || !visible) return;

    el.innerHTML = "";
    const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const h = height ?? DEFAULT_HEIGHT[variant];

    const container = document.createElement("div");
    container.className = "tradingview-widget-container";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    container.appendChild(inner);

    const script = document.createElement("script");
    script.src = SCRIPTS[variant];
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify(
      config(variant, symbol, lang === "nl" ? "nl" : "en", theme, h)
    );
    container.appendChild(script);
    el.appendChild(container);

    return () => {
      el.innerHTML = "";
    };
  }, [visible, symbol, variant, height, lang]);

  return (
    <div
      ref={holder}
      className="my-8 overflow-hidden rounded-[var(--radius-card)]"
      style={{ minHeight: height ?? DEFAULT_HEIGHT[variant] }}
    />
  );
}
