"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { RecommendedAddon } from "../types";
import { formatPrice } from "../utils/currency";

// Same modal shape/animation as customer-package-detail/components/AddonDetailsModal.tsx
// (image left, title/category right, price + Add footer) — trimmed to what
// RecommendedAddon actually carries: no description, colour options, or
// policy link, since none of that data exists on a cart-recommended add-on.
export default function AddonDetailsModal({
  addon,
  isOpen,
  onClose,
  onAdd,
}: {
  addon: RecommendedAddon | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (addon: RecommendedAddon) => void;
}) {
  if (typeof document === "undefined" || !addon) return null;

  const priceUnit = addon.unitLabel.replace(/^\//, "");

  function handleAdd() {
    onAdd(addon!);
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
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={addon.title}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-3xl bg-white p-5 shadow-xl sm:p-6"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-neutral-secondary transition-colors hover:bg-black/10"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative h-[162px] w-full shrink-0 overflow-hidden rounded-lg bg-neutral-subtle sm:w-[183px]">
                {addon.image && (
                  <Image src={addon.image} alt={addon.title} fill sizes="183px" className="object-cover" />
                )}
                <span className="absolute top-2 left-2 rounded-full bg-white/95 px-3 py-1 font-figtree text-[11px] font-semibold tracking-wide text-brand-primary uppercase shadow-sm">
                  {addon.category}
                </span>
              </div>

              <div className="flex-1 pr-8">
                <h3 className="font-figtree text-[22px] font-semibold text-brand-950 sm:text-[24px]">{addon.title}</h3>
                {addon.subCategory && (
                  <p className="mt-0.5 font-figtree text-[14px] text-neutral-secondary">{addon.subCategory}</p>
                )}
                {addon.qtyLabel && (
                  <p className="mt-2 font-figtree text-[13px] text-neutral-tertiary">{addon.qtyLabel}</p>
                )}
              </div>
            </div>

            <div className="mt-5 border-t border-black/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-figtree text-[22px] font-bold text-brand-950">
                  {formatPrice(addon.price)}
                  {priceUnit && <span className="ml-1 font-figtree text-[13px] font-medium text-neutral-secondary">/{priceUnit}</span>}
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="shrink-0 rounded-full bg-brand-primary px-8 py-2.5 font-figtree text-[15px] font-semibold text-white transition hover:bg-rose-600"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
