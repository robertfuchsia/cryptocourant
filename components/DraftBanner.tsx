import { draftMode } from "next/headers";
import { t, type Lang } from "@/lib/i18n";

export async function DraftBanner({ lang }: { lang: Lang }) {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  const dict = t[lang];

  return (
    <div className="bg-accent on-accent sticky top-0 z-[70] flex items-center justify-center gap-4 px-4 py-1.5 text-xs font-medium">
      <span>{dict.draftMode}</span>
      <a href="/api/draft/disable" className="underline underline-offset-2">
        {dict.exitDraft}
      </a>
    </div>
  );
}
