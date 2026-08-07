"use client";

import type { VendorCategory } from "../types";

export default function VendorCategoryTabs({
  categories,
  activeId,
  onSelect,
}: {
  categories: VendorCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mx-4 rounded-3xl bg-white px-3 py-5 sm:mx-6 sm:px-4 sm:py-6 lg:mx-auto lg:w-fit lg:rounded-full lg:border lg:border-black/5 lg:px-12 lg:py-6 lg:shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex gap-5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center sm:gap-10 sm:px-2 lg:gap-12">
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              aria-pressed={isActive}
              className="flex shrink-0 cursor-pointer flex-col items-center gap-2"
            >
              <span className="text-[22px] leading-none sm:text-[28px]">{category.icon}</span>
              <span
                className={`font-figtree text-[12px] font-semibold whitespace-nowrap transition-colors sm:text-[14px] ${
                  isActive ? "text-brand-950" : "text-brand-950/60"
                }`}
              >
                {category.label}
              </span>
              <span
                className={`h-[3px] w-full rounded-full transition-colors ${
                  isActive ? "bg-brand-primary" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
