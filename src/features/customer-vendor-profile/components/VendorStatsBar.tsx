import { Award, Bookmark, Calendar, Users } from "lucide-react";
import { formatRangeStat, formatWishlistCount } from "@/features/customer-vendors/utils/vendorStats";
import type { VendorProfileStats } from "../types";

/**
 * The five-stat bar under the header. Each stat carries its own icon-chip
 * border colour from the design.
 *
 * "Profile Views" (the design's fourth stat) is omitted: nothing records
 * it. There is no view counter on Vendor and no ViewedItem collection on
 * this backend, so there is no number to show — see VendorListCard, which
 * leaves out the same stat for the same reason.
 */
export default function VendorStatsBar({ stats }: { stats: VendorProfileStats }) {
  const entries = [
    { key: "experience", icon: Award, border: "#fcdee2", value: formatRangeStat(stats.experience), label: "Experience" },
    { key: "bookings", icon: Calendar, border: "#e0ccff", value: formatRangeStat(stats.bookingsPerYear), label: "Bookings /year" },
    { key: "wishlist", icon: Bookmark, border: "#ffe5c2", value: formatWishlistCount(stats.wishlistCount), label: "Wishlisted" },
    { key: "team", icon: Users, border: "#bedbff", value: formatRangeStat(stats.teamSize), label: "Team Members" },
    // Wishlisted always has a value (0 included) so it never drops out;
    // the rest fall away when the vendor left them blank.
  ].filter((entry) => entry.value);

  // A brand-new vendor may have filled none of these in — an empty bar is
  // just a stray bordered strip, so drop it entirely.
  if (entries.length === 0) return null;

  return (
    <div className="w-fit max-w-full overflow-x-auto rounded-[20px] border border-[#e4e4e7] bg-gradient-to-r from-[#f4f4f5] to-[#fafafa] px-4 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-8">
        {entries.map(({ key, icon: Icon, border, value, label }, index) => (
          <div key={key} className="flex items-center gap-8">
            {index > 0 && <span className="h-11 w-px shrink-0 bg-[#e4e4e7]" />}
            <div className="flex shrink-0 items-center gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white"
                style={{ border: `1px solid ${border}` }}
              >
                <Icon className="size-4 text-[#030303]" strokeWidth={1.8} />
              </span>
              <div className="flex flex-col items-start whitespace-nowrap">
                <span className="font-figtree text-[18px] leading-[24px] font-bold text-[#030303]">
                  {value}
                </span>
                <span className="font-figtree text-[14px] leading-[20px] font-medium text-[#3f3f47]">
                  {label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
