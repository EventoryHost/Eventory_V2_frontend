"use client";

import { useState } from "react";
import { patchCheckoutSessionBookingNote } from "@/lib/customerCheckoutApi";
import { ApiError } from "@/lib/apiClient";

export type BookingNotesSectionProps = {
  /** "" until the checkout session has loaded — Save is disabled until then. */
  sessionId: string;
  initialNote: string;
  /** Called after a successful save so the caller can re-fetch validation/canContinue. */
  onSaved?: () => void;
};

/**
 * "Booking Notes" — one note for the whole order, shared by every vendor.
 * Saved directly on the checkout session (CheckoutSession.bookingNote), NOT
 * the cart's own note field.
 *
 * REAL BUG FIXED here (2026-09-25): this used to call customerCartApi.ts's
 * setBookingNote (PUT /customer/cart/note) — the cart's own endpoint. Every
 * cart-mutating endpoint invalidates/cancels the customer's current checkout
 * session as a side effect (a cart edit can no longer be reflected in an
 * already-locked quote), so saving a note here was cancelling the very
 * session this Contact page was working inside of — the next action on the
 * page then 410'd with "This checkout session is cancelled — start a new
 * one." Now uses the session-scoped PATCH .../booking-note endpoint instead,
 * which touches nothing but this session.
 */
export default function BookingNotesSection({ sessionId, initialNote, onSaved }: BookingNotesSectionProps) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Same "hydrate once" pattern as the other Contact-page sections — the
  // session's bookingNote loads asynchronously after this mounts.
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && initialNote) {
    setNote(initialNote);
    setHydrated(true);
  }

  async function handleSave() {
    if (!sessionId) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await patchCheckoutSessionBookingNote(sessionId, note);
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="flex w-full max-w-[801px] flex-col gap-4 rounded-[16px] border border-[#E5E5E5] bg-[#F4F4F5] p-8"
      style={{ boxShadow: "0px 40px 40px 0px #00000005" }}
    >
      <div className="flex flex-col gap-1">
        <span className="font-figtree text-[15px] font-semibold text-[#0F172A]">Booking Notes</span>
        <span className="font-figtree text-[13px] font-normal leading-[18px] text-[#444748]">
          Anything every vendor on this booking should know — timing, access, or special requests.
        </span>
      </div>

      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        placeholder="Add a note for this booking…"
        rows={3}
        className="w-full resize-none rounded-[8px] border border-[#D4D4D8] bg-white px-4 py-3 font-figtree text-[15px] text-[#101828] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#0F172A]"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="font-figtree text-[12px] font-normal text-[#71717B]">
          {error ? <span className="text-[#E7000B]">{error}</span> : saved ? "Saved." : null}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || note === initialNote}
          className="flex h-10 shrink-0 items-center justify-center rounded-full bg-[#0F172A] px-5 font-figtree text-[13px] font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}
