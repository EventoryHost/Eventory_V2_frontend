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

  if (section.options.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="group flex w-full items-center justify-between"
      >
        <span className="font-figtree text-[16px] leading-[18px] font-medium tracking-[-0.32px] text-black">
          {section.title}
        </span>
        {isOpen ? (
          <ChevronUp className="size-5 text-[#272727]" strokeWidth={1.67} />
        ) : (
          <ChevronDown className="size-5 text-[#272727]" strokeWidth={1.67} />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3">
          {section.options.map((option) => {
            const checkboxId = `${section.id}-${option.id}`;
            const isChecked = selectedIds.includes(option.id);
            return (
              <label
                key={option.id}
                htmlFor={checkboxId}
                className="group flex cursor-pointer items-center gap-2"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(option.id)}
                  // text-* doesn't control a checkbox's checked-state color —
                  // that's accent-color, a separate CSS property.
                  className="size-[14px] shrink-0 rounded-[3.733px] border-[1.4px] border-[#808080] accent-brand-primary outline-none"
                />
                <span
                  className={`font-figtree text-[14px] leading-[18px] font-medium tracking-[-0.28px] transition-colors ${
                    isChecked ? "text-neutral-primary" : "text-[#808080] group-hover:text-neutral-primary"
                  }`}
                >
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
