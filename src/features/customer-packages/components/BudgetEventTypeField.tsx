"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { groupEventCategories } from "@/lib/eventCategoryGroups";
import { toEventTypeDisplay } from "@/features/customer-landing/data/eventSearchTaxonomy";
import SearchDropdownPanel from "@/features/customer-landing/components/SearchDropdownPanel";

/**
 * Same real, live data + type-to-filter behavior as the landing page's
 * Event Type field (EventSearchCard.tsx) — real backend categories merged
 * into keyword families, filtered as you type — but in THIS section's own
 * bordered-box chrome (label above, input below) to match the rest of the
 * budget estimator's fields, instead of the landing page's pill style.
 */
export default function BudgetEventTypeField({
  rawEventCategories,
  selectedId,
  selectedLabel,
  onSelect,
}: {
  rawEventCategories: string[];
  selectedId: string;
  selectedLabel: string;
  onSelect: (id: string, label: string) => void;
}) {
  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(selectedLabel), [selectedLabel]);

  const options = useMemo(
    () => toEventTypeDisplay(groupEventCategories(rawEventCategories)),
    [rawEventCategories]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

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
      <span className="block font-figtree text-[13px] text-[#71717B] sm:text-[16px]">
        What event are you planning?
      </span>
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
        placeholder="Search your event type"
        className="w-full bg-transparent pr-6 font-figtree text-[14px] font-medium text-[#9F9FA9] outline-none sm:text-[16px]"
      />
      <ChevronDown
        className={`pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-brand-950 transition-transform ${open ? "rotate-180" : ""}`}
      />

      {open && (
        <SearchDropdownPanel
          header="Popular events"
          rows={filtered}
          selectedId={selectedId}
          onSelect={(id) => {
            const picked = options.find((o) => o.id === id);
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
