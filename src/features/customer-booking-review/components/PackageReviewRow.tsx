import Image from "next/image";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { resolveVendorCategory } from "@/lib/vendorType";
import type { BookingPackageRow } from "@/features/customer-booking-detail/types";
import StarRating from "./StarRating";

/**
 * One package card under "How were the packages for your event?" (node
 * 2023:8395). Clicking the card opens its "Share your thoughts" popup;
 * clicking a star does too, pre-filled with that rating.
 */
export default function PackageReviewRow({
  row,
  rating,
  savedRating,
  onOpen,
  onRate,
}: {
  row: BookingPackageRow;
  rating: number;
  /** Set once this package has been reviewed — the stars then show it read-only. */
  savedRating?: number;
  onOpen: () => void;
  onRate: (value: number) => void;
}) {
  const category = resolveVendorCategory(row.vendorType);
  const meta = category ? CATEGORY_META[category.category] : undefined;
  const title = row.variantLabel ? `${row.name} · ` : row.name;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E4E4E7] bg-white py-3 pl-3 pr-4 transition-colors hover:border-[#D4D4D8] sm:min-h-[93px] sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={onOpen}
        aria-label={savedRating ? `View your review of ${row.name}` : `Review ${row.name}`}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
      >
        <div className="relative h-[66px] w-[67px] shrink-0 overflow-hidden rounded-[4px] bg-[#F4F4F5]">
          {row.image && <Image src={row.image} alt={row.name} fill sizes="67px" className="object-cover" />}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {category && (
            <span
              className="flex items-center gap-2 self-start rounded-[52px] py-0.5 pl-0.5 pr-2.5"
              style={{ background: `linear-gradient(to right, #ffffff, ${meta?.gradientFrom ?? "#FFE5E9"} 80%)` }}
            >
              {meta?.icon && (
                <Image src={meta.icon} alt="" width={14} height={14} className="h-3.5 w-3.5 object-contain" />
              )}
              <span className="whitespace-nowrap text-[11px] font-semibold uppercase leading-[18px] tracking-[-0.01em] text-[#3C060D]">
                {category.label}
              </span>
            </span>
          )}

          <div className="flex min-w-0 flex-col">
            <p className="truncate text-[14px] leading-[21px] text-[#09090B]">
              <span className="font-semibold">{title}</span>
              {row.variantLabel && <span className="text-[#71717B]">{row.variantLabel}</span>}
            </p>
            {row.vendorName && <p className="truncate text-[14px] leading-5 text-[#3F3F47]">{row.vendorName}</p>}
          </div>
        </div>
      </button>

      <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
        {savedRating ? (
          <>
            <StarRating size="md" value={savedRating} label={`Your rating for ${row.name}`} />
            <span className="text-[12px] leading-[18px] text-[#9F9FA9]">You rated this package</span>
          </>
        ) : (
          <StarRating size="md" value={rating} onChange={onRate} label={`Rate ${row.name}`} />
        )}
      </div>
    </div>
  );
}
