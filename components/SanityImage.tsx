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
  className?: string;
};

export function SanityImage({
  image,
  alt,
  width,
  height,
  sizes = "100vw",
  priority = false,
  className,
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
        unoptimized
        className={className}
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
      src={builder.width(width).height(height).fit("crop").url()}
      alt={alt ?? image?.alt ?? ""}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
