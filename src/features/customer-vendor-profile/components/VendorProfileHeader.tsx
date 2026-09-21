"use client";

import { useState } from "react";
import Image from "next/image";
import { Bookmark, Check, Clock, Share2 } from "lucide-react";
import type { VendorProfile } from "../types";

const VERIFIED_BADGE = "/images/customer/vendors/verified-badge.svg";
const FALLBACK_CATEGORY_ICON = "/images/customer/packages-pics.png";

/**
 * Name, verified badge, category chip, description — and the Share /
 * Wishlist / Inquire Now column.
 *
 * The design lays out six category chips side by side. A Vendor has a
 * single `vendorType`, so one chip is rendered; the rest of the row in
 * Figma is a swatch of every category's styling, not six real values.
 */
export default function VendorProfileHeader({
  vendor,
  isBookmarked,
  onToggleBookmark,
  onInquire,
}: {
  vendor: VendorProfile;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onInquire: () => void;
}) {
  const [justCopied, setJustCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
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
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-col gap-2 lg:max-w-[755px]">
        <div className="flex flex-col gap-3">
          {/* No chip at all for a vendor who never picked a trade — better
              than one reading "ALL". */}
          {vendor.categoryLabel && (
          <div
            className="flex w-fit items-center gap-2 rounded-[52px] py-0.5 pr-2 pl-1"
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
          )}

          <div className="flex items-center gap-1.5">
            <h1 className="truncate font-figtree text-[20px] leading-[28px] font-semibold text-[#030303]">
              {vendor.name}
            </h1>
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
        </div>

        {vendor.description && (
          <p className="font-figtree text-[14px] leading-[20px] font-medium text-[#3f3f47]">
            {vendor.description}
          </p>
        )}
      </div>

      <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[270px]">
        <div className="flex items-center justify-between py-0.5">
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2.5 font-figtree text-[14px] leading-[20px] font-medium text-[#030303] transition-colors hover:text-brand-primary"
          >
            {justCopied ? <Check className="size-4" strokeWidth={1.6} /> : <Share2 className="size-4" strokeWidth={1.6} />}
            {justCopied ? "Copied!" : "Share"}
          </button>

          <span className="h-4 w-px shrink-0 bg-[#e4e4e7]" />

          <button
            type="button"
            aria-pressed={isBookmarked}
            onClick={onToggleBookmark}
            className="flex flex-1 items-center justify-center gap-2.5 font-figtree text-[14px] leading-[20px] font-medium text-[#030303] transition-colors hover:text-brand-primary"
          >
            <Bookmark
              className="size-4"
              strokeWidth={1.6}
              fill={isBookmarked ? "currentColor" : "none"}
            />
            Wishlist
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onInquire}
            className="w-full rounded-[44px] bg-[#030303] px-4 py-2 font-figtree text-[14px] leading-[20px] font-semibold text-[#fafafa] transition-opacity hover:opacity-90"
          >
            Inquire Now
          </button>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3 text-[#3f3f47]" strokeWidth={1.6} />
            <span className="font-figtree text-[11px] leading-[16px] font-medium text-[#3f3f47]">
              Usually responds under 6 hrs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
