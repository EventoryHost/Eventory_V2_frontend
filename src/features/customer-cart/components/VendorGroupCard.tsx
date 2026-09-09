"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { CartVendor, RecommendedAddon } from "../types";
import { formatPrice } from "../utils/currency";
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
  avatar,
  rating,
  reviewCount,
  eventsOnEventory,
  items,
  recommendedAddons,
  onToggleSelected,
  onToggleVendorSelected,
  onRemove,
  onMoveToWishlist,
  onIncrementAddon,
  onDecrementAddon,
  onRemoveAddon,
  onAddRecommendedAddon,
}: {
  vendorName: string;
  avatarInitial: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  eventsOnEventory: number;
  items: CartVendor[];
  recommendedAddons: RecommendedAddon[];
  onToggleSelected: (id: string) => void;
  /** Selects/deselects every item in `items` at once — the header checkbox. */
  onToggleVendorSelected: (itemIds: string[], nextSelected: boolean) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
  onIncrementAddon: (itemId: string, addonId: string) => void;
  onDecrementAddon: (itemId: string, addonId: string) => void;
  onRemoveAddon: (itemId: string, addonId: string) => void;
  onAddRecommendedAddon: (addon: RecommendedAddon) => void;
}) {
  const allSelected = items.every((item) => item.selected);
  const someSelected = items.some((item) => item.selected);
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const vendorSubtotal = items[0]?.vendorSubtotal ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={() => onToggleVendorSelected(items.map((item) => item.id), !allSelected)}
              aria-label={
                allSelected ? `Deselect all packages from ${vendorName}` : `Select all packages from ${vendorName}`
              }
              className="mt-1 h-4 w-4 shrink-0 rounded accent-black outline-none"
            />

            {avatar ? (
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Image src={avatar} alt={vendorName} fill className="object-cover" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-subtle font-figtree text-[13px] font-bold text-brand-primary"
              >
                {avatarInitial}
              </span>
            )}

            <div className="flex flex-col gap-0.5">
              <span className="font-figtree text-[16px] font-semibold text-neutral-primary">{vendorName}</span>

              {(reviewCount > 0 || eventsOnEventory > 0) && (
                <div className="flex items-center gap-1.5">
                  {reviewCount > 0 && (
                    <>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < Math.round(rating)
                                ? "fill-brand-primary text-brand-primary"
                                : "fill-[#E5E7EB] text-[#E5E7EB]"
                            }
                          />
                        ))}
                      </span>
                      <span className="font-figtree text-[13px] text-neutral-secondary whitespace-nowrap">
                        {rating} ({reviewCount})
                      </span>
                    </>
                  )}
                  {eventsOnEventory > 0 && (
                    <span className="font-figtree text-[13px] text-neutral-secondary whitespace-nowrap">
                      {reviewCount > 0 ? "· " : ""}
                      {eventsOnEventory} events on Eventory
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <span className="shrink-0 font-figtree text-[13px] text-neutral-secondary">
            {items.length} package{items.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center justify-between pl-7">
          <span className="font-figtree text-[14px] text-neutral-secondary">Vendor subtotal</span>
          <span className="font-figtree text-[16px] font-bold text-neutral-primary">
            {formatPrice(vendorSubtotal)}
          </span>
        </div>
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
