"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { FilterSectionConfig } from "../types";

export default function FilterSection({
  section,
  selectedIds,
  onToggle,
  defaultOpen = true,
}: {
  section: FilterSectionConfig;
  selectedIds: string[];
  onToggle: (optionId: string) => void;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="group mb-4 flex w-full items-center justify-between"
      >
        <span className="font-figtree text-[15px] font-semibold text-neutral-primary">
          {section.title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-[18px] w-[18px] text-neutral-tertiary transition-colors group-hover:text-brand-primary" />
        ) : (
          <ChevronDown className="h-[18px] w-[18px] text-neutral-tertiary transition-colors group-hover:text-brand-primary" />
        )}
      </button>
      {isOpen && (
        <div className="space-y-4">
          {section.options.map((option) => {
            const checkboxId = `${section.id}-${option.id}`;
            return (
              <label
                key={option.id}
                htmlFor={checkboxId}
                className="group flex cursor-pointer items-center gap-3"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => onToggle(option.id)}
                  // text-* doesn't control a checkbox's checked-state color —
                  // that's accent-color, a separate CSS property — which is
                  // why this was rendering the browser's default blue instead.
                  // No border/focus-ring classes here — with accent-color set,
                  // those rendered as a visible dark edge around the already
                  // black-filled box instead of a clean fill.
                  className="h-4 w-4 rounded accent-black outline-none"
                />
                <span className="font-figtree text-[14px] text-neutral-secondary transition-colors group-hover:text-brand-primary">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
