import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LANG, LANGUAGES } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLang = LANGUAGES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLang) return NextResponse.next();

  // Browsertaal bepaalt waar een bezoeker zonder taalprefix terechtkomt.
  const accept = request.headers.get("accept-language") ?? "";
  const prefersEnglish =
    /\ben\b/i.test(accept.split(",")[0] ?? "") && !/\bnl\b/i.test(accept.split(",")[0] ?? "");
  const lang = prefersEnglish ? "en" : DEFAULT_LANG;

  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|studio|.*\\..*).*)"],
};
