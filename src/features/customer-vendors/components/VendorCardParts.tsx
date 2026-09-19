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
 * Star, average, review count — always rendered, including for a vendor
 * with no reviews yet ("0.0 (0 Reviews)"). Swapping in a "No reviews yet"
 * sentence instead changed the line's shape between cards; a zeroed rating
 * says the same thing and keeps every card aligned.
 */
export function VendorRatingLine({ vendor }: { vendor: Vendor }) {
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

/**
 * The design stacks up to three of these per row, the extra two icon-only.
 * Only one is rendered: a Vendor carries a single `vendorType`, so there is
 * no second or third category to draw — see VendorListCard.
 */
export function VendorCategoryChip({ vendor }: { vendor: Vendor }) {
  // A vendor who never picked a type has no chip — better than one reading "ALL".
  if (!vendor.categoryLabel) return null;

  return (
    <div
      className="flex shrink-0 items-center gap-2 rounded-[52px] py-0.5 pr-2 pl-1"
      style={{
        background: `linear-gradient(to right, #ffffff, ${vendor.categoryGradientFrom ?? "#FFE5E9"} 80%)`,
      }}
    >
      <Image
        src={vendor.categoryIcon ?? FALLBACK_CATEGORY_ICON}
        alt=""
        width={16}
        height={16}
        className="size-4 rounded-full object-contain"
      />
      <span className="font-figtree text-[11px] leading-[16px] font-bold whitespace-nowrap text-[#3c060d] uppercase">
        {vendor.categoryLabel}
      </span>
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
