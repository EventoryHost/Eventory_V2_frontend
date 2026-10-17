"use client";

import Image from "next/image";
import type { VendorCategory } from "../types";
import { CATEGORY_META } from "@/lib/categoryMeta";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=116-799
// Real per-category icon art (CATEGORY_META — the same icons the landing
// page's "Browse our Vendors" and ProductCard's category badge already use)
// in place of the plain emoji glyph this previously rendered; every label
// now stays solid black regardless of active state, with only the pink
// underline bar (now 6px, rounded top corners only) marking which tab is
// selected, matching the Figma states exactly.
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
          const icon = CATEGORY_META[category.id]?.icon;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              aria-pressed={isActive}
              className="flex shrink-0 cursor-pointer flex-col items-center gap-2"
            >
              {icon ? (
                <Image src={icon} alt="" width={56} height={56} className="size-[36px] object-contain sm:size-[56px]" />
              ) : (
                <span className="text-[22px] leading-none sm:text-[28px]">{category.icon}</span>
              )}
              <span className="font-figtree text-[12px] font-semibold whitespace-nowrap text-brand-950 sm:text-[18px]">
                {category.label}
              </span>
              <span
                className={`h-[6px] w-full rounded-t-[6px] transition-colors ${
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
