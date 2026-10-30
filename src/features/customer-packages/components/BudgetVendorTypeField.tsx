"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import VendorServiceDropdownPanel from "@/features/customer-landing/components/VendorServiceDropdownPanel";

// All 6 real vendor categories (VENDOR_CATEGORIES minus its "all" entry),
// paired with the same icons the landing page's "Choose vendor service"
// field and the vendor-listing tabs already use — unlike that landing-page
// field, none of these are flagged "coming soon" here: every one of them has
// real live packages behind it (confirmed against GET
// /customer/packages/filters' vendorTypes), so all 6 are equally pickable.
const VENDOR_TYPE_OPTIONS = VENDOR_CATEGORIES.filter((category) => category.id !== "all").map((category) => ({
  id: category.id,
  label: category.label,
  icon: CATEGORY_META[category.id]?.icon,
}));

export default function BudgetVendorTypeField({
  selectedId,
  selectedLabel,
  onSelect,
}: {
  selectedId: string;
  selectedLabel: string;
  onSelect: (id: string, label: string) => void;
}) {
  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(selectedLabel), [selectedLabel]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VENDOR_TYPE_OPTIONS;
    return VENDOR_TYPE_OPTIONS.filter((option) => option.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery(selectedLabel);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, selectedLabel]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-[#E4E4E7] bg-white px-4 py-3 transition-colors focus-within:border-brand-primary"
    >
      <span className="block font-figtree text-[13px] text-[#71717B] sm:text-[16px]">Vendor</span>
      <input
        type="text"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search vendor type"
        className="w-full bg-transparent pr-6 font-figtree text-[14px] font-medium text-[#9F9FA9] outline-none sm:text-[16px]"
      />
      <ChevronDown
        className={`pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-brand-950 transition-transform ${open ? "rotate-180" : ""}`}
      />

      {open && (
        <VendorServiceDropdownPanel
          rows={filtered}
          selectedId={selectedId}
          onSelect={(id) => {
            const picked = VENDOR_TYPE_OPTIONS.find((o) => o.id === id);
            if (!picked) return;
            onSelect(picked.id, picked.label);
            setQuery(picked.label);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
