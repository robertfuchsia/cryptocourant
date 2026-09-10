import type { CSSProperties } from "react";
import Image from "next/image";
import { urlForImage } from "@/sanity/image";
import type { SanityImage as SanityImageType } from "@/sanity/types";

type Props = {
  image?: SanityImageType | null;
  alt?: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  /** "crop" snijdt bij naar het gevraagde kader, "max" past het beeld erbinnen. */
  fit?: "crop" | "max";
  className?: string;
  style?: CSSProperties;
};

export function SanityImage({
  image,
  alt,
  width,
  height,
  sizes = "100vw",
  priority = false,
  quality,
  fit = "crop",
  className,
  style,
}: Props) {
  const demoSrc = (image as { demoSrc?: string } | null | undefined)?.demoSrc;
  if (demoSrc) {
    return (
      <Image
        src={demoSrc}
        alt={alt ?? ""}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        quality={quality}
        unoptimized
        className={className}
        style={style}
      />
    );
  }

  const builder = urlForImage(image);

  if (!builder) {
    return (
      <div
        className={`bg-soft flex items-center justify-center ${className ?? ""}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-8 w-8 opacity-25"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m3 16 5-5 4 4 3-3 6 6" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={builder.width(width).height(height).fit(fit).url()}
      alt={alt ?? image?.alt ?? ""}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={className}
      style={style}
    />
  );
}
