"use client";

import { useEffect, useRef, useState } from "react";
import { PDP_SECTIONS } from "../data/pdpSections";

// Sticky sub-nav below the site header. Highlights whichever section's top
// has scrolled past the scroll-spy line (SCROLL_OFFSET below the viewport
// top, clearing both the fixed site navbar and this bar itself).
const SCROLL_OFFSET = 140;

export default function AnchorNav() {
  const [activeId, setActiveId] = useState(PDP_SECTIONS[0].id);
  const tickingRef = useRef(false);

  useEffect(() => {
    function updateActiveSection() {
      tickingRef.current = false;
      let current = PDP_SECTIONS[0].id;
      for (const section of PDP_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= SCROLL_OFFSET) {
          current = section.id;
        }
      }
      setActiveId(current);
    }

    function onScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(updateActiveSection);
    }

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function goToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET + 20;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <nav className="sticky top-[72px] z-30 -mx-4 border-b border-black/5 bg-customer-bg px-4 md:mx-0 md:px-0">
      <div className="flex gap-6 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PDP_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => goToSection(section.id)}
            className={`shrink-0 border-b-2 pb-1 font-figtree text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeId === section.id
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-neutral-secondary hover:text-brand-950"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
