"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

export interface SearchAutocompleteOption {
  value: string;
  label: string;
}

/**
 * Same themed row-list popup as SearchDropdown, but the trigger is a real
 * text field instead of a button — typing filters `options` (already
 * fully loaded client-side; both Event Type and vendor-service lists are
 * small, complete lists already fetched upfront, so this is a real filter
 * over real data, not a fabricated per-keystroke fetch) down to matches as
 * you type, rather than only ever opening one fixed, unfiltered list.
 */
export default function SearchAutocomplete({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchAutocompleteOption[];
  placeholder: string;
}) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";
  const [query, setQuery] = useState(selectedLabel);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the field's text in sync with the selection when it changes from
  // outside this component (e.g. a parent reset) — not on every render,
  // so it doesn't fight the user's own typing.
  useEffect(() => {
    setQuery(selectedLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Nothing matching was picked — revert the typed text back to
        // whatever's actually selected rather than leaving stray input.
        setQuery(selectedLabel);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, selectedLabel]);

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || trimmed === selectedLabel.toLowerCase()) return options;
    return options.filter((option) => option.label.toLowerCase().includes(trimmed));
  }, [options, query, selectedLabel]);

  function selectOption(option: SearchAutocompleteOption) {
    onChange(option.value);
    setQuery(option.label);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <label className="mb-2 block text-[14px] font-semibold text-brand-950">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            if (value) onChange("");
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-full bg-[#F4F4F5] px-5 py-3 pr-10 text-[14px] text-[#71717B] outline-none"
        />
        <Search size={16} className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-[#71717B]" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-2 max-h-[329px] w-full min-w-[314px] overflow-y-auto rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
          {filteredOptions.length === 0 ? (
            <p className="px-4 py-3.5 text-center font-figtree text-[13px] text-[#9F9FA9]">No matches</p>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectOption(option)}
                  className={`flex h-[47px] w-full items-center justify-center border-b border-[#E4E4E7] px-4 py-3.5 text-center font-figtree text-[16px] leading-[18px] font-medium tracking-[0.01em] transition-colors last:border-b-0 ${
                    isSelected ? "bg-brand-primary text-white" : "text-[#9F9FA9] hover:bg-[#F4F4F5]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
