"use client";

import type { VendorCategory } from "../types";

export default function CategoryTabs({
  categories,
  activeId,
  onSelect,
}: {
  categories: VendorCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex items-center overflow-x-auto border-b border-black/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => {
        const isActive = category.id === activeId;
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(category.id)}
            className={`shrink-0 border-b-2 px-5 py-3.5 font-figtree text-[14px] whitespace-nowrap transition-colors sm:px-6 ${
              isActive
                ? "border-brand-primary font-bold text-brand-primary"
                : "border-transparent font-semibold text-neutral-secondary hover:text-brand-primary"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
