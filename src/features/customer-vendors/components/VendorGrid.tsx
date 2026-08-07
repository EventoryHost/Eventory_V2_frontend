import type { Vendor } from "../types";
import VendorGridCard from "./VendorGridCard";

export default function VendorGrid({
  vendors,
  bookmarkedIds,
  onToggleBookmark,
}: {
  vendors: Vendor[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {vendors.map((vendor) => (
        <VendorGridCard
          key={vendor.id}
          vendor={vendor}
          isBookmarked={bookmarkedIds.has(vendor.id)}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );
}
