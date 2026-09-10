import Link from "next/link";
import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PortableTextBlock } from "next-sanity";
import { SanityImage } from "./SanityImage";
import { PriceTable } from "./Ticker";
import { TradingViewWidget } from "./TradingViewWidget";
import { href, type Lang } from "@/lib/i18n";

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function childText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(childText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return childText((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

function components(lang: Lang): PortableTextComponents {
  return {
    block: {
      h2: ({ children }) => <h2 id={slugifyHeading(childText(children))}>{children}</h2>,
      h3: ({ children }) => <h3 id={slugifyHeading(childText(children))}>{children}</h3>,
      h4: ({ children }) => <h4>{children}</h4>,
      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    },
    marks: {
      link: ({ children, value }) => {
        const url: string = value?.href ?? "#";
        const external = /^https?:\/\//.test(url);
        return (
          <a
            href={url}
            target={external ? "_blank" : undefined}
            rel={
              [external ? "noopener" : "", value?.nofollow ? "nofollow" : ""]
                .filter(Boolean)
                .join(" ") || undefined
            }
          >
            {children}
          </a>
        );
      },
      internalLink: ({ children, value }) => {
        const slug = value?.reference?.slug?.current ?? value?.reference?.slug;
        if (!slug) return <>{children}</>;
        return <Link href={href.post(lang, slug)}>{children}</Link>;
      },
    },
    types: {
      image: ({ value }) => (
        <figure className="my-8">
          <SanityImage
            image={value}
            alt={value?.alt ?? ""}
            width={1200}
            height={750}
            sizes="(min-width: 768px) 720px, 100vw"
            className="w-full rounded-[var(--radius-card)] object-cover"
          />
          {value?.caption ? <figcaption>{value.caption}</figcaption> : null}
        </figure>
      ),
      callout: ({ value }) => {
        const tone = value?.tone ?? "neutral";
        const accent =
          tone === "warning" ? "var(--color-down)" : tone === "summary" ? "var(--color-up)" : "var(--accent)";
        return (
          <aside
            className="bg-soft my-8 rounded-[var(--radius-card)] border-l-[3px] p-5"
            style={{ borderLeftColor: accent }}
          >
            {value?.title ? (
              <p className="mb-1.5 text-sm font-semibold tracking-tight">{value.title}</p>
            ) : null}
            <p className="text-muted text-[0.95rem] leading-relaxed">{value?.text}</p>
          </aside>
        );
      },
      keyTakeaways: ({ value }) => (
        <aside className="border-line bg-soft my-8 rounded-[var(--radius-card)] border p-5">
          <p className="text-subtle mb-3 text-xs font-semibold uppercase tracking-[0.08em]">
            {lang === "nl" ? "Kort samengevat" : "Key takeaways"}
          </p>
          <ul className="space-y-2">
            {(value?.points ?? []).map((p: string, i: number) => (
              <li key={i} className="flex gap-2.5 text-[0.95rem] leading-relaxed">
                <span className="text-accent mt-[0.45em] block h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </aside>
      ),
      priceTable: ({ value }) => <PriceTable lang={lang} coins={value?.coinIds ?? []} />,
      tradingView: ({ value }) => (
        <TradingViewWidget
          lang={lang}
          symbol={value?.symbol ?? "BINANCE:BTCUSDT"}
          variant={value?.variant ?? "chart"}
          height={value?.height}
        />
      ),
      embed: ({ value }) => {
        const url: string = value?.url ?? "";
        const yt = url.match(
          /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
        );
        if (yt) {
          return (
            <div className="my-8 aspect-video overflow-hidden rounded-[var(--radius-card)]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yt[1]}`}
                title="YouTube"
                allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>
          );
        }
        return (
          <p className="my-8">
            <a href={url} target="_blank" rel="noopener">
              {url}
            </a>
          </p>
        );
      },
    },
  };
}

export function PortableBody({
  value,
  lang,
}: {
  value: PortableTextBlock[];
  lang: Lang;
}) {
  return (
    <div className="prose-article">
      <PortableText value={value} components={components(lang)} />
    </div>
  );
}

/** Bouwt de inhoudsopgave uit de H2's van het artikel. */
export function headings(value: PortableTextBlock[]) {
  return (value ?? [])
    .filter((b) => b._type === "block" && b.style === "h2")
    .map((b) => {
      const text = ((b.children ?? []) as Array<{ text?: string }>)
        .map((c) => c.text ?? "")
        .join("");
      return { id: slugifyHeading(text), text };
    })
    .filter((h) => h.text.length > 0);
}
