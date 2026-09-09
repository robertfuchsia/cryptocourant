export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-baseline gap-[3px] ${className}`}>
      <span
        className="text-[1.35rem] leading-none font-semibold tracking-[-0.03em]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Crypto
      </span>
      <span
        className="text-[1.35rem] leading-none font-semibold tracking-[-0.03em]"
        style={{ fontFamily: "var(--font-serif)", color: "var(--accent)" }}
      >
        Courant
      </span>
    </span>
  );
}
