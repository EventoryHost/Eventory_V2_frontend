"use client";

import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { EventDetails as EventDetailsData } from "../types";

export default function EditEventDetailsModal({
  isOpen,
  onClose,
  initialDetails,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialDetails: EventDetailsData;
  onSave: (details: EventDetailsData) => void;
}) {
  const [form, setForm] = useState(initialDetails);
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Reset the form whenever the modal transitions from closed to open —
  // adjusted during render (not an effect) per React's guidance on syncing
  // state to props: https://react.dev/learn/you-might-not-need-an-effect
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setForm(initialDetails);
  }

  if (typeof document === "undefined") return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave(form);
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Edit event details"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-[440px] rounded-3xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-figtree text-[18px] font-bold text-neutral-primary">
                Edit Event Details
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-subtle text-neutral-secondary transition-colors hover:bg-black/10"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">
                  Event date
                </span>
                <input
                  type="text"
                  value={form.date ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, date: event.target.value || null }))
                  }
                  placeholder="e.g. 12 March, 2026"
                  className="rounded-xl border border-neutral-subtle bg-[#F9F9F9] px-4 py-2.5 font-figtree text-[14px] text-neutral-primary outline-none focus:border-brand-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">
                  Time
                </span>
                <input
                  type="text"
                  value={form.timeRange ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, timeRange: event.target.value || null }))
                  }
                  placeholder="e.g. 01:00 PM - 05:00 PM"
                  className="rounded-xl border border-neutral-subtle bg-[#F9F9F9] px-4 py-2.5 font-figtree text-[14px] text-neutral-primary outline-none focus:border-brand-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">
                  Guests
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.guestCount ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      guestCount: event.target.value ? Number(event.target.value) : null,
                    }))
                  }
                  placeholder="e.g. 150"
                  className="rounded-xl border border-neutral-subtle bg-[#F9F9F9] px-4 py-2.5 font-figtree text-[14px] text-neutral-primary outline-none focus:border-brand-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">
                  Location
                </span>
                <input
                  type="text"
                  value={form.location ?? ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, location: event.target.value || null }))
                  }
                  placeholder="e.g. Guwahati, Assam"
                  className="rounded-xl border border-neutral-subtle bg-[#F9F9F9] px-4 py-2.5 font-figtree text-[14px] text-neutral-primary outline-none focus:border-brand-primary"
                />
              </label>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-brand-primary py-3 font-figtree text-[15px] font-bold text-white transition-opacity hover:opacity-90"
              >
                Save details
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
