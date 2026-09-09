import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
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
