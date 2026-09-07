// Icon + gradient per vendor category, keyed by the same category id slugs as
// VENDOR_TYPE_TO_CATEGORY (src/lib/vendorType.ts) / VENDOR_CATEGORIES
// (customer-vendors/data/filterConfig.ts). Shared by the landing page's
// "Packages Often Booked" carousel (ProductCard) and the PDP header, so both
// render the same category badge look from one source of truth.
export const CATEGORY_META: Record<string, { icon: string; gradientFrom: string }> = {
  "makeup-artist": { icon: "/images/customer/makeup.png", gradientFrom: "#FFDFB2" },
  caterer: { icon: "/images/customer/caterers.png", gradientFrom: "#FFCCD3" },
  "venue-provider": { icon: "/images/customer/venue.png", gradientFrom: "#C2E3FF" },
  "dj-artist": { icon: "/images/customer/dj.png", gradientFrom: "#E0CCFF" },
  decorator: { icon: "/images/customer/decorator.png", gradientFrom: "#FFEFC2" },
  photographer: { icon: "/images/customer/video.png", gradientFrom: "#CCFFE2" },
};
