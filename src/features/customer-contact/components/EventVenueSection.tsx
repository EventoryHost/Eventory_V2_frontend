"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { updateCustomerProfile } from "@/features/customer-auth/services/authService";
import { updateCustomer, type CustomerAddress } from "@/lib/customerSession";
import AddressFormModal, { draftFromAddress } from "@/features/customer-account/components/AddressFormModal";

/** Matches the validator's `.max(10)` on the addresses array. */
const MAX_ADDRESSES = 10;

/** "B-42, Greater Kailash II, New Delhi 110048" — street lines, city/state, then pincode. */
function venueLine(address: CustomerAddress): string {
  const cityLine = [address.city, address.state].filter(Boolean).join(", ");
  return [address.line1, address.line2, address.landmark, cityLine, address.pincode]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(", ");
}

/**
 * "Where's the event?" — pick one of the customer's saved addresses as the
 * venue, or add a new one (saved to their profile the same way as
 * Account → Saved Address, so it's there next time too). The choice is held
 * in local state for now; nothing persists it against the booking yet.
 */
export default function EventVenueSection() {
  const { session } = useCustomerSession();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  const addresses = session.addresses ?? [];
  const defaultIndex = addresses.findIndex((address) => address.isDefault);
  const activeIndex = selectedIndex ?? (defaultIndex >= 0 ? defaultIndex : addresses.length > 0 ? 0 : null);
  const isFull = addresses.length >= MAX_ADDRESSES;

  // No per-address endpoint — every change PATCHes the whole array.
  async function save(nextAddresses: CustomerAddress[], preferDefaultIndex?: number, selectIndex?: number) {
    if (!session) return;
    setIsBusy(true);
    setError(null);
    try {
      const defaultIdx = preferDefaultIndex ?? nextAddresses.map((a) => a.isDefault).lastIndexOf(true);
      const normalised = nextAddresses.map((address, index) => ({ ...address, isDefault: index === defaultIdx }));
      const updated = await updateCustomerProfile(session.id, { addresses: normalised });
      updateCustomer(updated);
      if (selectIndex !== undefined) setSelectedIndex(selectIndex);
      setEditingIndex(null);
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that venue. Try again.");
    } finally {
      setIsBusy(false);
    }
  }

  const isFormOpen = isAdding || editingIndex !== null;

  return (
    <section className="flex w-full max-w-[868px] flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-figtree text-[28px] leading-[36px] font-semibold tracking-[-0.42px] text-[#030303]">
          Where&apos;s the event?
        </h2>
        <p className="font-figtree text-[14px] leading-none font-normal text-[#3F3F47]">
          Pick the venue your vendors should arrive at. We&apos;ll share this with your booked vendors.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-[#E4E4E7] bg-white p-8 sm:p-8">
        {addresses.map((address, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={`${address.label ?? ""}-${address.line1 ?? ""}-${index}`}
              role="radio"
              aria-checked={isActive}
              tabIndex={0}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedIndex(index);
                }
              }}
              className={`flex min-h-[72px] w-full cursor-pointer items-center gap-4 rounded-2xl p-4 ${
                isActive ? "border-[1.5px] border-[#F0596F] bg-[#FDEEF0]" : "border border-[#E4E4E7] bg-white"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isActive ? "border-[#F0596F]" : "border-[#9F9FA9]"
                }`}
              >
                {isActive && <span className="h-3 w-3 rounded-full bg-[#F0596F]" />}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="truncate font-figtree text-[16px] leading-none font-semibold text-[#030303]">
                  {address.label?.trim() || address.fullName?.trim() || "Venue"}
                </span>
                <span className="font-figtree text-[13px] leading-[1.25] font-normal text-[#3F3F47]">
                  {venueLine(address)}
                </span>
              </div>

              {isActive && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setEditingIndex(index);
                  }}
                  className="shrink-0 font-figtree text-[14px] font-medium text-[#F0596F] hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={isFull || isBusy}
          title={isFull ? `You can save up to ${MAX_ADDRESSES} venues` : undefined}
          className="flex h-[54px] w-full items-center gap-2 rounded-2xl border border-dashed border-[#9F9FA9] px-4 py-3.5 font-figtree text-[14px] leading-none font-semibold text-[#F0596F] disabled:opacity-50"
        >
          <Plus size={16} />
          Add a new venue
        </button>

        {error && <p className="font-figtree text-[12px] text-[#E7000B]">{error}</p>}
      </div>

      {isFormOpen && (
        <AddressFormModal
          isOpen
          isEditing={editingIndex !== null}
          isBusy={isBusy}
          initial={
            editingIndex !== null ? draftFromAddress(addresses[editingIndex]) : draftFromAddress({ country: "India" })
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
            // expose (mapLink, country) survive — saving replaces the whole array.
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
            void save(next, draft.isDefault ? targetIndex : undefined, targetIndex);
          }}
        />
      )}
    </section>
  );
}
