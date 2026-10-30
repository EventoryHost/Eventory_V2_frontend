import Image from "next/image";
import { Map, Star } from "lucide-react";
import type { Vendor } from "../types";

/**
 * Pieces shared by the grid card (VendorCard) and the list row
 * (VendorListCard). Both Figma variants draw the name, rating, category
 * chip and location strip identically — kept here so a change to one view
 * can't silently leave the other behind.
 */

const FALLBACK_CATEGORY_ICON = "/images/customer/packages-pics.png";
const VERIFIED_BADGE = "/images/customer/vendors/verified-badge.svg";

export function VendorNameHeader({ vendor }: { vendor: Vendor }) {
  return (
    <div className="flex items-center gap-1.5">
      <h3 className="truncate font-figtree text-[16px] leading-[24px] font-semibold text-[#030303]">
        {vendor.name}
      </h3>
      {vendor.isVerified && (
        <Image
          src={VERIFIED_BADGE}
          alt="Verified vendor"
          width={18}
          height={18}
          className="size-[18px] shrink-0"
        />
      )}
    </div>
  );
}

/**
 * Star, average, review count — hidden entirely for a vendor with no
 * reviews yet (PM request 2026-10-30: "show reviews only if greater than
 * 0"), rather than rendering a hollow "0.0 (0 Reviews)" line.
 */
export function VendorRatingLine({ vendor }: { vendor: Vendor }) {
  if (vendor.reviewCount <= 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Star className="size-4 shrink-0 fill-[#ea1d3b] text-[#ea1d3b]" />
      <p className="truncate font-figtree text-[12px] leading-[18px] font-medium text-[#3f3f47]">
        {/* toFixed(1) so an integer average reads "5.0", matching "0.0"
            rather than sitting next to it as a bare "5". */}
        {vendor.rating.toFixed(1)}{" "}
        <span className="text-[#71717b]">
          ({vendor.reviewCount} {vendor.reviewCount === 1 ? "Review" : "Reviews"})
        </span>
      </p>
    </div>
  );
}

const MAX_CATEGORY_BADGES = 3;

/**
 * Figma node 1418:12214 (2026-10-30 refresh) — the labeled pill
 * ("CATERER" text beside the icon) is gone; the design stacks up to three
 * plain icon-only gradient badges per row, overlapping with a negative
 * margin, the frontmost one drawn last/on top. `vendor.categories` is every
 * distinct category the vendor actually has a LIVE package under (see
 * browseVendors/mapVendorToCard) — real bug fixed 2026-10-30: this used to
 * read only the vendor's single self-declared `categoryLabel`, so a vendor
 * with, say, both Decorator and Caterer packages only ever showed one badge.
 */
export function VendorCategoryChip({ vendor }: { vendor: Vendor }) {
  const categories = vendor.categories.slice(0, MAX_CATEGORY_BADGES);
  if (categories.length === 0) return null;

  return (
    <div className="isolate flex shrink-0 items-center">
      {categories.map((category, index) => (
        <div
          key={category.id}
          className={`flex shrink-0 items-center justify-center rounded-[52px] py-0.5 pr-2 pl-1 ${
            index < categories.length - 1 ? "mr-[-2px]" : ""
          }`}
          style={{
            background: `linear-gradient(to right, #ffffff, ${category.gradientFrom ?? "#FFE5E9"} 80%)`,
            zIndex: categories.length - index,
          }}
          title={category.label}
        >
          <Image
            src={category.icon ?? FALLBACK_CATEGORY_ICON}
            alt={category.label}
            width={16}
            height={16}
            className="size-4 shrink-0 rounded-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}

/** Full-bleed footer strip with its own top border. */
export function VendorLocationStrip({ vendor }: { vendor: Vendor }) {
  // No city and no service areas — drop the strip rather than render a
  // pin pointing at an em dash.
  if (vendor.locations.length === 0) return null;

  const visible = vendor.locations.slice(0, 3).join(", ");
  const extra = vendor.locations.length - 3;

  return (
    <div className="flex items-center gap-2 border-t border-[#e4e4e7] px-4 py-2">
      <Map className="size-4 shrink-0 text-[#b4112a]" />
      <p className="truncate font-figtree text-[14px] leading-[20px] font-medium text-[#3f3f47]">
        {visible}
        {extra > 0 && <span className="font-bold text-[#030303]">, {extra}+</span>}
      </p>
    </div>
  );
}
