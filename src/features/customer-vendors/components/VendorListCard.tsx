import Image from "next/image";
import Link from "next/link";
import { Bookmark, Map } from "lucide-react";
import type { Vendor } from "../types";
import { formatPrice } from "../utils/currency";
import VendorRating from "./VendorRating";

const FALLBACK_CATEGORY_ICON = "/images/customer/packages-pics.png";

function formatEventTags(eventTypes: string[]) {
  const visible = eventTypes.slice(0, 2);
  const remaining = eventTypes.length - visible.length;
  const label = visible.join(" • ");
  return remaining > 0 ? `${label} • +${remaining} more` : label;
}

export default function VendorListCard({
  vendor,
  isBookmarked,
  onToggleBookmark,
  badge,
}: {
  vendor: Vendor;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  badge?: string;
}) {
  return (
    <Link
      href={`/packages/${vendor.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white transition-colors hover:border-brand-primary md:h-[260px] md:flex-row"
    >
      <div className="relative h-[200px] w-full shrink-0 md:h-full md:w-[34%]">
        <Image
          src={vendor.images[0]}
          alt={vendor.packageName}
          fill
          sizes="(min-width: 768px) 34vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-brand-primary px-2.5 py-1 font-figtree text-[10px] font-bold tracking-wide text-white uppercase shadow-sm">
            {badge}
          </span>
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
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <Bookmark
            className={`h-[18px] w-[18px] ${isBookmarked ? "fill-brand-primary text-brand-primary" : "text-brand-primary"}`}
          />
        </button>
      </div>

      {/*
        This wraps the padded content AND the location strip together (not
        just the padded content) so the strip can be full-bleed within this
        column's own width — on desktop this column sits beside the image
        (flex-row), so a plain sibling of the image would sit beside it too,
        not span beneath both.
      */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className="flex w-fit shrink-0 items-center gap-2 rounded-[52px] pt-1 pr-3 pb-1 pl-1"
                style={{
                  background: `linear-gradient(to left, ${vendor.categoryGradientFrom ?? "#FFE5E9"}, #ffffff)`,
                }}
              >
                <Image
                  src={vendor.categoryIcon ?? FALLBACK_CATEGORY_ICON}
                  alt={vendor.categoryLabel}
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded-full object-contain"
                />
                <span className="font-figtree text-[12px] font-semibold text-brand-950 whitespace-nowrap">
                  {vendor.categoryLabel}
                </span>
              </div>
              <span className="h-4 w-px shrink-0 bg-black/10" />
              <span className="truncate font-figtree text-[11px] font-medium text-error-700">
                {formatEventTags(vendor.eventTypes)}
              </span>
            </div>
            <div className="text-right">
              <p className="mb-0.5 font-figtree text-[11px] font-bold tracking-wider text-neutral-tertiary uppercase">
                Starting From
              </p>
              <p className="font-figtree text-[22px] leading-none font-bold text-neutral-primary sm:text-[24px]">
                {formatPrice(vendor.startingPrice)}
                <span className="ml-1 font-figtree text-[13px] font-bold text-neutral-secondary">
                  /event
                </span>
              </p>
            </div>
          </div>

          <h3 className="font-figtree text-[18px] font-bold text-neutral-primary sm:text-[20px]">
            {vendor.packageName}
          </h3>

          {vendor.reviewCount > 0 && <VendorRating rating={vendor.rating} reviewCount={vendor.reviewCount} size="md" />}

          {vendor.highlightTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {vendor.highlightTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/5 px-3 py-1.5 font-figtree text-[13px] font-medium text-neutral-primary"
                >
                  {tag}
                </span>
              ))}
              {vendor.highlightTags.length > 3 && (
                <span className="rounded-full bg-black/5 px-3 py-1.5 font-figtree text-[13px] font-medium text-neutral-tertiary">
                  +{vendor.highlightTags.length - 3}
                </span>
              )}
            </div>
          )}

          <p className="line-clamp-2 max-w-2xl font-figtree text-[14px] text-neutral-secondary">
            {vendor.description}
          </p>
        </div>

        {/* Location — full-bleed footer strip within this column's own
            width, its own top border separate from the padded content
            above. Only the first 2 locations, "..." appended when there
            are more. */}
        <div className="mt-auto flex h-8 items-center gap-2 border-t border-[#F0F0F0] px-4 py-1.5">
          <Map className="h-4 w-4 shrink-0 text-error-700" />
          <p className="truncate font-figtree text-[14px] font-medium text-error-700">
            Available in {vendor.locations.slice(0, 2).join(", ")}
            {vendor.locations.length > 2 ? "..." : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
