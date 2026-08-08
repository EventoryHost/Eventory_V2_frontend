"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export type CollapsibleSectionProps = {
  label: string;
  count: string;
  children?: ReactNode;
};

export default function CollapsibleSection({
  label,
  count,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-[586px] border-b border-[#E4E4E7]">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-14 w-full items-center justify-between"
      >
        <span className="flex items-baseline gap-1.5">
          <span className="font-figtree text-[15px] font-semibold leading-[22.5px] text-[#030303]">
            {label}
          </span>
          <span className="font-figtree text-[15px] font-normal leading-[22.5px] text-[#71717B]">
            ({count})
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`text-[#71717B] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}
