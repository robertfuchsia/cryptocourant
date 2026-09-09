import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImage } from "./types";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(source: SanityImage | undefined | null) {
  if (!source || !source.asset) return null;
  return builder.image(source as never).auto("format").fit("max");
}

export function imageUrl(
  source: SanityImage | undefined | null,
  width: number,
  height?: number
) {
  const b = urlForImage(source);
  if (!b) return null;
  return height ? b.width(width).height(height).fit("crop").url() : b.width(width).url();
}
