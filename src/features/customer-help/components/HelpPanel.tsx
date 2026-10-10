"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HelpComposer from "./HelpComposer";
import HelpPanelHeader, { type HelpPanelHeaderType } from "./HelpPanelHeader";

// Help panel shell (Figma "03 — Home" / "04 — Explorer"). Desktop: 440px
// card floating 12px off the right edge over a 52% scrim. Phone: bottom
// sheet at 92% height, as in the v6 prototype. Views decide the header,
// body and whether the composer shows.

type HelpPanelProps = {
  open: boolean;
  onClose: () => void;
  header: { type: HelpPanelHeaderType; onBack?: () => void; tabs?: ReactNode; subtitle?: string };
  /** Changes when the body content changes, to re-apply scrollMode. */
  scrollKey: unknown;
  /** "bottom" pins the newest message, "top" resets, "none" leaves it to the content. */
  scrollMode: "bottom" | "top" | "none";
  /** Thread composer; hidden while a form is open (Figma Help / Composer). */
  composer?: { onSend: (text: string) => void; onPhoto: (file: File) => void };
  children: ReactNode;
};

const SHADOW_XL =
  "shadow-[0_8px_8px_0_rgba(3,3,3,0.35),0_24px_48px_0_rgba(3,3,3,0.45),0_48px_64px_-10px_rgba(3,3,3,0.35)]";
const EASE = [0.32, 0.72, 0, 1] as const;
const SHEET_QUERY = "(max-width: 767px)";

function subscribeSheet(callback: () => void) {
  const mql = window.matchMedia(SHEET_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export default function HelpPanel({
  open,
  onClose,
  header,
  scrollKey,
  scrollMode,
  composer,
  children,
}: HelpPanelProps) {
  const isSheet = useSyncExternalStore(
    subscribeSheet,
    () => window.matchMedia(SHEET_QUERY).matches,
    () => false,
  );
  const [draft, setDraft] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Esc closes; page behind doesn't scroll while the panel is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || scrollMode === "none") return;
    el.scrollTop = scrollMode === "bottom" ? el.scrollHeight : 0;
  }, [scrollKey, scrollMode]);

  // Both variants animate the same keys: the first render uses the desktop
  // variant (no matchMedia on the server), so the sheet variant must reset
  // opacity/scale/x too or it would stay invisible after hydration.
  const sheetMotion = isSheet
    ? {
        initial: { opacity: 1, x: 0, y: "100%", scale: 1 },
        animate: { opacity: 1, x: 0, y: 0, scale: 1 },
        exit: { opacity: 1, x: 0, y: "100%", scale: 1 },
      }
    : {
        initial: { opacity: 0, x: 12, y: 24, scale: 0.94 },
        animate: { opacity: 1, x: 0, y: 0, scale: 1 },
        exit: { opacity: 0, x: 12, y: 24, scale: 0.94 },
      };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-50 bg-[#030303]/52"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Help"
            tabIndex={-1}
            {...sheetMotion}
            transition={{ duration: isSheet ? 0.45 : 0.5, ease: EASE }}
            style={{ transformOrigin: "calc(100% - 40px) calc(100% - 26px)" }}
            className={`fixed inset-x-0 bottom-0 z-50 flex h-[92dvh] flex-col overflow-hidden rounded-t-[24px] bg-white outline-none md:inset-x-auto md:bottom-3 md:right-3 md:top-3 md:h-auto md:w-[440px] md:max-w-[calc(100%-24px)] md:rounded-[24px] ${SHADOW_XL}`}
          >
            <span className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-[#d4d4d8] md:hidden" aria-hidden />
            {header.tabs ?? <HelpPanelHeader type={header.type} onClose={onClose} onBack={header.onBack} subtitle={header.subtitle} />}

            <div
              ref={bodyRef}
              data-help-scroll
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              aria-live="polite"
            >
              {children}
            </div>

            {composer && (
              <HelpComposer
                value={draft}
                onChange={setDraft}
                onPhoto={composer.onPhoto}
                onSend={() => {
                  composer.onSend(draft.trim());
                  setDraft("");
                }}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
