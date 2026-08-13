"use client";

import { useState } from "react";
import type { CartAddon, CartVendor, EventDetails as EventDetailsData } from "../types";
import PackageInfo from "./PackageInfo";
import VendorActions from "./VendorActions";
import EventDetails from "./EventDetails";
import EditEventDetailsModal from "./EditEventDetailsModal";
import AddedAddonsSection from "./AddedAddonsSection";

export default function VendorCard({
  vendor,
  onToggleSelected,
  onRemove,
  onMoveToWishlist,
  onSaveEventDetails,
  addedAddons,
  onIncrementAddon,
  onDecrementAddon,
  onRemoveAddon,
}: {
  vendor: CartVendor;
  onToggleSelected: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
  onSaveEventDetails: (id: string, details: EventDetailsData) => void;
  addedAddons?: CartAddon[];
  onIncrementAddon?: (id: string) => void;
  onDecrementAddon?: (id: string) => void;
  onRemoveAddon?: (id: string) => void;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-subtle bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <input
            type="checkbox"
            checked={vendor.selected}
            onChange={() => onToggleSelected(vendor.id)}
            aria-label={`Select ${vendor.vendorName} for checkout`}
            className="h-5 w-5 rounded border-neutral-tertiary text-brand-primary focus:ring-brand-primary"
          />
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE3E8] font-figtree text-[15px] font-bold text-brand-primary"
          >
            {vendor.avatarInitial}
          </div>
          <span className="font-figtree text-[16px] font-semibold text-neutral-primary">
            {vendor.vendorName}
          </span>
        </div>

        <div className="mb-6">
          <PackageInfo cartPackage={vendor.package} />
        </div>

        <VendorActions
          onRemove={() => onRemove(vendor.id)}
          onMoveToWishlist={() => onMoveToWishlist(vendor.id)}
        />
      </div>

      <EventDetails details={vendor.eventDetails} onEdit={() => setIsEditOpen(true)} />

      {addedAddons && addedAddons.length > 0 && (
        <AddedAddonsSection
          addons={addedAddons}
          onIncrement={onIncrementAddon!}
          onDecrement={onDecrementAddon!}
          onRemove={onRemoveAddon!}
        />
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
