import type { Vendor } from "../types";
import VendorListCard from "./VendorListCard";

export default function VendorList({
  vendors,
  bookmarkedIds,
  onToggleBookmark,
}: {
  vendors: Vendor[];
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {vendors.map((vendor) => (
        <VendorListCard
          key={vendor.id}
          vendor={vendor}
          isBookmarked={bookmarkedIds.has(vendor.id)}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  );
}
