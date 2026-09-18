"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Check, Map, Pencil, Share2, Star } from "lucide-react";
import { formatEventTags, type WishlistCardItem } from "../utils/wishlistCards";

/**
 * One saved item in the wishlist drill-down (node 1541:6257).
 *
 * The compare checkbox sits on the image, the Wishlist/Share actions top
 * right, and the note panel runs the full width below — all three are on the
 * package card in the design. A saved vendor reuses the same card without the
 * price block (vendors have no package price to show).
 *
 * The card holds its own buttons, so the image and the title link to the
 * package rather than the whole card being wrapped in an anchor.
 */
export default function WishlistItemCard({
  item,
  isSelected,
  onToggleSelect,
  onRemove,
  onShare,
  isShared,
}: {
  item: WishlistCardItem;
  /** Omitted when the card can't join a comparison (saved vendors). */
  isSelected?: boolean;
  onToggleSelect?: (packageId: string) => void;
  onRemove: (itemId: string) => void;
  onShare: (item: WishlistCardItem) => void;
  /** True right after Share copied this card's link, for the transient label. */
  isShared?: boolean;
}) {
  const canCompare = Boolean(item.packageId && onToggleSelect);

  const image = item.image ? (
    <Image src={item.image} alt={item.title} fill sizes="150px" className="object-cover" />
  ) : null;

  return (
    <article className="overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white">
      <div className="flex flex-col gap-4 px-[19px] pt-[19px] sm:flex-row sm:gap-5">
        <div className="relative h-[150px] w-full shrink-0 overflow-hidden rounded-xl bg-[#F4F4F5] sm:w-[150px]">
          {item.href ? (
            <Link href={item.href} className="absolute inset-0" aria-label={item.title}>
              {image}
            </Link>
          ) : (
            image
          )}

          {canCompare && (
            <button
              type="button"
              onClick={() => onToggleSelect!(item.packageId!)}
              aria-pressed={isSelected}
              aria-label={isSelected ? `Remove ${item.title} from comparison` : `Add ${item.title} to comparison`}
              className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_0_2px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#FAFAFA]"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${
                  isSelected ? "border-brand-primary bg-brand-primary" : "border-[#71717B]"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>
            </button>
          )}
        </div>

        {/* Matches the image's height so the location strip lands on its bottom
            edge, as in the node — min, not fixed, so a long title can't spill. */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:min-h-[150px]">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-4">
              {/* Category pill + event tags */}
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-6 shrink-0 items-center justify-center gap-2 rounded-[52px] py-1 pl-1 pr-3"
                  style={{
                    background: `linear-gradient(to right, #ffffff, ${item.categoryGradientFrom ?? "#FFE5E9"} 80%)`,
                  }}
                >
                  {item.categoryIcon && (
                    <Image src={item.categoryIcon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                  )}
                  <span className="whitespace-nowrap text-[12px] font-bold leading-[18px] tracking-[-0.01em] text-[#3C060D]">
                    {item.categoryLabel.toUpperCase()}
                  </span>
                </span>

                {item.eventTags.length > 0 && (
                  <>
                    <span aria-hidden className="h-3 w-px shrink-0 bg-black/10" />
                    <p className="truncate text-[14px] font-medium leading-[18px] tracking-[-0.01em] text-[#B4112A]">
                      {formatEventTags(item.eventTags, item.moreEventTagsCount)}
                    </p>
                  </>
                )}
              </div>

              {/* Title + variant, then rating */}
              <div className="flex flex-col gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-[3px]">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="truncate text-[16px] font-medium text-[#030303] hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span className="truncate text-[16px] font-medium text-[#030303]">{item.title}</span>
                  )}
                  {item.variantLabel && (
                    <>
                      <span aria-hidden className="h-1 w-1 rounded-full bg-[#D4D4D8]" />
                      <span className="truncate text-[16px] font-medium text-[#71717B]">{item.variantLabel}</span>
                    </>
                  )}
                </div>

                {item.reviewCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EA1D3B]">
                      <Star className="h-2.5 w-2.5 fill-white text-white" />
                    </span>
                    <p className="text-[14px] tracking-[-0.01em]">
                      <span className="font-semibold leading-5 text-[#1A1A1A]">{item.rating} </span>
                      <span className="leading-5 text-[#666]">from {item.reviewCount} reviews</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions + price */}
            {/* 33px between the actions row and the price block, per the node */}
            <div className="flex shrink-0 flex-col items-end gap-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onRemove(item.itemId)}
                  className="flex h-4 items-center gap-1.5 text-[12px] font-medium leading-[18px] text-[#3F3F47] transition-colors hover:text-brand-primary"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                  Wishlist
                </button>

                <span aria-hidden className="h-3 w-px bg-black/10" />

                <button
                  type="button"
                  onClick={() => onShare(item)}
                  className="flex h-4 items-center gap-1.5 text-[12px] font-medium leading-[18px] text-[#3F3F47] transition-colors hover:text-brand-primary"
                >
                  <Share2 className="h-4 w-4" />
                  {isShared ? "Link copied" : "Share"}
                </button>
              </div>

              {item.price && (
                <div className="flex flex-col items-start gap-1">
                  <p className="text-[11px] leading-[14px] text-[#9F9FA9]">STARTING FROM</p>
                  <p className="whitespace-nowrap font-bold tracking-[-0.012em] text-black">
                    <span className="text-[20px] leading-6">{item.price}</span>
                    <span className="text-[14px] leading-6">/event</span>
                  </p>
                  {item.priceChanged && (
                    <p className="text-[11px] leading-[14px] text-[#C81E0D]">Price changed since you saved it</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location strip — bleeds into the card's padding on both sides, as designed */}
          {item.locationSummary && (
            <div className="mt-auto flex items-center gap-2 border-t border-[#F0F0F0] px-4 py-1.5 sm:-ml-5 sm:-mr-[19px]">
              <Map className="h-4 w-4 shrink-0 text-[#790B1A]" />
              <p className="truncate text-[14px] font-medium leading-5 text-[#790B1A]">
                Available in {item.locationSummary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notes — the panel is in the design even when nothing is written yet */}
      <div className="mx-[19px] mb-[19px] mt-4 flex flex-col gap-1 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3">
        <div className="flex items-center gap-2">
          <Pencil className="h-3.5 w-3.5 text-[#2B7FFF]" />
          <p className="text-[11px] leading-4 text-[#2B7FFF]">YOUR NOTES</p>
        </div>
        {item.note && <p className="text-[12px] leading-[18px] text-[#030303]">{item.note}</p>}
      </div>
    </article>
  );
}
