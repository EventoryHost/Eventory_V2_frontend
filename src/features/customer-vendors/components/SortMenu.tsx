"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check } from "lucide-react";
import { SORT_OPTIONS, type SortOption } from "../types";

export default function SortMenu({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLabel = SORT_OPTIONS.find((option) => option.id === value)?.label ?? "Sort";

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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 transition-all hover:border-brand-primary"
      >
        <ArrowUpDown className="h-[18px] w-[18px] text-neutral-secondary" />
        <span className="font-figtree text-[13px] font-bold text-neutral-primary">{activeLabel}</span>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+8px)] right-0 z-20 w-[200px] overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-lg"
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = option.id === value;
            return (
              <li key={option.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left font-figtree text-[13px] transition-colors hover:bg-neutral-subtle ${
                    isActive ? "font-semibold text-brand-primary" : "text-neutral-primary"
                  }`}
                >
                  {option.label}
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
