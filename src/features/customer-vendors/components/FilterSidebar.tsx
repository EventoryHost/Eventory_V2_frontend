"use client";

import type { FilterSectionConfig } from "../types";
import FilterPanelContent, { type SelectedFilters } from "./FilterPanelContent";

export default function FilterSidebar({
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
    <aside className="hidden w-[290px] shrink-0 lg:block">
      <div className="sticky top-[92px] h-fit max-h-[calc(100vh-112px)] overflow-y-auto rounded-[18px] border border-black/10 bg-white p-5">
        <FilterPanelContent
          sections={sections}
          selected={selected}
          onToggleOption={onToggleOption}
          onClear={onClear}
        />
      </div>
    </aside>
  );
}
