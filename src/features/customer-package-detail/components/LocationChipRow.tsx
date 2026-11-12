"use client";

import { useLayoutEffect, useRef, useState } from "react";

const GAP_PX = 8; // matches the row's gap-2

const chipBase = "rounded-[87px] border border-[#E4E4E7] bg-white px-2.5 py-1 font-figtree font-medium whitespace-nowrap";
// "large" is the desktop header's chip (Figma node 3233:25555): 14px / 24px line, tighter tracking.
const chipSize = (large: boolean) => (large ? "text-[14px] leading-6 tracking-[-0.14px]" : "text-[13px]");

/**
 * Service-area pills (Figma node 2404:22954) that fill as much of the
 * available row width as actually fits — not a fixed "show first 2" count.
 * Measured via a hidden off-screen clone of every chip (same classes, so
 * identical rendered width) laid out with no wrapping, so each chip's real
 * width can be read via offsetWidth without the visible row ever flashing
 * an under- or over-filled state. Re-measures on resize since how many
 * chips fit changes with viewport/column width.
 */
export default function LocationChipRow({
  locations,
  large = false,
  maxRows = 1,
}: {
  locations: string[];
  large?: boolean;
  /** How many wrapped rows of chips may show before collapsing the rest into "+N more". */
  maxRows?: number;
}) {
  const chipClassName = `${chipBase} ${chipSize(large)} ${large ? "text-[#71717B]" : "text-neutral-secondary"}`;
  const moreChipClassName = `${chipBase} ${chipSize(large)} ${large ? "text-[#3F3F47]" : "text-brand-950"}`;
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

      // Greedy line-wrap simulation: do the first `count` chips (plus the
      // "+N more" chip when some are hidden) fit within maxRows rows?
      const moreWidth = moreRef.current ? moreRef.current.offsetWidth : 0;
      const fits = (count: number) => {
        const widths = chips.slice(0, count).map((chip) => chip.offsetWidth);
        if (count < chips.length) widths.push(moreWidth);
        let rows = 1;
        let x = 0;
        for (const w of widths) {
          if (x === 0) x = w;
          else if (x + GAP_PX + w > containerWidth) {
            rows++;
            x = w;
          } else x += GAP_PX + w;
        }
        return rows <= maxRows;
      };
      let count = 0;
      for (let n = chips.length; n >= 1; n--) {
        if (fits(n)) {
          count = n;
          break;
        }
      }
      // Always show at least one chip even if the row is too narrow to
      // compute a clean fit — an empty row would look broken.
      setVisibleCount(Math.max(count, 1));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [locations.length, maxRows]);

  const remainingCount = locations.length - visibleCount;
  const hasMore = remainingCount > 0;
  const visibleLocations = isExpanded ? locations : locations.slice(0, visibleCount);

  if (locations.length === 0) return null;

  return (
    <div className="flex min-w-0 flex-1 items-center">
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
