"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, X, Check } from "lucide-react";

/** Same S3 upload route VendorNotePromptModal/VendorNoteSection use — returns the uploaded file's public URL. */
async function uploadNoteAttachment(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await response.json();
  if (!response.ok || !data.url) throw new Error(data.details || data.error || "Upload failed");
  return data.url as string;
}

// "Notes for vendor" — free text the customer types on the PDP before
// booking, sent as the cart item's `specialRequest` (see StickyBookingCard).
// Image attachments are uploaded immediately on selection (same
// /api/upload route + noteAttachments field the "skipped the note" prompt
// modal already uses) so they're real S3 URLs by the time Add to
// cart/Book is clicked, not local-only file previews.
export default function NotesForVendor({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
}: {
  value: string;
  onChange: (value: string) => void;
  attachments: string[];
  onAttachmentsChange: (attachments: string[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      const url = await uploadNoteAttachment(file);
      onAttachmentsChange([...attachments, url]);
    } catch {
      setUploadError("Couldn't upload the image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeAttachment(url: string) {
    onAttachmentsChange(attachments.filter((existing) => existing !== url));
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

      {attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {attachments.map((url) => (
            <div key={url} className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-black/10 bg-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element -- already-uploaded S3 URL, not worth next/image's config for a small thumbnail here */}
              <img src={url} alt="Attached to note" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAttachment(url)}
                aria-label="Remove attachment"
                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadError && <p className="mt-2 font-figtree text-[12px] font-medium text-error-700">{uploadError}</p>}

      <div className="mt-4 flex items-center justify-between gap-3">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 rounded-lg border border-black/15 px-3 py-2 font-figtree text-[13px] font-medium text-brand-950 transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          {isUploading ? "Uploading…" : "Attach Image"}
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
