import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { Vendor } from "../types";
import { formatRangeStat, formatWishlistCount } from "../utils/vendorStats";
import {
  VendorCategoryChip,
  VendorLocationStrip,
  VendorNameHeader,
  VendorRatingLine,
} from "./VendorCardParts";

const FALLBACK_AVATAR = "/images/customer/packages-pics.png";

/**
 * Where the card goes when clicked.
 *
 * "vendor" (the default) opens the vendor profile — the card is
 * vendor-shaped, so that is what a click promises. "package" is for the
 * vendor profile's own Event Packages grid, where linking back to the
 * vendor would just reload the page the customer is already on.
 */
export type VendorCardLinkTarget = "vendor" | "package";


/** Compact stat ("3+" over "Year Experience") — no icon, unlike the list row's. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="font-figtree text-[14px] leading-[20px] font-bold text-[#030303]">{value}</span>
      <span className="font-figtree text-[11px] leading-[16px] font-medium text-[#71717b]">{label}</span>
    </div>
  );
}

/**
 * The Figma "Vendor Listing" grid card (node 1418:11709) — 316x328 in the
 * design, fluid here so it survives the responsive grid.
 *
 * Vendor-centric by design: cover, avatar, name + verified badge, rating,
 * two stats and a category chip, over a full-bleed location strip. The row
 * it represents is still a package (that is the only browse endpoint), but
 * everything shown is the vendor's, so a click opens the vendor profile —
 * see VendorCardLinkTarget.
 */
export default function VendorCard({
  vendor,
  isBookmarked,
  onToggleBookmark,
  linkTo = "vendor",
}: {
  vendor: Vendor;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  linkTo?: VendorCardLinkTarget;
}) {
  const experience = formatRangeStat(vendor.experience);
  const wishlistCount = formatWishlistCount(vendor.wishlistCount);
  const href =
    linkTo === "vendor" && vendor.vendorProfileId
      ? `/vendors/${vendor.vendorProfileId}`
      : `/packages/${vendor.id}`;

  return (
    <Link
      href={href}
      className="group relative flex h-[328px] flex-col overflow-hidden rounded-[20px] border border-[#e4e4e7] bg-white transition-colors hover:border-brand-primary"
    >
      {/* Cover strip. Falls back to a brand wash rather than a stand-in
          photo — a wrong photo reads as this vendor's actual work. */}
      <div className="relative h-[100px] w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#fdeef0] to-[#ffe5e9]">
        {vendor.coverImage && (
          <Image
            src={vendor.coverImage}
            alt=""
            fill
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}

        <button
          type="button"
          aria-label={isBookmarked ? `Remove ${vendor.name} from saved` : `Save ${vendor.name}`}
          aria-pressed={isBookmarked}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleBookmark(vendor.id);
          }}
          className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/10 shadow-[0px_0px_8.2px_0px_rgba(0,0,0,0.15)] backdrop-blur-[5.6px] transition-colors hover:bg-white/30"
        >
          <Bookmark
            className="size-5 text-white"
            strokeWidth={1.6}
            fill={isBookmarked ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Avatar, deliberately overlapping the cover's bottom edge. */}
      <div className="absolute top-[69px] left-[15px] z-10 size-[84px] overflow-hidden rounded-full border-2 border-white bg-white">
        <Image
          src={vendor.avatar || vendor.categoryIcon || FALLBACK_AVATAR}
          alt=""
          fill
          sizes="84px"
          className="object-cover"
        />
      </div>

      {/* 161px from the card top in the design — 61px below the 100px cover. */}
      <div className="flex flex-1 flex-col gap-3 px-[15px] pt-[61px]">
        <div className="flex flex-col gap-1">
          <VendorNameHeader vendor={vendor} />
          <VendorRatingLine vendor={vendor} />
        </div>

        <div className="h-px w-full bg-[#e4e4e7]" />

        <div className="flex items-center justify-between gap-2">
          {/* Wishlisted always shows, including "0". Experience is skipped
              when the vendor never entered one — there is no sensible
              zero for it. */}
          <div className="flex items-center gap-4">
            {experience && <Stat value={experience} label="Year Experience" />}
            <Stat value={wishlistCount} label="Wishlisted" />
          </div>

          <VendorCategoryChip vendor={vendor} />
        </div>
      </div>

      <VendorLocationStrip vendor={vendor} />
    </Link>
  );
}
