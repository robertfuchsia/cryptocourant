import { Tweet } from "react-tweet";
import "react-tweet/theme.css";

/** Haalt het bericht-id uit een x.com- of twitter.com-link. */
export function tweetId(url: string): string | null {
  const m = url.match(
    /^https?:\/\/(?:www\.|mobile\.)?(?:x|twitter|fxtwitter|vxtwitter)\.com\/[^/]+\/status(?:es)?\/(\d+)/i
  );
  return m ? m[1] : null;
}

function TweetLink({ url }: { url: string }) {
  return (
    <p className="my-8">
      <a href={url} target="_blank" rel="noopener">
        {url}
      </a>
    </p>
  );
}

/** Skelet met dezelfde breedte als het bericht, zodat de tekst niet verspringt. */
function Skeleton() {
  return (
    <div
      className="border-line bg-soft h-56 w-full animate-pulse rounded-[12px] border"
      aria-hidden="true"
    />
  );
}

/**
 * Rendert een X-bericht server-side (react-tweet). Geen widgets.js, geen
 * cookies, en de opmaak volgt de licht/donker-stand van de site.
 * Als X het bericht niet teruggeeft (verwijderd, afgeschermd), valt het
 * terug op een gewone link.
 */
export function TweetEmbed({ url }: { url: string }) {
  const id = tweetId(url);
  if (!id) return <TweetLink url={url} />;

  return (
    <div className="not-prose my-8 flex justify-center">
      <div className="w-full max-w-[550px] [&_.react-tweet-theme]:my-0">
        <Tweet
          id={id}
          fallback={<Skeleton />}
          components={{ TweetNotFound: () => <TweetLink url={url} /> }}
        />
      </div>
    </div>
  );
}
