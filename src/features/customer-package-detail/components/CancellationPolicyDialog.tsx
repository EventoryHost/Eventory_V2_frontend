"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { getCancellationTiers, formatShortDate } from "../utils/cancellationPolicy";

const STANDARD_TERMS = [
  "Cut-offs are based on the event's local start time.",
  "Refunds are returned to the original payment method within 5 working days.",
  "Changes to the setup made after the final cut-off can't be accepted once sourcing has started.",
];

export default function CancellationPolicyDialog({
  isOpen,
  onClose,
  eventDateIso,
  vendorPolicyText,
}: {
  isOpen: boolean;
  onClose: () => void;
  eventDateIso: string | null;
  vendorPolicyText?: string;
}) {
  if (typeof document === "undefined") return null;
  const tiers = eventDateIso ? getCancellationTiers(eventDateIso) : null;

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
            aria-label="Cancellation policy"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[85vh] w-full max-w-[640px] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <h3 className="font-figtree text-[22px] font-bold text-brand-950">Cancellation policy</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-neutral-secondary transition-colors hover:bg-black/10"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mb-6 font-figtree text-[13px] text-neutral-secondary">
              Calculated from your selected event date, not from today.
            </p>

            {tiers ? (
              <>
                <div className="mb-2 flex justify-between font-figtree text-[11px] text-neutral-tertiary">
                  <span>{formatShortDate(tiers.fullRefundCutoff)}</span>
                  <span>{formatShortDate(tiers.halfRefundCutoff)}</span>
                  <span>{formatShortDate(tiers.eventDate)}</span>
                </div>
                <div className="mb-6 flex h-9 overflow-hidden rounded-lg font-figtree text-[12px] font-semibold text-white">
                  <div className="flex flex-[11] items-center justify-center bg-emerald-600">100% refund</div>
                  <div className="flex flex-[11] items-center justify-center bg-amber-600">50% refund</div>
                  <div className="flex flex-[3] items-center justify-center bg-rose-600">0% refund</div>
                </div>

                <div className="divide-y divide-black/5 border-y border-black/5 font-figtree text-[14px]">
                  <div className="flex items-center justify-between py-3 text-neutral-secondary">
                    <span>Cancel on or before {formatShortDate(tiers.fullRefundCutoff)}</span>
                    <span className="font-bold text-brand-950">Full refund</span>
                  </div>
                  <div className="flex items-center justify-between py-3 text-neutral-secondary">
                    <span>Cancel on or before {formatShortDate(tiers.halfRefundCutoff)}</span>
                    <span className="font-bold text-brand-950">50% refund</span>
                  </div>
                  <div className="flex items-center justify-between py-3 text-neutral-secondary">
                    <span>Cancel on or before {formatShortDate(tiers.eventDate)}</span>
                    <span className="font-bold text-brand-950">No refund</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="mb-6 rounded-xl bg-neutral-subtle p-4 font-figtree text-[13px] text-neutral-secondary">
                Pick an event date to see your exact cancellation cut-off dates.
              </p>
            )}

            <ul className="mt-6 space-y-2 font-figtree text-[13px] text-neutral-secondary">
              {vendorPolicyText && (
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-tertiary" />
                  {vendorPolicyText}
                </li>
              )}
              {STANDARD_TERMS.map((term) => (
                <li key={term} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-tertiary" />
                  {term}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
