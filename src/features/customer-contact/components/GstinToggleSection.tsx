"use client";

import { useState } from "react";
import { ReceiptText } from "lucide-react";
import { ApiError } from "@/lib/apiClient";
import { patchCheckoutSessionGstin } from "@/lib/customerCheckoutApi";

const LABEL = "font-figtree text-[14px] leading-none font-medium text-[#3F3F47]";
const INPUT =
  "h-[49px] w-full rounded-2xl border border-[#E4E4E7] bg-white px-3.5 py-[13.5px] font-figtree text-[15px] text-[#030303] outline-none transition-colors placeholder:text-[#9F9FA9] focus:border-[#0F172A]";

export type GstinToggleSectionProps = {
  /** "" until the checkout session has loaded — fields save silently once it's set. */
  sessionId: string;
  initialBusinessName: string;
  initialGstin: string;
  /** Called after a successful save so the caller can re-fetch validation/canContinue. */
  onSaved?: () => void;
};

/**
 * Optional GSTIN for the tax invoice. Turning the switch on reveals the
 * business name / GSTIN fields. Saved to CheckoutSession.gstin on blur —
 * carried onto every Booking this session produces at payment time. The
 * backend validates the real 15-character GSTIN shape, not just accepts it
 * as free text — a 400 there is shown under the field.
 */
export default function GstinToggleSection({
  sessionId,
  initialBusinessName,
  initialGstin,
  onSaved,
}: GstinToggleSectionProps) {
  const [addGstin, setAddGstin] = useState(Boolean(initialBusinessName || initialGstin));
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [gstin, setGstin] = useState(initialGstin);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Same "hydrate once" pattern as AlternateCoordinatorSection/EventTimingSection.
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && (initialBusinessName || initialGstin)) {
    setBusinessName(initialBusinessName);
    setGstin(initialGstin);
    setAddGstin(true);
    setHydrated(true);
  }

  async function saveBusinessName() {
    if (!sessionId || businessName === initialBusinessName || !businessName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await patchCheckoutSessionGstin(sessionId, { businessName: businessName.trim() });
      onSaved?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the business name.");
    } finally {
      setSaving(false);
    }
  }

  async function saveGstinNumber() {
    if (!sessionId || gstin === initialGstin || !gstin.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await patchCheckoutSessionGstin(sessionId, { number: gstin.trim() });
      onSaved?.();
    } catch (err) {
      // A 400 here means the GSTIN failed the backend's real 15-character
      // format check — shown under the field rather than silently failing.
      setError(err instanceof ApiError ? err.message : "Couldn't save the GSTIN.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="flex w-full max-w-[801px] flex-col gap-4 rounded-3xl border border-[#E4E4E7] bg-white p-6"
      style={{ boxShadow: "0px 40px 40px 0px #00000005" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ReceiptText size={24} className="text-[#0F172A]" />
          <span className="font-figtree text-[16px] font-medium leading-6 text-[#030303]">
            Add GSTIN details for tax invoice (Optional)
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={addGstin}
          aria-label="Add GSTIN details"
          onClick={() => setAddGstin((v) => !v)}
          className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
            addGstin ? "bg-[#0B0B0B]" : "bg-[#D1D5DB]"
          }`}
        >
          <span
            className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
              addGstin ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {addGstin && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2.5">
              <span className={LABEL}>Business Name</span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onBlur={() => void saveBusinessName()}
                placeholder="Placeholder"
                className={INPUT}
              />
            </label>
            <label className="flex flex-col gap-2.5">
              <span className={LABEL}>GSTIN Number</span>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase().slice(0, 15))}
                onBlur={() => void saveGstinNumber()}
                placeholder="Placeholder"
                className={INPUT}
              />
            </label>
          </div>

          {(error || saving) && (
            <p className={`font-figtree text-[12px] ${error ? "text-[#E7000B]" : "text-[#71717B]"}`}>
              {error ?? "Saving…"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
