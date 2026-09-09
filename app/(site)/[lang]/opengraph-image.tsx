import { ImageResponse } from "next/og";
import { isLang, t, type Lang } from "@/lib/i18n";

export const alt = "CryptoCourant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  const lang = (isLang(raw) ? raw : "nl") as Lang;
  const dict = t[lang];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0e17",
          padding: 72,
          color: "#f4f6fa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#2647ff",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>
            CryptoCourant
          </div>
        </div>

        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.1 }}>
          {dict.tagline}
        </div>

        <div style={{ fontSize: 28, color: "#8b95a7" }}>cryptocourant.com</div>
      </div>
    ),
    size
  );
}
