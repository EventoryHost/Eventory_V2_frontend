"use client";

import { useState } from "react";
import { Check, ChevronUp, ChevronDown, Pencil } from "lucide-react";

export type WhatsIncludedSectionProps = {
  items: string[];
  specialRequest: string;
  onEdit?: () => void;
};

export default function WhatsIncludedSection({
  items,
  specialRequest,
  onEdit,
}: WhatsIncludedSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full max-w-[828px] border-t border-[#E5E7EB] pt-5 pr-4 pb-5 pl-4">
      <div className="flex w-full max-w-[796px] items-center justify-between">
        <h3 className="font-figtree text-[18px] font-bold text-[#101828]">
          What&apos;s Included
        </h3>
        <button
          type="button"
          aria-label={isOpen ? "Collapse" : "Expand"}
          onClick={() => setIsOpen((open) => !open)}
          className="text-[#101828]"
        >
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid w-full max-w-[740px] grid-flow-col grid-rows-5 gap-x-2 gap-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex h-5 w-[224px] items-center gap-1 font-figtree text-[15px] font-normal text-[#374151]"
              >
                <Check size={16} className="shrink-0 text-[#16A34A]" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-[#E5E7EB]" />

          <div className="flex w-full max-w-[796px] items-center justify-between gap-4 rounded-[8px] border-l-[3px] border-[#FFEBCC] bg-[#FFFBF5] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16A34A]">
                <Check size={14} className="text-white" />
              </span>
              <div>
                <p className="font-figtree text-[12px] font-bold uppercase tracking-wide text-[#101828]">
                  Special Request Registered
                </p>
                <p className="mt-1 font-figtree text-[14px] font-normal text-body-secondary">
                  &quot;{specialRequest}&quot;
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="flex shrink-0 items-center gap-2 font-figtree text-[14px] font-medium text-[#101828]"
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
