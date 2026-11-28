"use client";

import { useEffect, useRef, useState } from "react";

// Figma node 3233:35960. Each tab points at a section id already on the page;
// a tab whose section isn't rendered for this package is left out.
const TABS = [
  { id: "about", label: "About the package" },
  { id: "included", label: "What’s included" },
  { id: "addons", label: "Add-ons & extras" },
  { id: "venue-needs", label: "Vendor requirements" },
  { id: "payment-protection", label: "Payment protection" },
  { id: "policies", label: "Policies" },
  { id: "vendor", label: "Meet our vendor" },
  { id: "reviews", label: "Reviews" },
];

const SITE_NAVBAR_HEIGHT = 71;
const BAR_HEIGHT = 60;

/**
 * Sticky in-page section navigation. It appears once the reader scrolls down
 * to the package's body, stays pinned, highlights the section being read and
 * scrolls to a section on click. The site navbar hides while scrolling down
 * and returns on scroll up, so this bar sits at the very top when the navbar
 * is hidden and drops below it when the navbar is back.
 */
export default function SectionNavBar() {
  const [available, setAvailable] = useState<typeof TABS>([]);
  const [visible, setVisible] = useState(false);
  const [navbarShown, setNavbarShown] = useState(true);
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const lastScrollY = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);

  // Sections mount at different times (some load client-side), so look again on resize and shortly after load.
  useEffect(() => {
    const find = () => setAvailable(TABS.filter((tab) => document.getElementById(tab.id)));
    find();
    const timer = window.setTimeout(find, 1500);
    window.addEventListener("resize", find);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", find);
    };
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Mirrors the site navbar's own rule (Navbar.tsx): hidden scrolling down, back on scroll up.
      if (y <= 0) setNavbarShown(true);
      else if (y > lastScrollY.current) setNavbarShown(false);
      else if (y < lastScrollY.current) setNavbarShown(true);
      lastScrollY.current = y;

      const first = document.getElementById(TABS[0].id);
      setVisible(first ? first.getBoundingClientRect().top <= SITE_NAVBAR_HEIGHT + BAR_HEIGHT : false);

      // The section being read: the last one whose top has passed just under the bar.
      const line = BAR_HEIGHT + 24;
      let current = TABS[0].id;
      for (const tab of TABS) {
        const el = document.getElementById(tab.id);
        if (el && el.getBoundingClientRect().top <= line) current = tab.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [available]);

  // Keep the active tab in view when the bar scrolls sideways on small screens.
  useEffect(() => {
    barRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeId]);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - BAR_HEIGHT + 4;
    window.scrollTo({ top, behavior: "smooth" });
  }

  if (available.length === 0) return null;

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 z-40 bg-white shadow-[0_3px_3px_rgba(0,0,0,0.05)] transition-[top,opacity] duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ top: navbarShown ? SITE_NAVBAR_HEIGHT : 0 }}
    >
      <nav
        ref={barRef}
        aria-label="Package sections"
        className="mx-auto flex h-[60px] max-w-[1280px] items-stretch gap-1 overflow-x-auto px-2 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {available.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              tabIndex={visible ? 0 : -1}
              aria-current={isActive}
              onClick={() => goTo(tab.id)}
              className={`relative flex shrink-0 items-center px-4 font-figtree text-[16px] leading-6 font-semibold whitespace-nowrap transition-colors ${
                isActive ? "text-[#F0596F]" : "text-[#71717B] hover:text-[#030303]"
              }`}
            >
              {tab.label}
              {isActive && <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-[36px] bg-[#F0596F]" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
