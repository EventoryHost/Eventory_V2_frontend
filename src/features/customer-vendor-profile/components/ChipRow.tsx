"use client";

import { useState } from "react";

const INITIAL_VISIBLE = 20;

/**
 * A wrapping row of outlined pills — used for both "Service Localities" and
 * "Event Specialisation".
 *
 * The design caps the row and ends it with a "9+" link; here the overflow
 * count is real and the link expands the row in place rather than going
 * anywhere, since there is nowhere else to show them.
 */
export default function ChipRow({ items }: { items: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) return null;

  const visible = isExpanded ? items : items.slice(0, INITIAL_VISIBLE);
  const hidden = items.length - visible.length;

  return (
    <div className="flex flex-wrap content-center items-center gap-3">
      {visible.map((item) => (
        <span
          key={item}
          className="flex items-center justify-center rounded-[37px] border border-[#e4e4e7] bg-white px-3 py-1.5 font-figtree text-[14px] leading-[20px] font-medium whitespace-nowrap text-[#030303]"
        >
          {item}
        </span>
      ))}

      {(hidden > 0 || isExpanded) && (
        <button
          type="button"
          onClick={() => setIsExpanded((open) => !open)}
          className="font-figtree text-[16px] leading-[24px] text-[#030303] underline"
        >
          {isExpanded ? "Show less" : `${hidden}+`}
        </button>
      )}
    </div>
  );
}
