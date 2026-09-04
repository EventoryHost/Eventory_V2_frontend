"use client";

import Image from "next/image";
import type { VendorCategory } from "../types";
import { CATEGORY_META } from "@/lib/categoryMeta";

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
        const icon = CATEGORY_META[category.id]?.icon;
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(category.id)}
            style={
              isActive
                ? { background: "linear-gradient(0deg, #FDEEF0 0%, rgba(252, 252, 252, 0) 80%)" }
                : undefined
            }
            className={`flex shrink-0 items-center gap-2 border-b-[3px] px-5 py-3.5 whitespace-nowrap transition-colors sm:px-6 ${
              isActive ? "border-brand-primary" : "border-transparent"
            }`}
          >
            {icon && (
              <Image src={icon} alt="" width={20} height={20} className="h-5 w-5 object-contain" />
            )}
            <span
              className={`font-figtree text-[14px] ${
                isActive ? "font-bold text-brand-primary" : "font-semibold text-neutral-secondary hover:text-brand-primary"
              }`}
            >
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
