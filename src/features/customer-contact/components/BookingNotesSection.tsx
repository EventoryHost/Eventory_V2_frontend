"use client";

import { useEffect, useState } from "react";
import { getCart, setBookingNote } from "@/lib/customerCartApi";
import { ApiError } from "@/lib/apiClient";

export default function BookingNotesSection() {
  const [note, setNote] = useState("");
  const [initialNote, setInitialNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCart()
      .then((cart) => {
        if (cancelled) return;
        setNote(cart.bookingNote ?? "");
        setInitialNote(cart.bookingNote ?? "");
      })
      .catch(() => {
        // Best-effort — the field just starts empty if the cart can't be read.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await setBookingNote(note);
      setInitialNote(note);
      setSaved(true);
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
        disabled={loading}
        className="w-full resize-none rounded-[8px] border border-[#D4D4D8] bg-white px-4 py-3 font-figtree text-[15px] text-[#101828] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#0F172A] disabled:opacity-60"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="font-figtree text-[12px] font-normal text-[#71717B]">
          {error ? <span className="text-[#E7000B]">{error}</span> : saved ? "Saved." : null}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading || note === initialNote}
          className="flex h-10 shrink-0 items-center justify-center rounded-full bg-[#0F172A] px-5 font-figtree text-[13px] font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}
