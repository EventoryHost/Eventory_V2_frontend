"use client";

import { X } from "lucide-react";

export interface ActiveChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export default function ActiveFilterChips({
  chips,
  onClearAll,
}: {
  chips: ActiveChip[];
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="group flex h-[32px] items-center gap-2 rounded-full border border-[#3C060D] bg-[#FDEEF0] px-4 transition-opacity hover:opacity-80"
        >
          <span className="font-figtree text-[13px] text-[#3C060D]">{chip.label}</span>
          <X className="h-4 w-4 text-[#3C060D]" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="px-2 font-figtree text-[13px] font-bold text-brand-primary hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
