"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface SearchDropdownOption {
  value: string;
  label: string;
}

/**
 * Custom-styled single-select used inside EventSearchCard. A native
 * <select>'s option-list can't be styled cross-browser (hover/selected
 * backgrounds, custom row spacing) — this reimplements it as a button +
 * absolutely-positioned option list so the Figma row spec can be matched
 * exactly.
 */
export default function SearchDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchDropdownOption[];
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedLabel = options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <div ref={containerRef} className="relative flex-1">
      <label className="mb-2 block text-[14px] font-semibold text-brand-950">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between rounded-full bg-[#F4F4F5] px-5 py-3 text-left text-[14px] text-[#71717B] outline-none"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-2 max-h-[329px] w-full min-w-[314px] overflow-y-auto rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex h-[47px] w-full items-center justify-center border-b border-[#E4E4E7] px-4 py-3.5 text-center font-figtree text-[16px] leading-[18px] font-medium tracking-[0.01em] transition-colors last:border-b-0 ${
                  isSelected
                    ? "bg-brand-primary text-white"
                    : "text-[#9F9FA9] hover:bg-[#F4F4F5]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
