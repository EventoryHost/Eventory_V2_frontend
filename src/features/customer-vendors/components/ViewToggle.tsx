"use client";

import { LayoutGrid, List } from "lucide-react";
import type { ViewMode } from "../types";

const OPTIONS: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { id: "grid", label: "Grid view", icon: LayoutGrid },
  { id: "list", label: "List view", icon: List },
];

export default function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-[#ebebeb] bg-white p-1.5">
      {OPTIONS.map(({ id, label, icon: Icon }, index) => (
        <div key={id} className="flex items-center gap-2">
          {index > 0 && <span className="h-3 w-px bg-[#e4e4e7]" />}
          <button
            type="button"
            aria-label={label}
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={`flex size-5 items-center justify-center rounded transition-colors ${
              value === id ? "bg-[#f4f4f5] text-[#333333]" : "text-[#999999] hover:text-[#333333]"
            }`}
          >
            <Icon className="size-4" strokeWidth={1.4} />
          </button>
        </div>
      ))}
    </div>
  );
}
