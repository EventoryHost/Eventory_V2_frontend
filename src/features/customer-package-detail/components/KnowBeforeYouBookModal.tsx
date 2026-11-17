"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { InstructionPart } from "../utils/buildInstructions";
import { INSTRUCTION_ICON_SRC } from "../utils/buildInstructions";

/**
 * "Know before you book" modal (Figma nodes 3233:27470 and 3233:27594): the
 * points that apply to this package only, in parts and groups, scrolling inside
 * the card. The parts come from buildInstructions, i.e. from the package's own
 * data, so they differ per package.
 */
export default function KnowBeforeYouBookModal({
  isOpen,
  onClose,
  packageTitle,
  parts,
}: {
  isOpen: boolean;
  onClose: () => void;
  packageTitle: string;
  parts: InstructionPart[];
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

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
            aria-label="Know before you book"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[90vh] w-full max-w-[780px] overflow-y-auto rounded-2xl bg-white px-5 pt-6 pb-10 shadow-[0px_14px_72px_-10px_rgba(3,3,3,0.05),0px_6px_16px_0px_rgba(3,3,3,0.05),0px_4px_4px_0px_rgba(3,3,3,0.1)] sm:px-8"
          >
            <div className="flex items-start gap-1 pb-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="font-figtree text-[24px] leading-8 font-semibold text-[#030303]">Know before you book</h3>
                <p className="font-figtree text-[14px] leading-5 text-[#3F3F47]">
                  Only the points that apply to {packageTitle}.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#030303] transition-colors hover:bg-black/5"
              >
                <X size={20} />
              </button>
            </div>

            {parts.length === 0 ? (
              <p className="pt-5 font-figtree text-[14px] leading-5 text-[#3F3F47]">
                The vendor hasn&apos;t added any special instructions for this package yet. If you have a question
                before booking, ask the vendor after you book, or contact Eventory.
              </p>
            ) : (
              parts.map((part, partIndex) => (
                <section key={part.title} className={partIndex === 0 ? "pt-5" : "pt-6"}>
                  <p className="font-figtree text-[12px] leading-4 font-semibold tracking-[0.8px] text-[#B91D34] uppercase">
                    {part.title}
                  </p>
                  {part.groups.map((group) => (
                    <div key={group.title} className="pt-5">
                      <h4 className="font-figtree text-[20px] leading-7 font-semibold text-[#030303]">{group.title}</h4>
                      <ul>
                        {group.rows.map((row) => (
                          <li key={row.id} className="flex items-start gap-5 border-b border-[#E4E4E7] py-4">
                            {/* eslint-disable-next-line @next/next/no-img-element -- static local icon */}
                            <img src={INSTRUCTION_ICON_SRC[row.icon]} alt="" className="h-6 w-6 shrink-0" />
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <p className="font-figtree text-[16px] leading-6 font-medium text-[#030303]">{row.title}</p>
                              {row.detail && (
                                <p className="font-figtree text-[14px] leading-5 text-[#3F3F47]">{row.detail}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              ))
            )}

            <p className="pt-6 font-figtree text-[14px] leading-5 text-[#71717B]">
              Full terms are shown at checkout, before you pay.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
