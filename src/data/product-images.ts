import type { ImageMetadata } from "astro";

const catalogImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/**/*.{jpeg,jpg,png,webp,avif}",
  { eager: true }
);

const imagesByPath = new Map(
  Object.entries(catalogImages).map(([key, module]) => [key, module.default]),
);

function toSrcKey(src: string): string | undefined {
  if (!src.startsWith("/")) {
    return undefined;
  }
  return `/src${src}`;
}

export function resolveProductImage(src: string): ImageMetadata | undefined {
  const key = toSrcKey(src);
  return key ? imagesByPath.get(key) : undefined;
}

export function resolveProductImages(srcs: string[]): ImageMetadata[] {
  const resolved = srcs.map(resolveProductImage);
  const missing = srcs.filter((_, index) => !resolved[index]);
  if (missing.length > 0) {
    throw new Error(
      `No se pudo resolver ${missing.length} imagen(es) de producto: ${missing.join(", ")}`,
    );
  }
  return resolved as ImageMetadata[];
}