import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-static";
export const metadata = { title: "CryptoCourant Studio", robots: { index: false } };

export default function StudioPage() {
  return <NextStudio config={config} />;
}
