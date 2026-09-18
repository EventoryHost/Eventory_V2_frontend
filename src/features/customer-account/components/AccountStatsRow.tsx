import { Bookmark, Calendar, Eye, ShoppingCart } from "lucide-react";

interface AccountStatsRowProps {
  bookings: number;
  cartItems: number;
  wishlist: number;
  viewedItems: number;
}

export default function AccountStatsRow({
  bookings,
  cartItems,
  wishlist,
  viewedItems,
}: AccountStatsRowProps) {
  const tiles = [
    { label: "Your Bookings", value: bookings, icon: Calendar },
    { label: "Items in Cart", value: cartItems, icon: ShoppingCart },
    { label: "Wishlist", value: wishlist, icon: Bookmark },
    { label: "Viewed Items", value: viewedItems, icon: Eye },
  ];

  return (
    <div className="grid grid-cols-2 items-center gap-6 overflow-hidden rounded-[24px] border border-[#E4E4E7] bg-white p-5 sm:grid-cols-4">
      {tiles.map(({ label, value, icon: Icon }, index) => (
        <div key={label} className="flex items-center">
          {/* Dividers sit between tiles, and only in the single-row layout —
              the 2-col phone grid would otherwise draw one mid-row. */}
          {index > 0 && (
            <span aria-hidden className="mr-6 hidden h-14 w-px shrink-0 bg-[#E4E4E7] sm:block" />
          )}
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded-2xl p-2">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[24px] font-bold leading-8 text-[#030303]">{value}</p>
              <p className="truncate text-[14px] font-semibold leading-5 text-[#71717B]">{label}</p>
            </div>
            <span className="flex shrink-0 items-center rounded-[14px] border border-[#E4E4E7] bg-[#FAFAFA] p-3">
              <Icon className="h-5 w-5 text-[#030303]" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
