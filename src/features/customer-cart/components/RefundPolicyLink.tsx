"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

export default function RefundPolicyLink() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 font-figtree text-[13px] font-semibold text-success-700 hover:underline"
      >
        <ShieldCheck className="h-4 w-4" />
        View refund policy
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsOpen(false)}
                />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Refund policy"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="relative max-h-[80vh] w-full max-w-[480px] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-figtree text-[18px] font-bold text-neutral-primary">
                      Refund Policy
                    </h3>
                    <button
                      type="button"
                      aria-label="Close refund policy"
                      onClick={() => setIsOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-subtle text-neutral-secondary transition-colors hover:bg-black/10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-3 font-figtree text-[14px] leading-relaxed text-neutral-secondary">
                    <p>
                      Cancellations made more than 15 days before the event
                      date are eligible for a full refund minus processing
                      fees.
                    </p>
                    <p>
                      Cancellations made between 7 and 15 days before the
                      event date are eligible for a 50% refund.
                    </p>
                    <p>
                      Cancellations made within 7 days of the event date are
                      not eligible for a refund.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
