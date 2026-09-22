"use client";

import type { FilterSectionConfig, SelectedFilters } from "../types";
import FilterPanelContent from "./FilterPanelContent";

export default function FilterSidebar({
  sections,
  selected,
  onToggleOption,
  onClear,
}: {
  sections: FilterSectionConfig[];
  selected: SelectedFilters;
  onToggleOption: (sectionId: string, optionId: string) => void;
  onClear: () => void;
}) {
  return (
    <aside className="hidden w-[292px] shrink-0 lg:block">
      {/* The design's panel is 1596px tall and runs past the fold; kept
          sticky and self-scrolling so all six sections stay reachable
          without scrolling the results out of view. */}
      <div className="sticky top-[92px] max-h-[calc(100vh-112px)] overflow-y-auto rounded-[20px] border border-[#e4e4e7] bg-white p-5">
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
