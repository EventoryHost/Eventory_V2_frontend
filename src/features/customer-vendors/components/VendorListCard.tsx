import Image from "next/image";
import Link from "next/link";
import { Bookmark, MapPin } from "lucide-react";
import type { Vendor } from "../types";
import { formatPrice } from "../utils/currency";
import VendorRating from "./VendorRating";

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
}: {
  vendor: Vendor;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
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

      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded bg-[#FFF5F6] px-3 py-1 font-figtree text-[11px] font-bold tracking-tight text-brand-primary uppercase">
              {vendor.categoryLabel}
            </span>
            <span className="truncate font-figtree text-[11px] font-medium text-neutral-tertiary">
              • {formatEventTags(vendor.eventTypes)}
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

        <VendorRating rating={vendor.rating} reviewCount={vendor.reviewCount} size="md" />

        <p className="line-clamp-2 max-w-2xl font-figtree text-[14px] text-neutral-secondary">
          {vendor.description}
        </p>

        <div className="mt-auto flex items-center gap-1.5 border-t border-black/5 pt-4 font-figtree text-[14px] font-medium text-error-700">
          <MapPin className="h-[18px] w-[18px] shrink-0" />
          {vendor.location}
        </div>
      </div>
    </Link>
  );
}
