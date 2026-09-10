import Link from "next/link";
import { formatChange, formatPrice, getMovers, type Mover } from "@/lib/markets";
import { href, type Lang } from "@/lib/i18n";

type CoinLink = { coinId?: string; slug: string; title: string };

function Row({
  coin,
  lang,
  link,
}: {
  coin: Mover;
  lang: Lang;
  link?: CoinLink;
}) {
  const up = coin.change24h >= 0;

  const body = (
    <>
      <span className="flex min-w-0 items-center gap-2.5">
        {coin.image ? (
          // Logo's komen van CoinGecko; een gewone img houdt dit onderdeel licht.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coin.image} alt="" width={22} height={22} className="rounded-full" loading="lazy" />
        ) : (
          <span className="bg-soft h-[22px] w-[22px] rounded-full" />
        )}
        <span className="min-w-0">
          <span className="block text-[0.82rem] font-semibold tracking-tight">{coin.symbol}</span>
          <span className="text-subtle block truncate text-[0.72rem]">{coin.name}</span>
        </span>
      </span>
      <span className="text-right">
        <span className="block text-[0.82rem] tabular-nums">{formatPrice(coin.price, lang)}</span>
        <span
          className="block text-[0.72rem] font-semibold tabular-nums"
          style={{ color: up ? "var(--color-up)" : "var(--color-down)" }}
        >
          {formatChange(coin.change24h, lang)}
        </span>
      </span>
    </>
  );

  const className =
    "flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0";

  if (link) {
    return (
      <Link
        href={href.category(lang, link.slug)}
        className={`${className} hover:opacity-80 transition-opacity`}
        title={link.title}
      >
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

function List({
  title,
  coins,
  lang,
  links,
}: {
  title: string;
  coins: Mover[];
  lang: Lang;
  links: Map<string, CoinLink>;
}) {
  if (!coins.length) return null;

  return (
    <div>
      <p className="text-subtle mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.09em]">
        {title}
      </p>
      <div className="divide-line divide-y">
        {coins.map((c) => (
          <Row key={c.id} coin={c} lang={lang} link={links.get(c.id)} />
        ))}
      </div>
    </div>
  );
}

/**
 * Grootste stijgers en dalers over 24 uur, met een minimumvolume zodat er geen
 * illiquide muntjes tussen staan. Staat er een categorie op de site voor die
 * munt, dan is de rij een link daarheen: van beweging naar het nieuws erachter.
 */
export async function Movers({
  lang,
  coinLinks = [],
}: {
  lang: Lang;
  coinLinks?: CoinLink[];
}) {
  const { gainers, losers } = await getMovers();
  if (!gainers.length && !losers.length) return null;

  const links = new Map<string, CoinLink>();
  for (const c of coinLinks) if (c.coinId) links.set(c.coinId, c);

  return (
    <section className="border-line bg-soft rounded-[var(--radius-card)] border p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[0.95rem] font-semibold tracking-tight">
          {lang === "nl" ? "Stijgers en dalers" : "Gainers and losers"}
        </h2>
        <span className="text-subtle text-[0.68rem]">24u</span>
      </div>

      <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-5 sm:space-y-0 xl:block xl:space-y-4">
        <List
          title={lang === "nl" ? "Grootste stijgers" : "Top gainers"}
          coins={gainers}
          lang={lang}
          links={links}
        />
        <List
          title={lang === "nl" ? "Grootste dalers" : "Top losers"}
          coins={losers}
          lang={lang}
          links={links}
        />
      </div>

      <p className="text-subtle mt-4 text-[0.66rem] leading-relaxed">
        {lang === "nl"
          ? "Top 250 op marktwaarde, met minstens $25 miljoen dagvolume en $150 miljoen marktwaarde. Bron: CoinGecko."
          : "Top 250 by market cap, at least $25 million daily volume and $150 million market cap. Source: CoinGecko."}
      </p>
    </section>
  );
}
