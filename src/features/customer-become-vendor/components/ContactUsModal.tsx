"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createVendorLead } from "@/lib/customerBecomeVendorApi";
import { ApiError } from "@/lib/apiClient";
import SearchDropdown from "@/features/customer-landing/components/SearchDropdown";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2438-23206
// Same options the public vendor-browsing filter uses (minus "All", which
// doesn't make sense as a lead's own type) — not a separate hardcoded list.
const VENDOR_TYPE_OPTIONS = VENDOR_CATEGORIES.filter((category) => category.id !== "all").map((category) => ({
  value: category.label,
  label: category.label,
}));

export default function ContactUsModal({
  isOpen,
  onClose,
  onSubmitted,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the lead's name once the backend confirms it's saved — the caller opens the WhatsApp success modal with it. */
  onSubmitted: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [vendorType, setVendorType] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (typeof document === "undefined") return null;

  const canSubmit = name.trim().length > 0 && vendorType.length > 0 && /^[6-9]\d{9}$/.test(phone.trim());

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const lead = await createVendorLead({ name: name.trim(), vendorType, phone: phone.trim() });
      onSubmitted(lead.name);
      // Reset so the next time this modal opens (a different lead) it
      // doesn't carry over the previous submission's values.
      setName("");
      setVendorType("");
      setPhone("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
            aria-label="Let's get you connected"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-[460px] rounded-2xl bg-white p-5"
          >
            <div className="flex items-start justify-between gap-2 pl-0.5">
              <div className="flex flex-col gap-1">
                <h3 className="font-figtree text-[16px] font-semibold text-[#030303]">Let&apos;s get you connected</h3>
                <p className="font-figtree text-[12px] text-[#71717B]">
                  Share your details and our team will get in touch shortly.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 text-[#030303] transition hover:opacity-70"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-6">
              <label className="flex flex-col gap-0.5">
                <span className="font-figtree text-[14px] font-semibold text-[#030303]">Vendor Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="min-h-[48px] w-full rounded-2xl border border-[#E4E4E7] bg-white px-4 font-figtree text-[16px] text-[#030303] outline-none placeholder:text-[#71717B] focus:border-brand-primary"
                />
              </label>

              <SearchDropdown
                label="Select Vendor Type"
                value={vendorType}
                onChange={setVendorType}
                options={VENDOR_TYPE_OPTIONS}
                placeholder="Decorator"
                variant="outlined"
                matchTriggerWidth
              />

              <label className="flex flex-col gap-0.5">
                <span className="font-figtree text-[14px] font-semibold text-[#030303]">Phone Number</span>
                <div className="flex items-center gap-2">
                  <span className="flex min-h-[48px] shrink-0 items-center rounded-2xl border border-[#E4E4E7] bg-[#F4F4F5] px-3.5 font-figtree text-[16px] font-medium text-[#030303]">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className="min-h-[48px] w-full min-w-0 rounded-2xl border border-[#E4E4E7] bg-white px-4 font-figtree text-[16px] text-[#030303] outline-none placeholder:text-[#71717B] focus:border-brand-primary"
                  />
                </div>
              </label>

              {error && <p className="font-figtree text-[13px] text-[#E7000B]">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="flex w-full items-center justify-center rounded-full bg-[#F0596F] px-5 py-2 font-figtree text-[14px] font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Send"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
