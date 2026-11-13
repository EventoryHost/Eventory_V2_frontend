import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Check } from "lucide-react";

const FALLBACK_IMAGE = "/images/customer/packages-pics.png";

export type ProductCardProps = {
  image: string;
  categoryLabel: string;
  categoryIcon: string;
  tags: string[];
  title: string;
  rating: number;
  reviewCount: number;
  /** No longer shown (Figma node 3233:35936 dropped these rows); still accepted so existing callers are unchanged. */
  duration: string;
  guestCapacity: string;
  price: string;
  priceSuffix?: string;
  /** No longer shown (the location footer was dropped from the card design); still accepted so existing callers are unchanged. */
  locations: string[];
  /** Real counts from the package. Each stat is hidden when it is 0 (variants: 1 or fewer). */
  setupsCount?: number;
  itemsCount?: number;
  variantCount?: number;
  /** Shows the "Customize it" ribbon: the package has setup items a customer can change. */
  customizable?: boolean;
  categoryGradientFrom?: string;
  categoryGradientTo?: string;
  href?: string;
  /**
   * Carousels give this card a fixed 316px slot; a responsive grid (the
   * vendor profile's package section) sizes it from the outside instead.
   * Defaults to the fixed width so every existing caller is unchanged.
   */
  fullWidth?: boolean;
  /**
   * Bookmark wiring. The button renders either way. Without a handler it
   * stays the inert placeholder it has always been, so callers that don't
   * manage wishlist state keep their current behaviour.
   */
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  /**
   * Package listing's "Compare Packages" mode (customer-package-listing's
   * PackageListingContent), same checkbox styling as the wishlist's own
   * compare checkbox (WishlistItemCard.tsx, node 1541:6257). Only rendered
   * when a handler is passed, so every other caller of this card (landing
   * carousels, vendor profile) is unaffected.
   */
  isCompareSelected?: boolean;
  onToggleCompare?: () => void;
  /** Greyed out, non-interactive: comparison is full (3) or locked to a different category and this card doesn't qualify. */
  compareDisabled?: boolean;
};

function formatTags(tags: string[]) {
  const visible = tags.slice(0, 3);
  const remaining = tags.length - visible.length;
  const label = visible.join(" • ");
  return remaining > 0 ? `${label} • +${remaining} more` : label;
}

