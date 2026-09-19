"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, Bookmark, Calendar, Check, Share2 } from "lucide-react";
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
type VendorCardLinkTarget = "vendor" | "package";


/** One stat: outlined circular icon chip, then value over label. */
function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Calendar;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#e4e4e7]">
        <Icon className="size-5 text-[#030303]" strokeWidth={1.6} />
      </span>
      <div className="flex flex-col items-start whitespace-nowrap">
        <span className="font-figtree text-[16px] leading-[24px] font-bold text-[#030303]">
          {value}
        </span>
        <span className="font-figtree text-[11px] leading-[16px] font-medium text-[#71717b]">
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * The Figma "Vendor Listing" list row (node 1418:12903) — 988x246 in the
 * design, fluid here.
 *
 * Same vendor-centric content as the grid card plus a description, a wider
 * stat row and Wishlist/Share actions. Like the grid card, a click opens
 * the vendor profile — see VendorCardLinkTarget.
 */
export default function VendorListCard({
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
  const [justCopied, setJustCopied] = useState(false);
  const href =
    linkTo === "vendor" && vendor.vendorProfileId
      ? `/vendors/${vendor.vendorProfileId}`
      : `/packages/${vendor.id}`;

  const bookingsPerYear = formatRangeStat(vendor.bookingsPerYear);
  const wishlistCount = formatWishlistCount(vendor.wishlistCount);
  const experience = formatRangeStat(vendor.experience);

  async function handleShare(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Shares whatever the card itself opens, so a shared link lands the
    // recipient on the page the sender was looking at.
    const url = `${window.location.origin}${href}`;
    // Same approach as the PDP's ShareModal — the native sheet where the
    // browser offers one, clipboard otherwise. Not reusing ShareModal
    // itself: it is built around a PDP ShareTarget and a "create
    // quotation" action that have no meaning in a listing row.
    if (navigator.share) {
      navigator.share({ title: vendor.name, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch {
      // Best-effort — clipboard access can be denied by the browser.
    }
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[20px] border border-[#e4e4e7] bg-white transition-colors hover:border-brand-primary"
    >
      <div className="flex flex-col gap-3 px-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-5">
            <div className="relative size-[84px] shrink-0 overflow-hidden rounded-full bg-neutral-subtle">
              <Image
                src={vendor.avatar || vendor.categoryIcon || FALLBACK_AVATAR}
                alt=""
                fill
                sizes="84px"
                className="object-cover"
              />
            </div>

            <div className="flex min-w-0 flex-col gap-1">
              <VendorNameHeader vendor={vendor} />
              <VendorRatingLine vendor={vendor} />
              {vendor.description && (
                <p className="mt-2 line-clamp-2 max-w-[532px] font-figtree text-[12px] leading-[18px] font-medium text-[#3f3f47]">
                  {vendor.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label={isBookmarked ? `Remove ${vendor.name} from saved` : `Save ${vendor.name}`}
              aria-pressed={isBookmarked}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onToggleBookmark(vendor.id);
              }}
              className="flex items-center gap-1.5 font-figtree text-[12px] leading-[18px] font-medium text-[#3f3f47] transition-colors hover:text-brand-primary"
            >
              <Bookmark
                className="size-4 shrink-0"
                strokeWidth={1.6}
                fill={isBookmarked ? "currentColor" : "none"}
              />
              Wishlist
            </button>

            <span className="h-3 w-px bg-[#e4e4e7]" />

            <button
              type="button"
              aria-label={`Share ${vendor.name}`}
              onClick={handleShare}
              className="flex items-center gap-1.5 font-figtree text-[12px] leading-[18px] font-medium text-[#3f3f47] transition-colors hover:text-brand-primary"
            >
              {justCopied ? (
                <Check className="size-4 shrink-0" strokeWidth={1.6} />
              ) : (
                <Share2 className="size-4 shrink-0" strokeWidth={1.6} />
              )}
              {justCopied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-[#e4e4e7]" />

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          {/*
            The design shows four stats. "Profile Views" is omitted: nothing
            records it — there is no view counter on Vendor and no
            ViewedItem collection on this backend — so there is no number to
            put there. Add a Stat with a TrendingUp icon once one exists.

            Wishlisted always shows, including "0". The other two are
            skipped when the vendor never entered them — neither has a
            sensible zero.
          */}
          <div className="flex flex-wrap items-center gap-8">
            {bookingsPerYear && (
              <Stat icon={Calendar} value={bookingsPerYear} label="Bookings/ Year" />
            )}
            <Stat icon={Bookmark} value={wishlistCount} label="Wishlisted" />
            {experience && <Stat icon={Award} value={experience} label="Experience" />}
          </div>

          {/* Design stacks up to three chips; a Vendor has one vendorType. */}
          <VendorCategoryChip vendor={vendor} />
        </div>
      </div>

      <VendorLocationStrip vendor={vendor} />
    </Link>
  );
}
