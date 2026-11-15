"use client";

import { MapPin } from "lucide-react";
import type { LocationSuggestion } from "@/lib/customerDiscoveryApi";

function titleCase(text: string): string {
  return text.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

/**
 * The dropdown under the event-location box. `inline` puts it in the normal
 * flow instead of floating over the page, for the mobile sheet where a
 * floating list would be clipped by the sheet's own scrolling.
 */
export default function LocationSuggestionList({
  items,
  activeIndex,
  onPick,
  onHover,
  inline = false,
}: {
  items: LocationSuggestion[];
  activeIndex: number;
  onPick: (item: LocationSuggestion) => void;
  onHover: (index: number) => void;
  inline?: boolean;
}) {
  return (
    <ul
      role="listbox"
      aria-label="Location suggestions"
      className={`z-30 max-h-[260px] overflow-y-auto rounded-xl border border-[#E4E4E7] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${
        inline ? "mt-2" : "absolute top-full right-0 left-0 mt-1.5"
      }`}
    >
      {items.map((item, index) => (
        <li key={`${item.area}-${item.pincode}`} role="option" aria-selected={index === activeIndex}>
          <button
            type="button"
            // Keep focus in the input, so picking doesn't blur and close the list first.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(item)}
            onMouseEnter={() => onHover(index)}
            className={`flex w-full items-start gap-2.5 px-3 py-2 text-left ${index === activeIndex ? "bg-[#FDEEF0]" : "hover:bg-[#F4F4F5]"}`}
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#71717B]" />
            <span className="min-w-0">
              <span className="block truncate font-figtree text-[14px] leading-5 font-medium text-[#030303]">{item.area}</span>
              <span className="block truncate font-figtree text-[12px] leading-4 text-[#71717B]">
                {titleCase(item.district)} · {item.pincode}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
