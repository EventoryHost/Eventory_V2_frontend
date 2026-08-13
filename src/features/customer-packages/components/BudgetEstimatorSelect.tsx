"use client";

import { ChevronDown } from "lucide-react";

export default function BudgetEstimatorSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block rounded-xl border border-black/10 px-4 py-2 transition-colors focus-within:border-brand-primary">
      <span className="block font-figtree text-[11px] text-neutral-tertiary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none bg-transparent pr-6 font-figtree text-[14px] font-semibold text-brand-950 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-brand-primary" />
    </label>
  );
}
