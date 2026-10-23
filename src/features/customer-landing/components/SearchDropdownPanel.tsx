"use client";

import type { LucideIcon } from "lucide-react";

/**
 * Shared dropdown popup for the Event Type and Choose-vendor-service fields
 * — Figma node 2240:10004 states 04/05/06/07/08: white panel, uppercase
 * tracked-out header ("POPULAR EVENTS" / "SERVICES FOR X"), icon+label
 * (+ optional subtitle) rows, row hover fill #F6F6F7 (120ms), enters with
 * an 8px drop + 0.98→1 scale over 200ms anchored to the field's left edge.
 */
export default function SearchDropdownPanel({
  header,
  rows,
  selectedId,
  onSelect,
  className = "",
}: {
  header: string;
  rows: {
    id: string;
    label: string;
    subtitle?: string;
    icon?: string;
    IconComponent?: LucideIcon;
    /** Per-row icon-tile background (data/eventSearchTaxonomy.ts gives each event-type family its own color) — falls back to the shared neutral tile when a row doesn't set one (e.g. "Choose vendor service" rows). */
    iconBg?: string;
    /** Figma node 2250:9764 — "Choose vendor service"'s non-Decorator rows (data/eventSearchTaxonomy.ts's ALL_SERVICE_OPTIONS). Still clickable, just visually flagged as not live yet. */
    comingSoon?: boolean;
  }[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      role="listbox"
      className={`absolute top-[calc(100%+8px)] left-0 z-20 w-full origin-top-left animate-[dropdown-enter_200ms_ease-out] rounded-[20px] border border-[#E4E4E8] bg-white p-2.5 shadow-[0px_10px_40px_0px_rgba(0,0,0,0.1)] ${className}`}
    >
      <div className="px-2.5 pt-2 pb-1.5">
        <span className="font-figtree text-[12px] font-medium tracking-[0.04em] text-[#8E8E96] uppercase">
          {header}
        </span>
      </div>
      <div className="flex max-h-[360px] flex-col gap-0.5 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="px-2.5 py-3 text-center font-figtree text-[13px] text-[#9F9FA9]">No options</p>
        ) : (
          rows.map((row) => (
            <button
              key={row.id}
              type="button"
              role="option"
              aria-selected={row.id === selectedId}
              onClick={() => onSelect(row.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-[120ms] ${
                row.id === selectedId ? "bg-[#FDE7EB]" : "hover:bg-[#F6F6F7]"
              }`}
            >
              <span
                className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                style={{ backgroundColor: row.iconBg ?? "#F4F4F5" }}
              >
                {row.IconComponent ? (
                  <row.IconComponent className="h-5 w-5 text-brand-primary" strokeWidth={1.75} />
                ) : (
                  <img src={row.icon} alt="" className="absolute inset-0 h-full w-full object-contain p-1" />
                )}
              </span>
              <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-figtree text-[16px] font-medium text-[#030303]">{row.label}</span>
                  {row.subtitle && (
                    <span className="truncate font-figtree text-[13px] text-[#8E8E96]">{row.subtitle}</span>
                  )}
                </span>
                {row.comingSoon && (
                  <span className="shrink-0 rounded-full border-[0.5px] border-[#9F9FA9] bg-white px-2.5 py-0.5 font-figtree text-[9px] font-semibold tracking-[0.09px] text-[#9F9FA9] uppercase">
                    Coming soon
                  </span>
                )}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
