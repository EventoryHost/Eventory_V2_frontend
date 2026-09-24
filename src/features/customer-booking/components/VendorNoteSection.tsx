"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, X } from "lucide-react";
import { patchCheckoutSessionLine } from "@/lib/customerCheckoutApi";
import { ApiError } from "@/lib/apiClient";

/** Same S3 upload route the PDP's VendorNotePromptModal uses — returns the uploaded file's public URL. */
async function uploadNoteAttachment(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await response.json();
  if (!response.ok || !data.url) throw new Error(data.details || data.error || "Upload failed");
  return data.url as string;
}

export type VendorNoteSectionProps = {
  sessionId: string;
  lineId: string;
  initialNote: string;
  /** Image URLs already attached to this line's note — set on the PDP, or by a previous save here. */
  initialAttachments?: string[];
  onSaved?: () => void;
};

export default function VendorNoteSection({
  sessionId,
  lineId,
  initialNote,
  initialAttachments = [],
  onSaved,
}: VendorNoteSectionProps) {
  const [note, setNote] = useState(initialNote);
  const [attachments, setAttachments] = useState(initialAttachments);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = note !== initialNote || pendingFiles.length > 0 || attachments.length !== initialAttachments.length;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setPendingFiles((prev) => [...prev, file]);
      setSaved(false);
    }
    event.target.value = "";
  }

  function removeExistingAttachment(url: string) {
    setAttachments((prev) => prev.filter((existing) => existing !== url));
    setSaved(false);
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const uploadedUrls = pendingFiles.length > 0 ? await Promise.all(pendingFiles.map(uploadNoteAttachment)) : [];
      const nextAttachments = [...attachments, ...uploadedUrls];
      await patchCheckoutSessionLine(sessionId, lineId, { specialRequest: note, noteAttachments: nextAttachments });
      setAttachments(nextAttachments);
      setPendingFiles([]);
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
        className="w-full resize-none rounded-2xl bg-[#F4F4F5] px-4 py-3 font-figtree text-[14px] leading-[22.75px] font-normal text-[#3F3F47] outline-none placeholder:text-[#9F9FA9] focus:outline-2 focus:outline-[#F0596F]"
      />

      {(attachments.length > 0 || pendingFiles.length > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          {attachments.map((url) => (
            <div key={url} className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-lg border border-[#E4E4E7]">
              {/* eslint-disable-next-line @next/next/no-img-element -- already-uploaded S3 URL, not worth next/image's config for a small thumbnail here */}
              <img src={url} alt="Attached to note" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingAttachment(url)}
                aria-label="Remove attachment"
                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
          {pendingFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-lg border border-dashed border-[#9F9FA9]">
              {/* eslint-disable-next-line @next/next/no-img-element -- local File object preview */}
              <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePendingFile(index)}
                aria-label={`Remove ${file.name}`}
                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <span className="font-figtree text-[12px] font-normal text-[#71717B]">
        {error ? <span className="text-[#E7000B]">{error}</span> : saved ? "Saved." : null}
      </span>

      <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-3">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-full border border-brand-primary bg-white px-3 py-1.5 font-figtree text-[13px] font-semibold text-brand-primary transition hover:bg-brand-subtle"
        >
          <Paperclip className="h-3.5 w-3.5" /> Attach image
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#030303] px-5 font-figtree text-[13px] font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}
