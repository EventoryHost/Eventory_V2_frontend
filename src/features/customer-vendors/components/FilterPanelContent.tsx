"use client";

import type { FilterSectionConfig } from "../types";
import FilterSection from "./FilterSection";

export interface SelectedFilters {
  eventType: string[];
  pricing: string[];
}

export default function FilterPanelContent({
  sections,
  selected,
  onToggleOption,
  onClear,
}: {
  sections: FilterSectionConfig[];
  selected: SelectedFilters;
  onToggleOption: (sectionId: FilterSectionConfig["id"], optionId: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-figtree text-[15px] font-semibold text-brand-primary">Filters</h2>
          <p className="font-figtree text-[12px] text-neutral-tertiary">Refine your search</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="font-figtree text-[13px] font-semibold text-brand-primary hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <FilterSection
            key={section.id}
            section={section}
            selectedIds={selected[section.id]}
            onToggle={(optionId) => onToggleOption(section.id, optionId)}
          />
        ))}
      </div>
    </div>
  );
}
