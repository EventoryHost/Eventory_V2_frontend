"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { InstructionPart } from "../utils/buildInstructions";
import { INSTRUCTION_ICON_SRC } from "../utils/buildInstructions";

// Phones get a bottom sheet (Figma node 3835:68414); everything from md up keeps the centred modal.
const PHONE_QUERY = "(max-width: 767px)";
function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isPhone = () => window.matchMedia(PHONE_QUERY).matches;

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
  // The hairline scrollbar only shows while scrolling, then fades out after a pause.
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false);
  const [scrolling, setScrolling] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleScroll = () => {
    setScrolling(true);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => setScrolling(false), 700);
  };
  useEffect(() => () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
  }, []);

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
            aria-label="Know before you book"
            initial={phone ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            animate={phone ? { y: 0 } : { opacity: 1, scale: 1 }}
            exit={phone ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            transition={phone ? { type: "tween", duration: 0.3, ease: "easeOut" } : undefined}
            data-scrolling={scrolling}
            onScroll={handleScroll}
            className="thin-scroll relative max-h-[90vh] w-full max-w-[780px] overflow-y-auto rounded-2xl bg-white px-5 pt-6 pb-10 max-md:max-h-[calc(100dvh-54px)] max-md:max-w-none max-md:rounded-t-3xl max-md:rounded-b-none max-md:px-4 max-md:pt-0 max-md:pb-10 max-md:shadow-[0px_-8px_30px_0px_rgba(3,3,3,0.12)] shadow-[0px_14px_72px_-10px_rgba(3,3,3,0.05),0px_6px_16px_0px_rgba(3,3,3,0.05),0px_4px_4px_0px_rgba(3,3,3,0.1)] sm:px-8"
          >
            {/* Phones: grab handle + header stay pinned while the points scroll underneath. */}
            <div className="max-md:sticky max-md:top-0 max-md:z-10 max-md:-mx-4 max-md:border-b max-md:border-[#F4F4F5] max-md:bg-white max-md:px-4">
              <div className="flex justify-center pt-2 md:hidden">
                <span className="h-1 w-10 rounded-sm bg-[#E4E4E7]" />
              </div>
            <div className="flex items-center gap-3 pb-2 max-md:pt-3 max-md:pb-4 md:items-start md:gap-1">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-1">
                <h3 className="font-figtree text-[20px] leading-7 font-semibold text-[#030303] md:text-[24px] md:leading-8">Know before you book</h3>
                <p className="font-figtree text-[12px] leading-[18px] text-[#71717B] md:text-[14px] md:leading-5 md:text-[#3F3F47]">
                  Only the points that apply to {packageTitle}.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#030303] transition-colors hover:bg-black/5 md:h-10 md:w-10"
              >
                <X size={20} />
              </button>
            </div>
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
                          <li key={row.id} className="flex items-start gap-5 border-b border-[#E4E4E7] py-4 max-md:items-center">
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
