import Link from "next/link";
import { href, t, DEFAULT_LANG } from "@/lib/i18n";

export default function NotFound() {
  const dict = t[DEFAULT_LANG];
  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-accent text-sm font-semibold tracking-widest">404</p>
      <h1 className="headline mt-3 text-3xl sm:text-4xl">{dict.notFoundTitle}</h1>
      <p className="text-muted mt-3 max-w-md">{dict.notFoundBody}</p>
      <Link
        href={href.home(DEFAULT_LANG)}
        className="bg-accent on-accent mt-7 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
      >
        {dict.backHome}
      </Link>
    </div>
  );
}
