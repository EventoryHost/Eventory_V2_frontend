import { Brush, Camera, Landmark, Music2, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";

// Same slug -> icon/label mapping as customer-vendors/components/categoryIcons.tsx,
// kept local since it's a small, self-contained lookup (see the same pattern
// in customer-package-detail/services/getPackageDetail.ts's CATEGORY_ICON_BY_SLUG).
const ICON_BY_SLUG: Record<string, LucideIcon> = {
  "makeup-artist": Brush,
  caterer: UtensilsCrossed,
  "venue-provider": Landmark,
  "dj-artist": Music2,
  decorator: Sparkles,
  photographer: Camera,
};

const LABEL_BY_SLUG: Record<string, string> = {
  "makeup-artist": "Makeup Artist",
  caterer: "Caterer",
  "venue-provider": "Venue Provider",
  "dj-artist": "DJ Artist",
  decorator: "Decorator",
  photographer: "Photographer",
};

export function getCategoryIcon(vendorType: string): LucideIcon {
  const slug = VENDOR_TYPE_TO_CATEGORY[vendorType];
  return (slug && ICON_BY_SLUG[slug]) || Sparkles;
}

export function getCategoryLabel(vendorType: string): string {
  const slug = VENDOR_TYPE_TO_CATEGORY[vendorType];
  return (slug && LABEL_BY_SLUG[slug]) || vendorType || "Package";
}
