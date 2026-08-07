"use client";

import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-neutral-tertiary" />
      <label htmlFor="vendor-search" className="sr-only">
        Search for vendors, services or locations
      </label>
      <input
        id="vendor-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search for vendors, services or locations"
        className="h-[48px] w-full rounded-xl border border-black/10 bg-white pr-4 pl-12 font-figtree text-[15px] text-neutral-primary outline-none transition-all placeholder:text-neutral-tertiary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
      />
    </div>
  );
}
