"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import HelpFloater from "./HelpFloater";

// Figma "02 — Floater states" (node 2369:11021):
// 2.1 desktop pill bottom-right · 2.2 compact icon while scrolling down
// (label back on scroll up, never on the first session) · 2.3 phone package
// page tucked into an edge tab above the sticky Book bar, nudges once on
// load · 2.4 tab tap slides the pill out, tucks back after 4s idle or on
// scroll.

const DESKTOP_QUERY = "(min-width: 1024px)";
const VISITED_KEY = "eventory_help_visited";
const FIRST_SESSION_KEY = "eventory_help_first_session";
const TUCK_IDLE_MS = 4000;
const COMPACT_MIN_SCROLL_Y = 80;
const SCROLL_DELTA = 4;

// /packages/[packageId] only — /packages/browse and /packages/demo are
// listing pages.
const PACKAGE_DETAIL_PATH = /^\/packages\/(?!browse$|demo$)[^/]+\/?$/;

function subscribeDesktop(callback: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
}

// "Not on the first session": the very first browser session that ever
// sees the floater keeps the label on while scrolling. Marked in
// sessionStorage so it holds across client navigations within that session.
function readIsFirstSession() {
  try {
    if (!localStorage.getItem(VISITED_KEY)) {
      localStorage.setItem(VISITED_KEY, "1");
      sessionStorage.setItem(FIRST_SESSION_KEY, "1");
    }
    return sessionStorage.getItem(FIRST_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

type HelpFloaterDockProps = {
  onOpen: () => void;
};

export default function HelpFloaterDock({ onOpen }: HelpFloaterDockProps) {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const usesEdgeTab = !isDesktop && PACKAGE_DETAIL_PATH.test(pathname);

  const [isCompact, setIsCompact] = useState(false);
  // Path the pill was slid out on — so every visit to a package page (and
  // any navigation away) starts tucked again without resetting in an effect.
  const [untuckedPath, setUntuckedPath] = useState<string | null>(null);
  const isTucked = untuckedPath !== pathname;
  const [hasNudged, setHasNudged] = useState(false);
  const lastScrollY = useRef(0);

  // 2.2 — compact while scrolling down, desktop only.
  useEffect(() => {
    if (!isDesktop || readIsFirstSession()) return;
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      if (Math.abs(delta) < SCROLL_DELTA) return;
      setIsCompact(delta > 0 && y > COMPACT_MIN_SCROLL_Y);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDesktop]);

  // 2.4 — slid-out pill tucks back after 4s idle or on scroll.
  useEffect(() => {
    if (!usesEdgeTab || isTucked) return;
    const tuck = () => setUntuckedPath(null);
    const timer = window.setTimeout(tuck, TUCK_IDLE_MS);
    window.addEventListener("scroll", tuck, { passive: true, once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", tuck);
    };
  }, [usesEdgeTab, isTucked]);

  if (usesEdgeTab) {
    return (
      <div className="fixed bottom-[104px] right-0 z-40">
        <AnimatePresence mode="wait" initial={false}>
          {isTucked ? (
            <motion.div
              key="tab"
              initial={{ x: 28 }}
              // Nudges once on load; later re-tucks just slide back in.
              animate={hasNudged ? { x: 0 } : { x: [28, 0, -8, 0, -4, 0] }}
              exit={{ x: 28 }}
              transition={
                hasNudged
                  ? { type: "spring", stiffness: 420, damping: 36 }
                  : { duration: 1, delay: 0.6, ease: "easeInOut" }
              }
              onAnimationComplete={() => setHasNudged(true)}
            >
              <HelpFloater
                variant="edge-tab"
                onClick={() => setUntuckedPath(pathname)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="pill"
              className="mr-4"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
            >
              <HelpFloater variant="default" onClick={onOpen} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 z-40 lg:right-6">
      <HelpFloater
        variant={isDesktop && isCompact ? "compact" : "default"}
        onClick={onOpen}
      />
    </div>
  );
}
