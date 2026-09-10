import type { MetadataRoute } from "next";
import { ALLOW_INDEXING, absolute } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/api/", "/nl/zoeken", "/en/search"],
      },
    ],
    sitemap: absolute("/sitemap.xml"),
    host: absolute(""),
  };
}
