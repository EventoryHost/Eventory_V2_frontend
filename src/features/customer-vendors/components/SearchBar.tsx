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
      <Search
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#333333]"
        strokeWidth={1.6}
      />
      <label htmlFor="vendor-search" className="sr-only">
        Search for vendors, services or locations
      </label>
      <input
        id="vendor-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search"
        className="h-[48px] w-full rounded-[14px] border border-[#f1f1f1] bg-white pr-4 pl-12 font-figtree text-[16px] font-medium text-neutral-primary outline-none transition-colors placeholder:text-[#666666] focus:border-brand-primary"
      />
    </div>
  );
}