// Figma node 3233:35936.
export default function ProductCard({
  image,
  categoryLabel,
  categoryIcon,
  tags,
  title,
  rating,
  reviewCount,
  price,
  priceSuffix = "/event",
  setupsCount = 0,
  itemsCount = 0,
  variantCount = 0,
  customizable = false,
  categoryGradientFrom = "#FFE5E9",
  categoryGradientTo = "#ffffff",
  href = "/packages",
  fullWidth = false,
  isBookmarked = false,
  onToggleBookmark,
  isCompareSelected = false,
  onToggleCompare,
  compareDisabled = false,
}: ProductCardProps) {
  // Some real package images are stale CloudFront URLs that now 404. Rather
  // than showing a broken-image icon, swap to the same fallback a missing
  // `image` already uses once the real URL fails to load.
  const [imgSrc, setImgSrc] = useState(image);
  // Callers like PackagesCarousel render a fixed number of these cards with
  // static placeholder data first, then swap in real packages once the API
  // resolves (same array length/keys, so React reuses these instances).
  // useState(image) only captures the prop on the FIRST render, so re-sync
  // whenever the `image` prop actually changes.
  useEffect(() => {
    setImgSrc(image);
  }, [image]);

  return (
    <Link
      href={href}
      className={`flex flex-col overflow-hidden rounded-[20px] border border-[#F0F0F0] bg-white transition-transform duration-200 ease-out hover:scale-[1.02] ${
        fullWidth ? "w-full" : "w-[316px]"
      }`}
    >
      {/* Image */}
      <div className="relative h-[191px] w-full shrink-0">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
        {onToggleCompare && (
          <button
            type="button"
            disabled={compareDisabled && !isCompareSelected}
            aria-pressed={isCompareSelected}
            aria-label={isCompareSelected ? `Remove ${title} from comparison` : `Add ${title} to comparison`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleCompare();
            }}
            className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_0_2px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${
                isCompareSelected ? "border-brand-primary bg-brand-primary" : "border-[#71717B]"
              }`}
            >
              {isCompareSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </span>
          </button>
        )}
        <button
          type="button"
          aria-label={isBookmarked ? `Remove ${title} from saved` : `Save ${title}`}
          aria-pressed={isBookmarked}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleBookmark?.();
          }}
          className="absolute top-4 right-4 flex items-center rounded-full bg-black/20 p-1.5 backdrop-blur-[7px]"
        >
          {isBookmarked ? (
            <Bookmark className="h-5 w-5 text-white" fill="currentColor" />
          ) : (
            <Image src="/images/customer/package-detail/card-bookmark.svg" alt="" width={20} height={20} className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex w-full flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-6 w-fit shrink-0 items-center gap-2 rounded-[52px] py-1 pr-3 pl-1"
            style={{
              background: `linear-gradient(to left, ${categoryGradientFrom}, ${categoryGradientTo})`,
            }}
          >
            <Image
              src={categoryIcon}
              alt={categoryLabel}
              width={16}
              height={16}
              className="h-4 w-4 rounded-full object-contain"
            />
            <span className="font-figtree text-[12px] leading-[18px] font-bold tracking-[-0.12px] whitespace-nowrap text-[#3C060D] uppercase">
              {categoryLabel}
            </span>
          </div>

          <span className="h-3 w-px shrink-0 bg-black/15" />

          <p className="truncate font-figtree text-[14px] leading-[18px] font-medium tracking-[-0.14px] text-[#B4112A]">
            {formatTags(tags)}
          </p>
        </div>

        {/* min-h reserves 2 lines so a short title doesn't make a card
            shorter than its neighbours (PM-reported alignment issue, 2026-10-15). */}
        <h3 className="min-h-[44px] font-figtree text-[16px] leading-[22px] font-semibold tracking-[-0.16px] text-[#1A1A1A] line-clamp-2">
          {title}
        </h3>

        {/* Rating: only once the package actually has reviews */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Image src="/images/customer/package-detail/card-star.svg" alt="" width={17} height={17} className="h-[17px] w-[17px]" />
            <span className="font-figtree text-[14px] leading-5 font-medium tracking-[-0.14px] text-[#666]">
              <span className="font-semibold text-[#1A1A1A]">{rating} </span>
              from {reviewCount} reviews
            </span>
          </div>
        )}

        {(setupsCount > 0 || variantCount > 1) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {setupsCount > 0 && (
              <span className="flex items-center gap-1 font-figtree text-[14px] leading-4 font-medium text-[#666]">
                <Image src="/images/customer/package-detail/card-box.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
                {setupsCount} setup{setupsCount === 1 ? "" : "s"}
                {itemsCount > 0 && ` · ${itemsCount} item${itemsCount === 1 ? "" : "s"}`}
              </span>
            )}
            {variantCount > 1 && (
              <span className="flex items-center gap-1 font-figtree text-[14px] leading-4 font-medium text-[#666]">
                <Image src="/images/customer/package-detail/card-variants.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
                {variantCount} variants
              </span>
            )}
          </div>
        )}

        {/* Pinned to the bottom of the card, so in a row of cards with different
            amounts of content the divider and price line up across all of them. */}
        <div className="mt-auto flex flex-col gap-4">
        <div className="h-px w-full bg-black/10" />

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-figtree text-[11px] leading-[14px] font-medium tracking-wide text-[#9F9FA9] uppercase">
              Starting from
            </p>
            <p className="font-figtree font-bold tracking-[-0.24px] text-black">
              <span className="text-[24px] leading-8">{price}</span>
              <span className="text-[16px] leading-8">{priceSuffix}</span>
            </p>
          </div>
          {customizable && (
            <span className="relative mb-1 flex h-5 w-[106px] shrink-0 items-center justify-center">
              <Image
                src="/images/customer/package-detail/card-customize-ribbon.svg"
                alt=""
                width={106}
                height={20}
                className="absolute inset-0 h-full w-full"
              />
              <span className="relative font-figtree text-[11px] leading-4 font-semibold tracking-[0.11px] whitespace-nowrap text-white">
                CUSTOMIZE IT
              </span>
            </span>
          )}
        </div>
        </div>
      </div>
    </Link>
  );
}
