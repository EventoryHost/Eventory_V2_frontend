"use client";

import { useState } from "react";
import { ApiError } from "@/lib/apiClient";
import { patchCheckoutSessionAlternateCoordinator } from "@/lib/customerCheckoutApi";

export type AlternateCoordinatorSectionProps = {
  /** "" until the checkout session has loaded — fields save silently once it's set. */
  sessionId: string;
  initialName: string;
  initialPhone: string;
  /** Called after a successful save so the caller can re-fetch validation/canContinue. */
  onSaved?: () => void;
};

/**
 * "Add Alternate Coordinator" — one day-of backup contact for the whole
 * order (CheckoutSession.alternateCoordinator, carried onto every Booking
 * this session produces at payment time). Saves on blur rather than on
 * every keystroke, same reasoning as a name field elsewhere in checkout —
 * a partial phone number mid-type would otherwise fail the backend's
 * 10-digit format check on every character.
 */
export default function AlternateCoordinatorSection({
  sessionId,
  initialName,
  initialPhone,
  onSaved,
}: AlternateCoordinatorSectionProps) {
  const [isEnabled, setIsEnabled] = useState(Boolean(initialName || initialPhone));
  const [altName, setAltName] = useState(initialName);
  const [altNumber, setAltNumber] = useState(initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Same "hydrate once" pattern as EventTimingSection — the session's
  // alternateCoordinator loads asynchronously after this mounts, but
  // shouldn't clobber a value the customer is already editing on a later
  // refresh of the same page instance.
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && (initialName || initialPhone)) {
    setAltName(initialName);
    setAltNumber(initialPhone);
    setIsEnabled(true);
    setHydrated(true);
  }

  async function saveName() {
    if (!sessionId || altName === initialName || !altName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await patchCheckoutSessionAlternateCoordinator(sessionId, { name: altName.trim() });
      onSaved?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the coordinator's name.");
    } finally {
      setSaving(false);
    }
  }

  async function savePhone() {
    if (!sessionId || altNumber === initialPhone) return;
    // The backend 400s on anything but a 10-digit Indian mobile — save
    // whenever it's actually complete, otherwise wait until it is (an error
    // on every partial digit typed would be noise, not help).
    if (!/^\d{10}$/.test(altNumber)) return;
    setSaving(true);
    setError(null);
    try {
      await patchCheckoutSessionAlternateCoordinator(sessionId, { phone: altNumber });
      onSaved?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the coordinator's number.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="flex w-full max-w-[801px] flex-col gap-4 rounded-[16px] border border-[#E5E5E5] bg-[#F4F4F5] p-8"
      style={{ boxShadow: "0px 40px 40px 0px #00000005" }}
    >
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded-[6px] border border-[#D4D4D8] accent-[#0F172A]"
        />
        <div className="flex flex-col gap-1">
          <span className="font-figtree text-[15px] font-semibold text-[#0F172A]">
            Add Alternate Coordinator
          </span>
          <span className="font-figtree text-[13px] font-normal leading-[18px] text-[#444748]">
            Alternate number incase you do not pickup or are not the primary
            site coordinator
          </span>
        </div>
      </label>

      {isEnabled && (
        <>
          <div className="h-px w-full bg-[#E5E5E5]" />

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="flex w-full max-w-[355.5px] flex-col gap-1">
              <label className="text-left font-figtree text-[12px] font-normal text-[#3F3F47]">
                Alternative Coordinate Name
              </label>
              <input
                type="text"
                value={altName}
                onChange={(e) => setAltName(e.target.value)}
                onBlur={() => void saveName()}
                placeholder="Name"
                className="h-12 w-full rounded-[8px] border border-[#D4D4D8] bg-white px-4 py-3 font-figtree text-[15px] text-[#101828] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
              />
            </div>

            <div className="flex w-full max-w-[355.5px] flex-col gap-1">
              <label className="text-left font-figtree text-[12px] font-normal text-[#3F3F47]">
                Alternative Coordinate Number
              </label>
              <div className="flex gap-2">
                <div
                  aria-label="India"
                  className="flex h-12 w-14 shrink-0 items-center justify-center rounded-[8px] border border-[#D4D4D8] bg-white"
                >
                  <span className="text-[22px] leading-none">🇮🇳</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={altNumber}
                  onChange={(e) => setAltNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onBlur={() => void savePhone()}
                  placeholder="XXXXX XXXXX"
                  className="h-12 w-full rounded-[8px] border border-[#D4D4D8] bg-white px-4 py-3 font-figtree text-[15px] text-[#101828] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
                />
              </div>
            </div>
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
