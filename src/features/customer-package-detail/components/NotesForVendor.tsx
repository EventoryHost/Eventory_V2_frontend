"use client";

import { useRef, useState } from "react";
import { Paperclip, X, Check } from "lucide-react";

// "Notes for vendor" — free text the customer types on the PDP before
// booking, sent as the cart item's `specialRequest` (see StickyBookingCard).
// Image attachment has no backend field to land in yet (CartItem carries no
// attachment array), so it's kept local-only: picking a file just shows it
// as attached on this page, nothing is uploaded or sent with the booking.
export default function NotesForVendor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setAttachedFile(file);
    event.target.value = "";
  }

  function handleAddNote() {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }

  return (
    <section className="rounded-2xl border border-black/10 p-6">
      <h3 className="font-figtree text-[16px] font-bold text-brand-950">Notes for vendor</h3>
      <p className="mt-1 font-figtree text-[13px] text-neutral-secondary">
        Note from vendor about your requirements
      </p>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. Bride is allergic to lily. Please arrive by 11 am. Stick to pastel tones."
        rows={3}
        className="mt-4 w-full resize-none rounded-xl border border-black/15 p-3 font-figtree text-[13px] text-brand-950 outline-none focus:border-brand-primary"
      />
      <p className="mt-1.5 font-figtree text-[11px] text-neutral-tertiary">This note will be shared with the vendor.</p>

      {attachedFile && (
        <div className="mt-3 flex w-fit items-center gap-2 rounded-lg border border-black/10 bg-neutral-subtle px-3 py-1.5 font-figtree text-[12px] text-neutral-secondary">
          {attachedFile.name}
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            aria-label="Remove attachment"
            className="text-neutral-tertiary hover:text-brand-950"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-black/15 px-3 py-2 font-figtree text-[13px] font-medium text-brand-950 transition hover:border-black/30"
        >
          <Paperclip className="h-4 w-4" /> Attach Image
        </button>

        <button
          type="button"
          onClick={handleAddNote}
          disabled={!value.trim()}
          className="rounded-lg bg-brand-primary px-4 py-2 font-figtree text-[13px] font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-neutral-tertiary"
        >
          {justSaved ? (
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Added
            </span>
          ) : (
            "Add note"
          )}
        </button>
      </div>
    </section>
  );
}
