"use client";

import { useState } from "react";
import type { CartVendor, EventDetails as EventDetailsData } from "../types";
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
  onIncrementAddon,
  onDecrementAddon,
  onRemoveAddon,
}: {
  vendor: CartVendor;
  onToggleSelected: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (id: string) => void;
  onSaveEventDetails: (id: string, details: EventDetailsData) => void;
  onIncrementAddon: (itemId: string, addonId: string) => void;
  onDecrementAddon: (itemId: string, addonId: string) => void;
  onRemoveAddon: (itemId: string, addonId: string) => void;
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
          {!vendor.packageStillAvailable && (
            <span className="rounded-full bg-error-subtle px-2.5 py-1 font-figtree text-[11px] font-semibold text-error-700">
              No longer available
            </span>
          )}
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

      {vendor.addons.length > 0 && (
        <AddedAddonsSection
          addons={vendor.addons}
          onIncrement={(addonId) => onIncrementAddon(vendor.id, addonId)}
          onDecrement={(addonId) => onDecrementAddon(vendor.id, addonId)}
          onRemove={(addonId) => onRemoveAddon(vendor.id, addonId)}
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
