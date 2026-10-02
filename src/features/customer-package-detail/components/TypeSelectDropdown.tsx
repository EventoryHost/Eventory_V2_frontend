"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function TypeSelectDropdown({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      <div className="mb-1.5 font-figtree text-[12px] leading-[18px] font-medium tracking-[0.02em] text-[#71717B] uppercase">
        {label}
      </div>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex w-full items-center gap-4 rounded-xl border border-[#E4E4E7] bg-white px-3.5 py-3 text-left transition hover:border-black/30"
      >
        <span
          className={`flex-1 truncate font-figtree text-[14px] leading-[20px] ${
            value ? "font-medium text-[#030303]" : "text-[#9F9FA9]"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#71717B] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+6px)] left-0 z-20 max-h-[280px] w-full overflow-y-auto rounded-xl bg-white shadow-[0px_0px_2.5px_0px_rgba(0,0,0,0.12)]"
        >
          {options.map((option) => {
            const isActive = option === value;
            return (
              <li key={option} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between p-3 text-left font-figtree text-[14px] leading-[20px] font-medium transition ${
                    isActive ? "bg-[#F0F3F4] text-[#030303]" : "text-[#030303] hover:bg-black/[0.02]"
                  }`}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
