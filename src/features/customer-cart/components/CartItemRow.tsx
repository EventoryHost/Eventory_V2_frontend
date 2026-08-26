"use client";

import { useState } from "react";
import type { CartVendor, EventDetails as EventDetailsData, RecommendedAddon } from "../types";
import PackageInfo from "./PackageInfo";
import EditEventDetailsModal from "./EditEventDetailsModal";
import AddedAddonsSection from "./AddedAddonsSection";
import AddonSection from "./AddonSection";

export default function CartItemRow({
  item,
  recommendedAddons,
  onToggleSelected,
  onRemove,
  onMoveToWishlist,
  onSaveEventDetails,
  onIncrementAddon,
  onDecrementAddon,
  onRemoveAddon,
  onAddRecommendedAddon,
}: {
  item: CartVendor;
  recommendedAddons: RecommendedAddon[];
  onToggleSelected: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
  onSaveEventDetails: (id: string, details: EventDetailsData) => void;
  onIncrementAddon: (itemId: string, addonId: string) => void;
  onDecrementAddon: (itemId: string, addonId: string) => void;
  onRemoveAddon: (itemId: string, addonId: string) => void;
  onAddRecommendedAddon: (addon: RecommendedAddon) => void;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => onToggleSelected(item.id)}
          aria-label={
            item.selected ? `Remove ${item.package.title} from cart` : `Select ${item.package.title} for checkout`
          }
          className="h-4 w-4 rounded border-neutral-tertiary text-brand-primary focus:ring-brand-primary"
        />
        {!item.packageStillAvailable && (
          <span className="rounded-full bg-error-subtle px-2.5 py-1 font-figtree text-[11px] font-semibold text-error-700">
            No longer available
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-subtle bg-white shadow-sm">
        <PackageInfo
          cartPackage={item.package}
          eventDetails={item.eventDetails}
          specialRequest={item.specialRequest}
          onEditDetails={() => setIsEditOpen(true)}
          onRemove={() => onRemove(item.id)}
          onMoveToWishlist={() => onMoveToWishlist(item.id)}
        />

        {item.addons.length > 0 && (
          <AddedAddonsSection
            addons={item.addons}
            onIncrement={(addonId) => onIncrementAddon(item.id, addonId)}
            onDecrement={(addonId) => onDecrementAddon(item.id, addonId)}
            onRemove={(addonId) => onRemoveAddon(item.id, addonId)}
          />
        )}
      </div>

      {recommendedAddons.length > 0 && (
        <AddonSection addons={recommendedAddons} onAdd={onAddRecommendedAddon} />
      )}

      <EditEventDetailsModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialDetails={item.eventDetails}
        onSave={(details) => onSaveEventDetails(item.id, details)}
      />
    </div>
  );
}
