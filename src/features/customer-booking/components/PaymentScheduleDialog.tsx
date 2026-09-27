"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Receipt } from "lucide-react";
import type { BookingLineRow, BookingPaymentMilestone } from "../types";

export default function PaymentScheduleDialog({
  isOpen,
  onClose,
  milestones,
  rows,
  grandTotal,
}: {
  isOpen: boolean;
  onClose: () => void;
  milestones: BookingPaymentMilestone[];
  /**
   * The SAME rows/grandTotal already shown in Payment Summary behind this
   * modal (Total booking amount, convenience fee, discount, GST, …) — not
   * re-derived here. Needed because `milestones` only ever sums to each
   * line's tax-inclusive package price (cartPricingService.js's
   * computeLineMilestones comment: "milestones sum to 100% of the... amount
   * owed" — for that ONE line's package+GST only). The convenience fee and
   * any discount are order-level, computed once across the whole quote, and
   * were never folded into any per-line milestone — so the milestone list
   * alone under-totals whenever either applies. Real bug: the modal used to
   * show a schedule that didn't add up to the "Grand total" the customer
   * sees on the page behind it. Showing the same rows/grandTotal here
   * (rather than a second computation) guarantees they can never drift.
   */
  rows: BookingLineRow[];
  grandTotal: string;
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
            aria-label="Payment schedule"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[85vh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <h3 className="font-figtree text-[20px] font-bold text-brand-950">Payment schedule</h3>
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
              Each vendor sets their own advance/milestone split — this is what&apos;s due, and when, across
              every package in your booking.
            </p>

            {milestones.length === 0 ? (
              <p className="rounded-xl bg-neutral-subtle p-4 font-figtree text-[13px] text-neutral-secondary">
                No milestone schedule to show — the amount above covers everything for this booking.
              </p>
            ) : (
              <div className="divide-y divide-black/5 border-y border-black/5">
                {milestones.map((milestone, index) => (
                  <div key={`${milestone.serviceName}-${milestone.title}-${index}`} className="flex items-start gap-3 py-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle">
                      <Receipt className="h-4 w-4 text-brand-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-figtree text-[13px] font-semibold text-brand-950">{milestone.title}</p>
                      <p className="truncate font-figtree text-[12px] text-neutral-tertiary">
                        {milestone.serviceName}
                        {milestone.due ? ` · Due ${milestone.due}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {milestone.amount && (
                        <p className="font-figtree text-[14px] font-bold text-brand-950">{milestone.amount}</p>
                      )}
                      {milestone.percentage != null && (
                        <p className="font-figtree text-[11px] text-neutral-tertiary">{milestone.percentage}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {rows.length > 0 && (
              <div className="mt-6 flex flex-col gap-2">
                <p className="font-figtree text-[11px] font-semibold tracking-[0.03em] text-neutral-tertiary uppercase">
                  How this adds up
                </p>
                {rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3">
                    <span className="font-figtree text-[13px] text-neutral-secondary">{row.label}</span>
                    <span className="shrink-0 font-figtree text-[13px] text-brand-950">{row.value}</span>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between gap-3 border-t border-black/10 pt-2">
                  <span className="font-figtree text-[14px] font-semibold text-brand-950">Grand total</span>
                  <span className="shrink-0 font-figtree text-[14px] font-bold text-brand-950">{grandTotal}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
