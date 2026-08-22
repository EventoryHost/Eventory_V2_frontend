"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import type { AddonItem, IncludedItemEntry } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { getCancellationTiers, formatShortDate } from "../utils/cancellationPolicy";

export default function PriceBreakdownDialog({
  isOpen,
  onClose,
  includedItems,
  selectedAddons,
  subtotal,
  gstPercent,
  gstAmount,
  estimatedTotal,
  eventDateIso,
  onViewCancellationPolicy,
}: {
  isOpen: boolean;
  onClose: () => void;
  includedItems: IncludedItemEntry[];
  selectedAddons: AddonItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  estimatedTotal: number;
  eventDateIso: string | null;
  onViewCancellationPolicy: () => void;
}) {
  const [addonsExpanded, setAddonsExpanded] = useState(true);
  if (typeof document === "undefined") return null;

  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
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
            aria-label="Price breakdown"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <h3 className="font-figtree text-[22px] font-bold text-brand-950">Price breakdown</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-neutral-secondary transition-colors hover:bg-black/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-2 font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
              What you&apos;re getting
            </div>

            <div className="divide-y divide-black/5 border-b border-black/5">
              {includedItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <div className="font-figtree text-[14px] font-medium text-brand-950">{item.title}</div>
                    {item.details[0]?.value && (
                      <div className="font-figtree text-[12px] text-neutral-tertiary">{item.details[0].value}</div>
                    )}
                  </div>
                  <div className="shrink-0 font-figtree text-[14px] font-bold text-brand-950">
                    {formatPrice(item.price)}
                  </div>
                </div>
              ))}

              {selectedAddons.length > 0 && (
                <div className="py-3">
                  <button
                    type="button"
                    onClick={() => setAddonsExpanded((open) => !open)}
                    className="flex w-full items-center justify-between gap-3"
                  >
                    <span className="flex items-center gap-1.5 font-figtree text-[14px] font-medium text-brand-950">
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${addonsExpanded ? "rotate-90" : ""}`}
                      />
                      Add-ons ({selectedAddons.length})
                    </span>
                    <span className="font-figtree text-[14px] font-bold text-brand-950">
                      {formatPrice(addonsTotal)}
                    </span>
                  </button>
                  {addonsExpanded && (
                    <div className="mt-2 space-y-2 pl-[22px]">
                      {selectedAddons.map((addon) => (
                        <div key={addon.id} className="flex items-start justify-between gap-3">
                          <div className="font-figtree text-[13px] text-neutral-secondary">{addon.title}</div>
                          <div className="shrink-0 font-figtree text-[13px] text-neutral-secondary">
                            {formatPrice(addon.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 font-figtree text-[13px]">
              <div className="flex justify-between text-neutral-secondary">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-secondary">
                <span>GST {gstPercent}%</span>
                <span>{formatPrice(gstAmount)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
              <span className="font-figtree text-[16px] font-bold text-brand-950">Estimated total</span>
              <span className="font-figtree text-[20px] font-bold text-brand-950">{formatPrice(estimatedTotal)}</span>
            </div>

            <button
              type="button"
              onClick={onViewCancellationPolicy}
              className="mt-6 w-full rounded-xl border border-black/10 p-4 text-left transition hover:border-black/25"
            >
              <div className="mb-2 flex items-center justify-between font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
                Cancellation
                <ChevronRight className="h-4 w-4" />
              </div>
              <div className="space-y-1.5 font-figtree text-[13px] text-neutral-secondary">
                <div className="flex justify-between">
                  <span>{tiers ? formatShortDate(tiers.fullRefundCutoff) : "Pick a date"}</span>
                  <span className="font-bold text-brand-950">Full refund</span>
                </div>
                <div className="flex justify-between">
                  <span>{tiers ? formatShortDate(tiers.halfRefundCutoff) : "Pick a date"}</span>
                  <span className="font-bold text-brand-950">50% refund</span>
                </div>
                <div className="flex justify-between">
                  <span>{tiers ? formatShortDate(tiers.eventDate) : "Pick a date"}</span>
                  <span className="font-bold text-brand-950">No refund</span>
                </div>
              </div>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
