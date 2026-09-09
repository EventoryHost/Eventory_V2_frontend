import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { CATEGORY_META } from "@/lib/categoryMeta";

const LABEL_BY_SLUG: Record<string, string> = {
  "makeup-artist": "Makeup Artist",
  caterer: "Caterer",
  "venue-provider": "Venue Provider",
  "dj-artist": "DJ Artist",
  decorator: "Decorator",
  photographer: "Photographer",
};

const FALLBACK_ICON = "/images/customer/packages-pics.png";
const FALLBACK_GRADIENT = "#FFE5E9";

/**
 * Same gradient-pill + real category image used by ProductCard and the
 * vendor listing cards (src/lib/categoryMeta.ts) — this cart card used to
 * have its own local lucide-icon lookup, which is why its chip looked
 * different from every other category badge in the app.
 */
export function getCategoryIconMeta(vendorType: string): { icon: string; gradientFrom: string } {
  const slug = VENDOR_TYPE_TO_CATEGORY[vendorType];
  const meta = slug ? CATEGORY_META[slug] : undefined;
  return { icon: meta?.icon ?? FALLBACK_ICON, gradientFrom: meta?.gradientFrom ?? FALLBACK_GRADIENT };
}

export function getCategoryLabel(vendorType: string): string {
  const slug = VENDOR_TYPE_TO_CATEGORY[vendorType];
  return (slug && LABEL_BY_SLUG[slug]) || vendorType || "Package";
}
