import Link from "next/link";

export function SectionHeading({
  title,
  href: url,
  action,
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="border-line mb-6 flex items-baseline justify-between border-b pb-3">
      <h2 className="text-subtle text-xs font-semibold uppercase tracking-[0.1em]">
        {title}
      </h2>
      {url && action ? (
        <Link href={url} className="text-accent text-xs font-semibold hover:underline">
          {action} →
        </Link>
      ) : null}
    </div>
  );
}
