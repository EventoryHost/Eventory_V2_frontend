"use client";

import { LayoutGrid, List } from "lucide-react";
import type { ViewMode } from "../types";

const OPTIONS: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { id: "list", label: "List view", icon: List },
  { id: "grid", label: "Grid view", icon: LayoutGrid },
];

export default function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex h-[48px] items-center gap-1 rounded-xl border border-black/10 bg-white p-1">
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = value === id;
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              isActive
                ? "bg-brand-primary/10 text-brand-primary"
                : "text-neutral-tertiary hover:bg-neutral-subtle"
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
