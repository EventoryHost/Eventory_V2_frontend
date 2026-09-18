"use client";

import { useState } from "react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { updateCustomerProfile } from "@/features/customer-auth/services/authService";
import { updateCustomer, type CustomerAddress } from "@/lib/customerSession";
import AccountEmptyCard from "./AccountEmptyCard";
import AddressFormModal, { draftFromAddress } from "./AddressFormModal";
import { formatAddressLines } from "../utils/address";

/** Matches the validator's `.max(10)` on the addresses array. */
const MAX_ADDRESSES = 10;

const ADD_BUTTON_CLASS =
  "flex items-center justify-center rounded-[37px] bg-[#FDEEF0] px-3.5 py-2 text-center text-[14px] font-semibold leading-5 text-brand-primary disabled:opacity-60";

/** A saved address (node 1414:9505). */
function AddressCard({
  address,
  onEdit,
  onDelete,
  isBusy,
}: {
  address: CustomerAddress;
  onEdit: () => void;
  onDelete: () => void;
  isBusy: boolean;
}) {
  const lines = formatAddressLines(address);

  return (
    <div className="flex flex-col gap-[18px] overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <p className="truncate text-[14px] font-medium leading-5 text-[#030303]">
            {address.fullName?.trim() || "Address"}
          </p>
          {address.label?.trim() && (
            <span className="shrink-0 rounded-[50px] border border-[#E4E4E7] bg-[#FAFAFA] px-2 py-0.5 text-[12px] font-medium leading-[18px] text-[#030303]">
              {address.label}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-[15px] text-[12px] font-semibold leading-[18px]">
          <button
            type="button"
            onClick={onEdit}
            disabled={isBusy}
            className="text-[#155DFC] hover:underline disabled:opacity-60"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isBusy}
            className="text-[#9F9FA9] hover:text-[#C81E0D] disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {address.isDefault && (
            <p className="text-[11px] font-semibold leading-4 text-[#00A63E]">DEFAULT ADDRESS</p>
          )}
          {lines.map((line, index) => (
            <p key={`${line}-${index}`} className="text-[14px] leading-5 text-[#030303]">
              {line}
            </p>
          ))}
        </div>
        {address.phone?.trim() && (
          <p className="text-[14px] font-semibold leading-5 text-[#030303]">{address.phone}</p>
        )}
      </div>
    </div>
  );
}

export default function SavedAddressContent() {
  const { session } = useCustomerSession();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  const addresses = session.addresses ?? [];

  /**
   * There's no per-address endpoint — every change PATCHes the whole array,
   * so each handler builds the complete next list.
   */
  async function save(nextAddresses: CustomerAddress[], preferDefaultIndex?: number) {
    if (!session) return;
    setIsBusy(true);
    setError(null);
    try {
      // Only one address can be the default. When the customer just ticked
      // the box, that address wins outright — falling back to "last one
      // flagged" here would silently keep an older default instead.
      const defaultIndex =
        preferDefaultIndex ?? nextAddresses.map((a) => a.isDefault).lastIndexOf(true);
      const normalised = nextAddresses.map((address, index) => ({
        ...address,
        isDefault: index === defaultIndex,
      }));

      const updated = await updateCustomerProfile(session.id, { addresses: normalised });
      updateCustomer(updated);
      setEditingIndex(null);
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that address. Try again.");
    } finally {
      setIsBusy(false);
    }
  }

  const isFull = addresses.length >= MAX_ADDRESSES;
  const isFormOpen = isAdding || editingIndex !== null;

  return (
    <>
      <h1 className="text-[24px] font-semibold leading-8 text-[#030303]">Saved Address</h1>

      {error && <p className="text-[12px] leading-[18px] text-[#C81E0D]">{error}</p>}

      {addresses.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {addresses.map((address, index) => (
            <AddressCard
              // Addresses have no stable client-side id: the update validator
              // strips _id, so Mongo regenerates them on every save.
              key={`${address.label ?? ""}-${address.line1 ?? ""}-${index}`}
              address={address}
              isBusy={isBusy}
              onEdit={() => setEditingIndex(index)}
              onDelete={() => save(addresses.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}

      {/* The illustrated add card sits below the list in the populated design
          (node 1648:7384) and stands alone when there's nothing saved yet
          (node 1414:6404) — same card either way. */}
      <AccountEmptyCard
        image="/images/customer/saved-address-empty.png"
        imageHeight={140}
        title="Add New Addresses"
        description="Add your personal home or venue addresses for location purposes and skip having to fill them in during booking"
        action={
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={isFull || isBusy}
            title={isFull ? `You can save up to ${MAX_ADDRESSES} addresses` : undefined}
            className={ADD_BUTTON_CLASS}
          >
            Add New Address
          </button>
        }
      />

      {isFormOpen && (
        <AddressFormModal
          isOpen
          isEditing={editingIndex !== null}
          isBusy={isBusy}
          initial={
            editingIndex !== null
              ? draftFromAddress(addresses[editingIndex])
              : draftFromAddress({ country: "India" })
          }
          onClose={() => {
            setIsAdding(false);
            setEditingIndex(null);
            setError(null);
          }}
          onSave={(draft) => {
            const targetIndex = editingIndex ?? addresses.length;
            const existing = editingIndex !== null ? addresses[editingIndex] : { country: "India" };

            // Spread the existing address first so fields the form doesn't
            // expose (mapLink, country) survive — saving replaces the whole
            // array, so anything dropped here is gone.
            const address: CustomerAddress = {
              ...existing,
              label: draft.label,
              fullName: draft.fullName,
              phone: draft.phone,
              line1: draft.line1,
              line2: draft.line2,
              landmark: draft.landmark,
              city: draft.city,
              state: draft.state,
              pincode: draft.pincode,
              isDefault: draft.isDefault,
            };

            const next = [...addresses];
            if (editingIndex !== null) next[editingIndex] = address;
            else next.push(address);
            save(next, draft.isDefault ? targetIndex : undefined);
          }}
        />
      )}
    </>
  );
}
