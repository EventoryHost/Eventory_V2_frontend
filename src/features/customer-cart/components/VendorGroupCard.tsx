"use client";

import type { CartVendor, RecommendedAddon } from "../types";
import CartItemRow from "./CartItemRow";

/**
 * One vendor, with every cart item (package) for that vendor listed
 * underneath — the real cart groups items by vendorId (see
 * customerCartApi.ts's RawCartVendorGroup), so a vendor with 2+ packages in
 * the cart shows as one card here, not one card per package.
 */
export default function VendorGroupCard({
  vendorName,
  avatarInitial,
  items,
  recommendedAddons,
  onToggleSelected,
  onRemove,
  onMoveToWishlist,
  onIncrementAddon,
  onDecrementAddon,
  onRemoveAddon,
  onAddRecommendedAddon,
}: {
  vendorName: string;
  avatarInitial: string;
  items: CartVendor[];
  recommendedAddons: RecommendedAddon[];
  onToggleSelected: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
  onIncrementAddon: (itemId: string, addonId: string) => void;
  onDecrementAddon: (itemId: string, addonId: string) => void;
  onRemoveAddon: (itemId: string, addonId: string) => void;
  onAddRecommendedAddon: (addon: RecommendedAddon) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-neutral-subtle pb-4">
        <div
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle font-figtree text-[13px] font-bold text-brand-primary"
        >
          {avatarInitial}
        </div>
        <span className="font-figtree text-[16px] font-semibold text-neutral-primary">
          {vendorName}
        </span>
        <span className="font-figtree text-[13px] text-neutral-secondary">
          &middot; {items.length} package{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-col gap-8">
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-col gap-6">
            {index > 0 && <hr className="border-neutral-subtle/50" />}
            <CartItemRow
              item={item}
              recommendedAddons={recommendedAddons.filter((addon) => addon.itemId === item.id)}
              onToggleSelected={onToggleSelected}
              onRemove={onRemove}
              onMoveToWishlist={onMoveToWishlist}
              onIncrementAddon={onIncrementAddon}
              onDecrementAddon={onDecrementAddon}
              onRemoveAddon={onRemoveAddon}
              onAddRecommendedAddon={onAddRecommendedAddon}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
