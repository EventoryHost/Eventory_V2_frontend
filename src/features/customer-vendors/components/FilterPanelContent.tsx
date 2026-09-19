"use client";

import { Fragment } from "react";
import type { FilterSectionConfig, FilterSectionId, SelectedFilters } from "../types";
import FilterSection from "./FilterSection";

export type { SelectedFilters };

export default function FilterPanelContent({
  sections,
  selected,
  onToggleOption,
  onClear,
}: {
  sections: FilterSectionConfig[];
  selected: SelectedFilters;
  onToggleOption: (sectionId: FilterSectionId, optionId: string) => void;
  onClear: () => void;
}) {
  const visibleSections = sections.filter((section) => section.options.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="font-figtree text-[14px] leading-[18px] font-semibold tracking-[-0.28px] text-[#808080]">
          FILTER
        </span>
        <button
          type="button"
          onClick={onClear}
          className="font-figtree text-[14px] leading-[18px] text-[#ea1d3b] hover:underline"
        >
          Clear
        </button>
      </div>

      <div className="h-px w-full bg-[#e4e4e7]" />

      <div className="flex flex-col gap-6">
        {visibleSections.map((section, index) => (
          <Fragment key={section.id}>
            <FilterSection
              section={section}
              selectedIds={selected[section.id]}
              onToggle={(optionId) => onToggleOption(section.id, optionId)}
            />
            {/* Divider after every section, including the last — the design
                closes the panel with a rule (Line 131). */}
            <div className="h-px w-full bg-[#e4e4e7]" aria-hidden={index === visibleSections.length - 1} />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
