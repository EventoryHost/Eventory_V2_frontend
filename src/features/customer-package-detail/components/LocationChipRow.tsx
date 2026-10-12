"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

const GAP_PX = 8; // matches the row's gap-2

const chipClassName =
  "rounded-[87px] border border-[#E4E4E7] bg-white px-2.5 py-1 font-figtree text-[13px] font-medium whitespace-nowrap text-neutral-secondary";
const moreChipClassName =
  "rounded-[87px] border border-[#E4E4E7] bg-white px-2.5 py-1 font-figtree text-[13px] font-medium whitespace-nowrap text-brand-950";

/**
 * Service-area pills (Figma node 2404:22954) that fill as much of the
 * available row width as actually fits — not a fixed "show first 2" count.
 * Measured via a hidden off-screen clone of every chip (same classes, so
 * identical rendered width) laid out with no wrapping, so each chip's real
 * width can be read via offsetWidth without the visible row ever flashing
 * an under- or over-filled state. Re-measures on resize since how many
 * chips fit changes with viewport/column width.
 */
export default function LocationChipRow({ locations }: { locations: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(locations.length);

  const rowRef = useRef<HTMLDivElement>(null);
  const measureRowRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const moreRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || locations.length === 0) return;

    function measure() {
      const container = rowRef.current;
      const chips = chipRefs.current.filter((el): el is HTMLSpanElement => el !== null);
      if (!container || chips.length === 0) return;
      const containerWidth = container.clientWidth;

      const totalWidth = chips.reduce((sum, chip, i) => sum + chip.offsetWidth + (i > 0 ? GAP_PX : 0), 0);
      if (totalWidth <= containerWidth) {
        setVisibleCount(chips.length);
        return;
      }

      const moreWidth = moreRef.current ? moreRef.current.offsetWidth + GAP_PX : 0;
      let used = 0;
      let count = 0;
      for (let i = 0; i < chips.length; i++) {
        const chipWidth = chips[i].offsetWidth + (i > 0 ? GAP_PX : 0);
        if (used + chipWidth + moreWidth > containerWidth) break;
        used += chipWidth;
        count++;
      }
      // Always show at least one chip even if the row is too narrow to
      // compute a clean fit — an empty row would look broken.
      setVisibleCount(Math.max(count, 1));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- locations is a derived array that's stable in practice (from one package's vendor data); re-measuring on every re-render of it would be wasteful and isn't needed for this to stay correct.
  }, [locations.length]);

  const remainingCount = locations.length - visibleCount;
  const hasMore = remainingCount > 0;
  const visibleLocations = isExpanded ? locations : locations.slice(0, visibleCount);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <MapPin className="h-4 w-4 shrink-0" style={{ color: "#EA1D3B" }} />

      {/* Visible row — width-constrained, this is what the customer sees. */}
      <div ref={rowRef} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {visibleLocations.map((area) => (
          <span key={area} className={chipClassName}>
            {area}
          </span>
        ))}
        {hasMore && (
          <button type="button" onClick={() => setIsExpanded((expanded) => !expanded)} className={moreChipClassName}>
            {isExpanded ? "Show less" : `+${remainingCount} more`}
          </button>
        )}
      </div>

      {/* Hidden measurement clone — same chip markup, laid out with no
          wrapping and no visual presence, purely so each chip's natural
          rendered width can be read via offsetWidth. */}
      <div
        ref={measureRowRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 flex -translate-y-full items-center gap-2 opacity-0"
        style={{ visibility: "hidden" }}
      >
        {locations.map((area, i) => (
          <span
            key={area}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            className={chipClassName}
          >
            {area}
          </span>
        ))}
        <span ref={moreRef} className={moreChipClassName}>
          +{locations.length} more
        </span>
      </div>
    </div>
  );
}
