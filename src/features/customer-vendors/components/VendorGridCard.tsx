import Image from "next/image";
import { Bookmark, Clock, MapPin, Users } from "lucide-react";
import type { Vendor } from "../types";
import { formatPrice } from "../utils/currency";
import { CATEGORY_ICON } from "./categoryIcons";
import VendorRating from "./VendorRating";

function formatEventTags(eventTypes: string[]) {
  return eventTypes.slice(0, 2).join(" • ");
}

export default function VendorGridCard({
  vendor,
  isBookmarked,
  onToggleBookmark,
}: {
  vendor: Vendor;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}) {
  const CategoryIcon = CATEGORY_ICON[vendor.category];

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-black/10 bg-white transition-colors hover:border-brand-primary">
      <div className="relative h-[190px] w-full overflow-hidden">
        <Image
          src={vendor.images[0]}
          alt={vendor.packageName}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          type="button"
          aria-label={isBookmarked ? `Remove ${vendor.name} from saved` : `Save ${vendor.name}`}
          aria-pressed={isBookmarked}
          onClick={() => onToggleBookmark(vendor.id)}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
        >
          <Bookmark
            className={`h-[18px] w-[18px] ${isBookmarked ? "fill-brand-primary text-brand-primary" : "text-brand-primary"}`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex shrink-0 items-center gap-1 rounded bg-[#FFF5F6] px-2.5 py-1">
            {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5 text-brand-primary" />}
            <span className="font-figtree text-[11px] font-bold tracking-tight text-brand-primary uppercase">
              {vendor.categoryLabel}
            </span>
          </div>
          <span className="truncate font-figtree text-[11px] font-medium text-neutral-tertiary">
            • {formatEventTags(vendor.eventTypes)}
          </span>
        </div>

        <h3 className="line-clamp-2 font-figtree text-[16px] leading-tight font-semibold text-neutral-primary">
          {vendor.packageName}
        </h3>

        <VendorRating rating={vendor.rating} reviewCount={vendor.reviewCount} />

        <div className="flex items-center gap-4 font-figtree text-[13px] text-neutral-secondary">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {vendor.duration}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {vendor.guestCapacity}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-black/5 pt-4">
          <div>
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

          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-error-700" />
            <p className="truncate font-figtree text-[12px] font-medium text-error-700">
              {vendor.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
