"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Shared trigger pill for the Event Type / Choose vendor service fields —
 * Figma node 2240:10004, states 01/02/04/06 etc. Idle: #F4F4F5 fill.
 * Hover: #EAEAEC, 120ms ease-out. Focus (dropdown open): white fill, 1.5px
 * #030303 border, soft drop shadow. Filled (value picked, not focused):
 * same #F4F4F5 fill as idle but dark (#030303) text.
 *
 * A real text input, not a button — real bug fixed 2026-10-03 (PM-reported:
 * "make them textfields, filter dropdown as you type"). `query` is the
 * live-typed text (parent filters its dropdown rows against it); `isFilled`
 * is whether a REAL option is currently selected, kept separate from
 * `query` because the field also shows free-typed, not-yet-selected text
 * in the placeholder's grey until a row is actually picked.
 */
const SearchFieldTrigger = forwardRef<
  HTMLInputElement,
  {
    query: string;
    onQueryChange: (value: string) => void;
    placeholder: string;
    isOpen: boolean;
    onFocus: () => void;
    className?: string;
    id?: string;
  }
>(function SearchFieldTrigger({ query, onQueryChange, placeholder, isOpen, onFocus, className = "", id }, ref) {
  return (
    <div
      className={`flex h-12 w-full items-center gap-2 rounded-full px-4 transition-colors duration-[120ms] ease-out ${
        isOpen
          ? "border-[1.5px] border-[#030303] bg-white shadow-[0px_4px_7px_0px_rgba(0,0,0,0.08)]"
          : "border border-transparent bg-[#F4F4F5] hover:bg-[#EAEAEC]"
      } ${className}`}
    >
      <input
        ref={ref}
        id={id}
        type="text"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        autoComplete="off"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent font-figtree text-[16px] font-medium text-[#030303] outline-none placeholder:text-[#9F9FA9]"
      />
      <ChevronDown
        className={`h-[18px] w-[18px] shrink-0 text-[#71717B] transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </div>
  );
});

export default SearchFieldTrigger;
