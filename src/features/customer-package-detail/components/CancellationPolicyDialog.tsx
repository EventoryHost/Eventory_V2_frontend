"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useIsPhone } from "../hooks/useIsPhone";
import { getCancellationTiers, formatShortDate, type CancellationTiers } from "../utils/cancellationPolicy";

const STANDARD_TERMS = [
  "Cut-offs are based on the event's local start time.",
  "Refunds are returned to the original payment method within 5 working days.",
  "Changes to the setup made after the final cut-off can't be accepted once flowers are sourced.",
  "If the vendor cancels for any reason, you get 100% back regardless of the date.",
];

// Segment widths follow the real timeline once a date is known; with no date the three are equal.
const SEGMENTS = [
  { label: "100% refund", color: "#008236", weight: 11 },
  { label: "50% refund", color: "#BB4D00", weight: 11 },
  { label: "0% refund", color: "#ED2915", weight: 3 },
];
const OUTCOMES = ["Full refund", "50% refund", "No refund"];
const cutoffs = (tiers: CancellationTiers) => [tiers.fullRefundCutoff, tiers.halfRefundCutoff, tiers.eventDate];

export default function CancellationPolicyDialog({
  isOpen,
  onClose,
  eventDateIso,
}: {
  isOpen: boolean;
  onClose: () => void;
  eventDateIso: string | null;
  /** Kept so existing callers still type-check; the dialog only shows the four standard points. */
  vendorPolicyText?: string;
}) {
  const phone = useIsPhone();
  if (typeof document === "undefined") return null;
  const tiers = eventDateIso ? getCancellationTiers(eventDateIso) : null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center md:p-4">
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
            initial={phone ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            animate={phone ? { y: 0 } : { opacity: 1, scale: 1 }}
            exit={phone ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            transition={phone ? { type: "tween", duration: 0.3, ease: "easeOut" } : undefined}
            className="relative flex max-h-[85vh] w-full max-w-[640px] flex-col overflow-hidden rounded-3xl border border-[#E4E4E7] bg-white max-md:max-h-[calc(100dvh-54px)] max-md:max-w-none max-md:rounded-t-3xl max-md:rounded-b-none max-md:border-0 shadow-[0px_4px_6px_0px_rgba(3,3,3,0.05),0px_10px_15px_0px_rgba(3,3,3,0.1)]"
          >
            {/* Phones (Figma node 3916:37950): bottom sheet with a grab handle, a 20px title and the same body. */}
            <div className="flex shrink-0 justify-center pt-2 pb-1 md:hidden">
              <span className="h-1 w-9 rounded-sm bg-[#D9D6D9]" />
            </div>
            {/* Figma node 3641:82280 — same layout with or without a date; the dates and the "Cancel on or before" rows fill in once one is picked. */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E4E4E7] px-5 py-5 max-md:px-4 max-md:pt-2 max-md:pb-4 sm:px-7">
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="font-figtree text-[20px] leading-7 font-semibold tracking-[-0.36px] text-[#030303] md:text-[24px] md:leading-8">
                  Cancellation policy
                </h3>
                <p className="font-figtree text-[14px] leading-5 text-[#71717B]">
                  {tiers
                    ? "Calculated from your selected event date, not from today."
                    : "Pick your event date to see the exact cut-off dates."}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="-mt-1 -mr-2 flex h-12 w-12 shrink-0 max-md:mt-0 max-md:-mr-3 items-center justify-center rounded-full transition-colors hover:bg-black/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static local icon */}
                <img src="/images/customer/package-detail/close.svg" alt="" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5 overflow-y-auto px-5 py-6 max-md:px-4 max-md:pt-4 max-md:pb-6 sm:px-7">
              <div className="flex overflow-hidden rounded-2xl">
                {SEGMENTS.map((segment, index) => (
                  <div
                    key={segment.label}
                    className="flex min-w-0 flex-col gap-1 max-md:flex-1!"
                    // Equal thirds on phones (the Figma sheet); the real timeline proportions from md up.
                    style={{ flex: tiers ? segment.weight : 1 }}
                  >
                    <p className="text-right font-figtree text-[12px] leading-[18px] font-medium text-[#71717B]">
                      {tiers ? formatShortDate(cutoffs(tiers)[index]) : "—"}
                    </p>
                    <div
                      className="flex h-10 items-center justify-center px-1 font-figtree text-[12px] leading-[18px] font-semibold text-white"
                      style={{ backgroundColor: segment.color }}
                    >
                      {segment.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-1 font-figtree text-[14px] leading-5">
                {OUTCOMES.map((outcome, index) => (
                  <div
                    key={outcome}
                    className={`flex items-baseline justify-between gap-4 pb-2.5 ${index < OUTCOMES.length - 1 ? "border-b border-[#E4E4E7]" : ""}`}
                  >
                    <span className="text-[#3F3F47]">
                      {tiers
                        ? `Cancel on or before ${formatShortDate(cutoffs(tiers)[index])}`
                        : "Pick your date to see the exact cut-off"}
                    </span>
                    <span className="shrink-0 font-semibold text-[#030303]">{outcome}</span>
                  </div>
                ))}
              </div>

              <ul className="flex list-disc flex-col gap-2 pl-5 font-figtree text-[14px] leading-5 text-[#3F3F47] marker:text-[#71717B] max-md:list-none max-md:pl-0">
                {STANDARD_TERMS.map((term) => (
                  <li key={term} className="max-md:flex max-md:gap-2 max-md:before:content-['•']">
                    <span className="min-w-0 flex-1">{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
