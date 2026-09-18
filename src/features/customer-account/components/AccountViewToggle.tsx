"use client";

import { LayoutGrid, List } from "lucide-react";

export type AccountViewMode = "grid" | "list";

const OPTIONS = [
  { mode: "grid", Icon: LayoutGrid, label: "Grid view" },
  { mode: "list", Icon: List, label: "List view" },
] as const;

/**
 * The small grid/list switch in the account pages' headers (Viewed Items,
 * node 1414:8182; Wishlist, node 1541:6383) — the same control in both, so it
 * lives here rather than being written out twice.
 */
export default function AccountViewToggle({
  value,
  onChange,
}: {
  value: AccountViewMode;
  onChange: (mode: AccountViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-hidden rounded-[10px] border border-[#EBEBEB] bg-white p-1.5">
      {OPTIONS.map(({ mode, Icon, label }, index) => (
        <span key={mode} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden className="h-3 w-px bg-[#EBEBEB]" />}
          <button
            type="button"
            onClick={() => onChange(mode)}
            aria-label={label}
            aria-pressed={value === mode}
            className={`flex h-5 w-5 items-center justify-center rounded-[5px] ${
              value === mode ? "bg-[#F4F4F5] text-[#030303]" : "text-[#71717B]"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        </span>
      ))}
    </div>
  );
}
