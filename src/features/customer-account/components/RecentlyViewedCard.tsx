import Image from "next/image";
import Link from "next/link";
import { Map, Star } from "lucide-react";
import type { RecentlyViewedPackage } from "@/lib/recentlyViewed";

function formatTags(tags: string[], moreCount: number) {
  const label = tags.join(" • ");
  return moreCount > 0 ? `${label} • +${moreCount} more` : label;
}

export default function RecentlyViewedCard({ item }: { item: RecentlyViewedPackage }) {
  return (
    <Link
      href={`/packages/${item.packageId}`}
      className="block overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white transition-shadow hover:shadow-sm"
    >
      <div className="flex flex-col gap-4 p-[19px] sm:flex-row sm:items-start">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            width={115}
            height={115}
            className="h-[115px] w-full shrink-0 rounded-xl object-cover sm:w-[115px]"
          />
        ) : (
          <div className="h-[115px] w-full shrink-0 rounded-xl bg-[#F4F4F5] sm:w-[115px]" />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:pl-5">
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
                  className="h-4 w-4 rounded-full object-contain"
                />
              )}
              <span className="whitespace-nowrap text-[12px] font-bold leading-[18px] tracking-[-0.01em] text-[#3C060D]">
                {item.categoryLabel.toUpperCase()}
              </span>
            </span>

            <span aria-hidden className="h-3 w-px shrink-0 bg-black/10" />

            <p className="truncate text-[14px] font-medium leading-[18px] tracking-[-0.01em] text-[#B4112A]">
              {formatTags(item.eventTags, item.moreEventTagsCount)}
            </p>
          </div>

          {/* Title + variant */}
          <div className="flex flex-col gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-[3px]">
              <span className="truncate text-[16px] font-medium text-[#030303]">{item.title}</span>
              {item.variantLabel && (
                <>
                  <span aria-hidden className="h-1 w-1 rounded-full bg-[#D4D4D8]" />
                  <span className="truncate text-[16px] font-medium text-[#71717B]">
                    {item.variantLabel}
                  </span>
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

        {/* Price */}
        <div className="flex shrink-0 flex-col gap-1 sm:items-start sm:pl-6">
          <p className="text-[11px] leading-[14px] text-[#9F9FA9]">STARTING FROM</p>
          <p className="whitespace-nowrap font-bold tracking-[-0.012em] text-black">
            <span className="text-[20px] leading-6">{item.price}</span>
            <span className="text-[14px] leading-6">{item.priceSuffix ?? "/event"}</span>
          </p>
        </div>
      </div>

      {/* Location strip */}
      <div className="flex items-center gap-2 border-t border-[#F0F0F0] px-5 py-1.5">
        <Map className="h-4 w-4 shrink-0 text-[#790B1A]" />
        <p className="truncate text-[14px] font-medium leading-5 text-[#790B1A]">
          Available in {item.locationSummary}
        </p>
      </div>
    </Link>
  );
}
