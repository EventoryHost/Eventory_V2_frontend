"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import type { CustomerAddress } from "@/lib/customerSession";
import { ADDRESS_TYPES, INDIAN_STATES } from "../data/indianStates";

/**
 * What the design's form collects (node 1414:9025).
 *
 * Maps 1:1 onto the backend addressSchema. `fullName`, `phone` and
 * `landmark` were added to that schema (and to updateCustomerSchema) for
 * this form — a venue or banquet contact is often not the account holder,
 * so they can't be read off the Customer record.
 */
export interface AddressDraft {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
  label: string;
}

const LABEL_CLASS = "text-[14px] font-semibold leading-5 text-[#71717B]";
const INPUT_CLASS =
  "h-12 w-full rounded-[14px] border border-[#EBEBED] bg-white px-[15px] text-[14px] leading-5 text-[#030303] outline-none placeholder:text-[#9F9FA9] focus:border-brand-primary";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex w-full flex-col gap-3">
      <span className={LABEL_CLASS}>{label}</span>
      {children}
    </label>
  );
}

/** The design's pill switch (52×32, 24px knob when on). */
function Switch({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-8 w-[52px] shrink-0 items-center rounded-full transition-colors ${
        checked ? "justify-end bg-[#09090B] p-1" : "justify-start bg-[#9F9FA9] p-1.5"
      }`}
    >
      <span
        className={`rounded-full bg-white transition-all ${checked ? "size-6" : "size-5 bg-[#F4F4F5]"}`}
      />
    </button>
  );
}

export function draftFromAddress(address: CustomerAddress): AddressDraft {
  return {
    fullName: address.fullName ?? "",
    phone: address.phone ?? "",
    line1: address.line1 ?? "",
    line2: address.line2 ?? "",
    landmark: address.landmark ?? "",
    pincode: address.pincode ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    isDefault: Boolean(address.isDefault),
    label: address.label ?? "",
  };
}

export default function AddressFormModal({
  isOpen,
  initial,
  isEditing,
  isBusy,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  initial: AddressDraft;
  isEditing: boolean;
  isBusy: boolean;
  onSave: (draft: AddressDraft) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<AddressDraft>(initial);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof AddressDraft>(key: K, value: AddressDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          <motion.div
            role="dialog"
            aria-modal
            aria-label={isEditing ? "Edit address" : "Add new address"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative my-8 flex w-full max-w-[600px] flex-col gap-6 rounded-2xl border border-[#E4E4E7] bg-white p-5"
          >
            {/* Header */}
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-medium text-[#030303]">
                  {isEditing ? "Edit Address" : "Add New Address"}
                </h2>
                <button type="button" onClick={onClose} aria-label="Close" className="text-[#030303]">
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>
              <p className="text-[14px] font-medium leading-5 text-[#9F9FA9]">
                Add your address to your various occasions
              </p>
            </div>

            <div className="flex w-full flex-col gap-4">
              <div className="flex w-full flex-col gap-5">
                <div className="flex w-full flex-col gap-4">
                  <Field label="Full Name">
                    <input
                      value={draft.fullName}
                      onChange={(event) => set("fullName", event.target.value)}
                      placeholder="John Doe"
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <Field label="Phone Number">
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={draft.phone}
                      onChange={(event) => set("phone", event.target.value)}
                      placeholder="+91 9573829475"
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <Field label="Flat/House No., Building, Company/Apartment">
                    <input
                      value={draft.line1}
                      onChange={(event) => set("line1", event.target.value)}
                      maxLength={200}
                      placeholder="Flat 402, Sunrise Residency"
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <Field label="Area/Street, Sector, Village">
                    <input
                      value={draft.line2}
                      onChange={(event) => set("line2", event.target.value)}
                      maxLength={200}
                      placeholder="MG Road, Sector 14"
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <Field label="Landmark">
                    <input
                      value={draft.landmark}
                      onChange={(event) => set("landmark", event.target.value)}
                      placeholder="Eg. Near Kasturba Hospital"
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <Field label="Pincode">
                    <input
                      inputMode="numeric"
                      value={draft.pincode}
                      onChange={(event) => set("pincode", event.target.value)}
                      maxLength={12}
                      placeholder="23456"
                      className={INPUT_CLASS}
                    />
                  </Field>

                  <div className="flex w-full items-end gap-4">
                    <div className="flex min-w-0 flex-1">
                      <Field label="Town/ City">
                        <input
                          value={draft.city}
                          onChange={(event) => set("city", event.target.value)}
                          maxLength={100}
                          className={INPUT_CLASS}
                        />
                      </Field>
                    </div>
                    <div className="flex min-w-0 flex-1">
                      {/* The design labels this "Town/ City" too — a duplicated
                          label in the mock; it's the state select. */}
                      <Field label="State">
                        <div className="relative">
                          <select
                            value={draft.state}
                            onChange={(event) => set("state", event.target.value)}
                            className={`${INPUT_CLASS} appearance-none pr-10 font-semibold text-[#3F3F47]`}
                          >
                            <option value="">Choose a state</option>
                            {INDIAN_STATES.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3F3F47]" />
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>

                <div className="flex w-full items-center gap-2.5 rounded-[14px] bg-[#F4F4F5] p-5">
                  <p className="min-w-0 flex-1 text-[16px] font-semibold leading-6 text-[#030303]">
                    Use as my Default address
                  </p>
                  <Switch checked={draft.isDefault} onChange={(next) => set("isDefault", next)} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className={LABEL_CLASS}>Type of Address</p>
                <div className="flex flex-wrap items-center gap-3">
                  {ADDRESS_TYPES.map((type) => {
                    const isSelected = draft.label === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => set("label", isSelected ? "" : type)}
                        aria-pressed={isSelected}
                        className={`rounded-[50px] px-3 py-1.5 text-[14px] font-medium leading-5 transition-colors ${
                          isSelected
                            ? "bg-brand-primary text-white"
                            : "bg-[#F4F4F5] text-[#71717B] hover:bg-[#E4E4E7]"
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && <p className="text-[12px] leading-[18px] text-[#C81E0D]">{error}</p>}

            {/* Footer */}
            <div className="flex w-full flex-col items-end gap-5">
              <span aria-hidden className="h-px w-full bg-[#E4E4E7]" />
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[37px] px-6 py-3 text-[16px] font-semibold leading-6 text-[#71717B]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    const hasAddress = [draft.line1, draft.line2, draft.city, draft.pincode].some(
                      (value) => value.trim()
                    );
                    if (!hasAddress) {
                      setError("Fill in at least one line of the address.");
                      return;
                    }
                    setError(null);
                    onSave(draft);
                  }}
                  className="rounded-[37px] bg-brand-primary px-6 py-3 text-[16px] font-semibold leading-6 text-[#FAFAFA] disabled:opacity-60"
                >
                  {isBusy ? "Saving…" : "Save Address"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
