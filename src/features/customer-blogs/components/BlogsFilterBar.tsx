"use client";

import { ChevronDown } from "lucide-react";

const CATEGORIES = ["All", "Festivals & Seasons", "Planning & Costs", "Decoration Ideas"];

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-31080
export default function BlogsFilterBar({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <section className="w-full px-4 pt-12 pb-6 sm:px-6 lg:px-16 lg:pt-20">
      <div className="mx-auto flex max-w-[1312px] flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-start gap-2">
          {CATEGORIES.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`rounded-full px-4 py-2 font-figtree text-[14px] whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#F0596F] font-semibold text-white"
                    : "border border-[#F4F4F5] bg-white font-medium text-[#3F3F47] hover:border-[#F0596F]/30"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-[#F4F4F5] bg-white py-2 pr-3.5 pl-4 font-figtree text-[14px] font-medium text-[#3F3F47]"
          >
            Sort: Latest
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    </section>
  );
}
