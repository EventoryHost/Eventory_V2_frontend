"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CheckCircle2, X } from "lucide-react";
import type { ColourOption } from "../types";
import type { ColourCategory } from "../data/extendedColorPalette";

// Shared by any colour whose hex can't speak for itself in a small circle —
// "Multicolor" has no single hex in the design (a conic-gradient swatch),
// so it's special-cased everywhere a ColourOption's `swatch` is painted.
const MULTICOLOR_GRADIENT =
  "conic-gradient(from 90deg, #F6B8B8, #C5A9F8, #9DDBBB, #CBC6D5, #F8B1F0, #F5BBD4, #F2D2B2, #EEE5A3, #EEABD5, #B1E5EF, #F6B8B8)";

function swatchStyle(swatch: string): React.CSSProperties {
  return swatch === "multicolor" ? { background: MULTICOLOR_GRADIENT } : { backgroundColor: swatch };
}

export default function ColourSelectDropdown({
  label,
  helperText,
  placeholder,
  options,
  categories,
  selectedIds,
  onToggle,
  onClear,
}: {
  /** Omit when the caller already renders its own heading above this (e.g. a "Request different colour(s)" section label). */
  label?: string;
  helperText?: string;
  placeholder: string;
  /** Flat list — e.g. the "Add an item" curated palette. Mutually exclusive with `categories`. */
  options?: ColourOption[];
  /** Grouped-with-headers list — e.g. the extended palette for requesting an alternate colour on an existing item. Mutually exclusive with `options`. */
  categories?: ColourCategory[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const flatOptions = options ?? categories?.flatMap((c) => c.colours) ?? [];
  const selected = flatOptions.filter((o) => selectedIds.includes(o.id));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className="font-figtree text-[12px] leading-[18px] font-medium tracking-[0.02em] text-[#71717B] uppercase">
            {label}
          </span>
          {helperText && (
            <span className="font-figtree text-[12px] leading-[18px] font-normal normal-case text-[#9F9FA9]">
              · {helperText}
            </span>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 rounded-xl border border-[#E4E4E7] bg-white px-3.5 py-3 text-left transition hover:border-black/30"
      >
        <span
          className={`flex-1 truncate font-figtree text-[14px] leading-[20px] ${
            selected.length > 0 ? "font-medium text-[#030303]" : "text-[#9F9FA9]"
          }`}
        >
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#71717B] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 z-20 max-h-[320px] w-full overflow-y-auto rounded-xl bg-white shadow-[0px_0px_2.5px_0px_rgba(0,0,0,0.12)]"
        >
          {categories
            ? categories.map((cat) => (
                <li key={cat.id}>
                  <div className="sticky top-0 bg-white px-3 pt-2.5 pb-1 font-figtree text-[11px] leading-[16px] font-semibold text-neutral-tertiary uppercase">
                    {cat.label}
                  </div>
                  <ul>
                    {cat.colours.map((option) => (
                      <ColourRow key={option.id} option={option} isActive={selectedIds.includes(option.id)} onToggle={onToggle} />
                    ))}
                  </ul>
                </li>
              ))
            : flatOptions.map((option) => (
                <ColourRow key={option.id} option={option} isActive={selectedIds.includes(option.id)} onToggle={onToggle} />
              ))}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {selected.map((colour) => (
              <span
                key={colour.id}
                className="flex h-8 items-center gap-1 rounded-full border border-brand-primary py-2 pr-3 pl-3.5 font-figtree text-[12px] font-medium text-[#030303]"
              >
                <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={swatchStyle(colour.swatch)} />
                {colour.label}
                <button type="button" onClick={() => onToggle(colour.id)} aria-label={`Remove ${colour.label}`}>
                  <X className="h-4 w-4 text-[#030303]" />
                </button>
              </span>
            ))}
          </div>
          <button type="button" onClick={onClear} className="font-figtree text-[14px] font-semibold text-[#B4112A] hover:underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

function ColourRow({
  option,
  isActive,
  onToggle,
}: {
  option: ColourOption;
  isActive: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <li role="option" aria-selected={isActive}>
      <button
        type="button"
        onClick={() => onToggle(option.id)}
        className={`flex w-full items-center justify-between gap-3 p-2 text-left transition ${
          isActive ? "bg-[#F0F3F4]" : "hover:bg-black/[0.02]"
        }`}
      >
        <span className="flex items-center gap-3">
          <span className="h-7 w-7 shrink-0 rounded-full border border-black/10" style={swatchStyle(option.swatch)} />
          <span className="font-figtree text-[14px] leading-[20px] font-medium text-[#030303]">{option.label}</span>
        </span>
        {isActive && <CheckCircle2 className="h-6 w-6 shrink-0 text-brand-primary" />}
      </button>
    </li>
  );
}
