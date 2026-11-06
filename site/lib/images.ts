export interface ImageVariants {
  src: string;
  card: string;
  hero: string;
}

/**
 * Returns optimized WebP derivative URLs for images generated at build time.
 * Falls back to the original source URL for external or non-standard paths.
 */
export function getImageVariants(src?: string): ImageVariants | undefined {
  if (!src) return undefined;
  if (!src.startsWith("/images/")) {
    return { src, card: src, hero: src };
  }

  const lastDot = src.lastIndexOf(".");
  if (lastDot === -1) return { src, card: src, hero: src };

  const base = src.slice(0, lastDot);
  return {
    src,
    card: `${base}-card.webp`,
    hero: `${base}-hero.webp`,
  };
}
