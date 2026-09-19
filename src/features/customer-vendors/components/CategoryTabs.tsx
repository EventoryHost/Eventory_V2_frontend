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
    <div className="flex items-center overflow-x-auto border-b border-[#e4e4e7] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            className={`flex shrink-0 items-center gap-2.5 border-b-[3px] px-5 py-2.5 whitespace-nowrap transition-colors ${
              isActive ? "border-brand-primary" : "border-transparent"
            }`}
          >
            {icon && (
              <Image src={icon} alt="" width={16} height={16} className="size-4 object-contain" />
            )}
            <span
              className={`font-figtree text-[16px] leading-[20px] text-[#030303] ${
                isActive ? "font-semibold" : "font-medium"
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
