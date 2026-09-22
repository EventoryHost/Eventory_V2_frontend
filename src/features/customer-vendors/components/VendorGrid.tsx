import type { Vendor } from "../types";
import VendorCard from "./VendorCard";

export default function VendorGrid({
  vendors,
  bookmarkedIds,
  onToggleBookmark,
}: {
  vendors: Vendor[];
  bookmarkedIds: ReadonlySet<string>;
  onToggleBookmark: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {vendors.map((vendor) => (
        <VendorCard
          key={vendor.id}
          vendor={vendor}
          isBookmarked={bookmarkedIds.has(vendor.id)}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );
}
