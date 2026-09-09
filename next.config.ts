import type { NextConfig } from "next";

/**
 * Nederlandse URL-segmenten worden intern herschreven naar de Engelse routes.
 * Zo blijft de routing simpel, maar staan er nette Nederlandse URLs in Google.
 *   /nl/nieuws/mijn-artikel   ->  app/[lang]/news/[slug]
 *   /nl/categorie/bitcoin     ->  app/[lang]/category/[slug]
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "assets.coingecko.com" },
    ],
  },
  async rewrites() {
    return [
      { source: "/nl/nieuws/:slug", destination: "/nl/news/:slug" },
      { source: "/nl/categorie/:slug", destination: "/nl/category/:slug" },
      { source: "/nl/auteur/:slug", destination: "/nl/author/:slug" },
      { source: "/nl/zoeken", destination: "/nl/search" },
      { source: "/nl/nieuws", destination: "/nl/news" },
    ];
  },
  async redirects() {
    return [
      // Eén canonieke URL per artikel: de Engelse variant stuurt door naar de Nederlandse.
      { source: "/nl/news/:slug", destination: "/nl/nieuws/:slug", permanent: true },
      { source: "/nl/category/:slug", destination: "/nl/categorie/:slug", permanent: true },
      { source: "/nl/author/:slug", destination: "/nl/auteur/:slug", permanent: true },
      { source: "/nl/search", destination: "/nl/zoeken", permanent: true },
    ];
  },
};

export default nextConfig;
