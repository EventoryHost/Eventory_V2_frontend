import Image from "next/image";
import Link from "next/link";
import { Map, Star } from "lucide-react";
import type { RecentlyViewedPackage } from "@/lib/recentlyViewed";

/**
 * The grid card on Viewed Items (node 1414:8212). Close cousin of the
 * landing page's ProductCard, but that one renders duration/guest-capacity
 * rows this data has no values for, so it can't be reused as-is.
 *
 * The design also shows two rows literally labelled "Key Highlight" — the
 * same placeholder text twice, with nothing behind it in the store or the
 * package payload. Omitted rather than invented; add them once there's real
 * highlight data to put there.
 */
export default function ViewedItemCard({ item }: { item: RecentlyViewedPackage }) {
  const tags = item.moreEventTagsCount > 0
    ? `${item.eventTags.join(" • ")} • +${item.moreEventTagsCount} more`
    : item.eventTags.join(" • ");

  return (
    <Link
      href={`/packages/${item.packageId}`}
      className="flex w-[300px] flex-col overflow-hidden rounded-[20px] border border-[#F0F0F0] bg-white transition-shadow hover:shadow-sm"
    >
      <div className="relative h-[191px] w-full overflow-hidden bg-[#F4F4F5]">
        {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
      </div>

      <div className="flex flex-1 flex-col gap-5 pt-4">
        <div className="flex flex-col gap-6 px-3">
          <div className="flex flex-col gap-4">
            {/* Category pill + event tags */}
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-6 shrink-0 items-center justify-center gap-2 rounded-[52px] py-1 pl-1 pr-3"
                style={{
                  background: `linear-gradient(to right, #ffffff, ${item.categoryGradientFrom ?? "#FFE5E9"} 80%)`,
                }}
              >
                {item.categoryIcon && (
                  <Image
                    src={item.categoryIcon}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 object-contain"
                  />
                )}
                <span className="whitespace-nowrap text-[12px] font-bold leading-[18px] tracking-[-0.01em] text-[#1A1A1A]">
                  {item.categoryLabel.toUpperCase()}
                </span>
              </span>

              <span aria-hidden className="h-3 w-px shrink-0 bg-black/10" />

              <p className="truncate text-[14px] font-medium leading-[18px] tracking-[-0.01em] text-[#B4112A]">
                {tags}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="line-clamp-2 text-[16px] font-semibold leading-[22px] tracking-[-0.01em] text-[#1A1A1A]">
                {item.title}
                {item.variantLabel ? ` - ${item.variantLabel}` : ""}
              </h3>

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

          <span aria-hidden className="h-px w-full bg-[#F0F0F0]" />

          <div className="flex flex-col gap-1">
            <p className="text-[11px] leading-[14px] text-[#9F9FA9]">STARTING FROM</p>
            <p className="font-bold tracking-[-0.01em] text-black">
              <span className="text-[24px] leading-8">{item.price}</span>
              <span className="text-[16px] leading-8">{item.priceSuffix ?? "/event"}</span>
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-[#F0F0F0] px-4 py-1.5">
          <Map className="h-4 w-4 shrink-0 text-[#790B1A]" />
          <p className="truncate text-[14px] font-medium leading-5 text-[#790B1A]">
            {item.locationSummary}
          </p>
        </div>
      </div>
    </Link>
  );
}
