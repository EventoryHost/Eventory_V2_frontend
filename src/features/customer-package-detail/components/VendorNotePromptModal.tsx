"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Paperclip, X } from "lucide-react";

// Gate shown right before add-to-cart/booking when the customer hasn't left
// a vendor note yet — lets them jot one down here (or attach a photo) without
// losing their place, or explicitly skip and continue with no note.
export default function VendorNotePromptModal({
  isOpen,
  onClose,
  onSkip,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSave: (note: string) => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Notes for vendor"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-brand-primary/30 bg-white p-5 shadow-xl"
          >
            <NotePromptForm onSkip={onSkip} onSave={onSave} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Mounted fresh each time the dialog opens (its parent only renders it while
// `isOpen`), so the draft note/attachments always start blank instead of
// carrying over from a previous open — no reset effect required.
function NotePromptForm({
  onSkip,
  onSave,
}: {
  onSkip: () => void;
  onSave: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setAttachedFiles((prev) => [...prev, file]);
    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="font-figtree text-[20px] font-semibold text-brand-950">Notes for vendor</h3>
        <p className="font-figtree text-[14px] font-medium text-neutral-secondary">
          Note from vendor about your requirements
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-[20px] bg-neutral-subtle p-4">
        <div className="flex flex-col items-center gap-3">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Bride is allergic to lily. Please arrive by 11 am; stick to pastel tones."
            rows={3}
            className="w-full resize-none rounded-xl border border-black/10 bg-white p-4 font-figtree text-[14px] font-medium text-neutral-secondary outline-none focus:border-brand-primary"
          />
          <div className="flex w-full items-center justify-between gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-full border border-brand-primary bg-white px-3 py-1.5 font-figtree text-[14px] text-brand-primary"
            >
              <Paperclip className="h-4 w-4" /> Attach Image
            </button>
            <p className="text-center font-figtree text-[12px] text-neutral-tertiary">
              This note will be shared to the vendor
            </p>
          </div>
        </div>

        {attachedFiles.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="font-figtree text-[14px] font-medium text-neutral-secondary">
              {attachedFiles.length} image{attachedFiles.length === 1 ? "" : "s"} attached
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {attachedFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="relative h-[72px] w-[72px] overflow-hidden rounded-lg bg-neutral-200">
                  <button
                    type="button"
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={`Remove ${file.name}`}
                    className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-black/10 pt-4">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-error-700 px-6 py-2.5 font-figtree text-[15px] font-medium text-error-700 transition hover:bg-error-subtle"
        >
          Skip now
        </button>
        <button
          type="button"
          onClick={() => onSave(note)}
          className="rounded-full bg-brand-primary px-6 py-2.5 font-figtree text-[15px] font-semibold text-white transition hover:bg-rose-600"
        >
          Add now
        </button>
      </div>
    </div>
  );
}
