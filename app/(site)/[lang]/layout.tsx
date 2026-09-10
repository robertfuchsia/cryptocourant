import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Instrument_Serif } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DraftBanner } from "@/components/DraftBanner";
import { ThemeScript } from "@/components/ThemeToggle";
import { isLang, LANGUAGES, t, HTML_LANG, type Lang } from "@/lib/i18n";
import { ALLOW_INDEXING, SITE_URL, hreflangAlternates } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-serif-display",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e17" },
  ],
};

export function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = (isLang(raw) ? raw : "nl") as Lang;
  const dict = t[lang];

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${dict.siteName} — ${dict.tagline}`, template: `%s | ${dict.siteName}` },
    description: dict.tagline,
    applicationName: dict.siteName,
    alternates: {
      canonical: `/${lang}`,
      languages: hreflangAlternates({ nl: "/nl", en: "/en" }),
      types: {
        "application/rss+xml": [
          { url: "/nl/rss.xml", title: "CryptoCourant — Nederlands" },
          { url: "/en/rss.xml", title: "CryptoCourant — English" },
        ],
      },
    },
    openGraph: {
      type: "website",
      siteName: dict.siteName,
      locale: lang === "nl" ? "nl_NL" : "en_US",
    },
    twitter: { card: "summary_large_image" },
    robots: ALLOW_INDEXING ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw as Lang;

  return (
    <html
      lang={HTML_LANG[lang]}
      /* Donker is de standaard; het themascript haalt de class weg als iemand licht kiest. */
      className={`dark ${inter.variable} ${serif.variable}`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-screen flex-col">
        <DraftBanner lang={lang} />
        <Header lang={lang} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}
