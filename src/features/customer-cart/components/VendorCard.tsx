"use client";

import { useState } from "react";
import type { CartVendor, EventDetails as EventDetailsData, RecommendedAddon } from "../types";
import PackageInfo from "./PackageInfo";
import EditEventDetailsModal from "./EditEventDetailsModal";
import AddedAddonsSection from "./AddedAddonsSection";
import AddonSection from "./AddonSection";

export default function VendorCard({
  vendor,
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
  vendor: CartVendor;
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-neutral-subtle pb-4">
        <input
          type="checkbox"
          checked={vendor.selected}
          onChange={() => onToggleSelected(vendor.id)}
          aria-label={`Select ${vendor.vendorName} for checkout`}
          className="h-4 w-4 rounded border-neutral-tertiary text-brand-primary focus:ring-brand-primary"
        />
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle font-figtree text-[13px] font-bold text-brand-primary"
          >
            {vendor.avatarInitial}
          </div>
          <span className="font-figtree text-[16px] font-semibold text-neutral-primary">
            {vendor.vendorName}
          </span>
          {!vendor.packageStillAvailable && (
            <span className="rounded-full bg-error-subtle px-2.5 py-1 font-figtree text-[11px] font-semibold text-error-700">
              No longer available
            </span>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-subtle bg-white shadow-sm">
        <PackageInfo
          cartPackage={vendor.package}
          eventDetails={vendor.eventDetails}
          specialRequest={vendor.specialRequest}
          onEditDetails={() => setIsEditOpen(true)}
          onRemove={() => onRemove(vendor.id)}
          onMoveToWishlist={() => onMoveToWishlist(vendor.id)}
        />

        {vendor.addons.length > 0 && (
          <AddedAddonsSection
            addons={vendor.addons}
            onIncrement={(addonId) => onIncrementAddon(vendor.id, addonId)}
            onDecrement={(addonId) => onDecrementAddon(vendor.id, addonId)}
            onRemove={(addonId) => onRemoveAddon(vendor.id, addonId)}
          />
        )}
      </div>

      {recommendedAddons.length > 0 && (
        <AddonSection addons={recommendedAddons} onAdd={onAddRecommendedAddon} />
      )}

      <EditEventDetailsModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialDetails={vendor.eventDetails}
        onSave={(details) => onSaveEventDetails(vendor.id, details)}
      />
    </div>
  );
}
