"use client";

import { useState } from "react";
import { patchCheckoutSessionLine } from "@/lib/customerCheckoutApi";
import { ApiError } from "@/lib/apiClient";

export type VendorNoteSectionProps = {
  sessionId: string;
  lineId: string;
  initialNote: string;
  onSaved?: () => void;
};

export default function VendorNoteSection({ sessionId, lineId, initialNote, onSaved }: VendorNoteSectionProps) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await patchCheckoutSessionLine(sessionId, lineId, { specialRequest: note });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex w-full max-w-[586px] flex-col gap-3">
      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        placeholder="Add a note for this vendor — colours, timing, anything they should know."
        rows={3}
        className="w-full resize-none rounded-[16px] border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 font-figtree text-[14px] text-[#030303] outline-none placeholder:text-[#9F9FA9] focus:border-[#F0596F]"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="font-figtree text-[12px] font-normal text-[#71717B]">
          {error ? <span className="text-[#E7000B]">{error}</span> : saved ? "Saved." : null}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || note === initialNote}
          className="flex h-9 shrink-0 items-center justify-center rounded-full bg-[#030303] px-5 font-figtree text-[13px] font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}
