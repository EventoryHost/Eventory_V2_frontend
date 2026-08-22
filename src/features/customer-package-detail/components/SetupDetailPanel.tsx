"use client";

import { useMemo, useState } from "react";
import { PlusCircle, XCircle } from "lucide-react";
import type { IncludedItemEntry, IncludedItemLine } from "../types";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-figtree text-[12px] text-neutral-tertiary">{label}</div>
      <div className="mt-0.5 font-figtree text-[15px] font-semibold text-brand-950">{value}</div>
    </div>
  );
}

function ItemDetailCard({ item }: { item: IncludedItemLine }) {
  const selectedColour = item.colours?.[0]
    ? item.colourOptions?.find((c) => c.id === item.colours?.[0])
    : undefined;

  return (
    <div className={`rounded-2xl border border-black/10 p-4 ${item.removalRequested ? "opacity-50" : ""}`}>
      <h4
        className={`font-figtree text-[15px] font-bold text-brand-950 ${item.removalRequested ? "line-through" : ""}`}
      >
        {item.label}
        {item.isNew && (
          <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 align-middle text-[10px] font-semibold text-amber-700">
            New
          </span>
        )}
      </h4>
      <div className="mt-3 grid grid-cols-3 gap-4">
        {item.category && <Stat label="Item Type" value={item.category} />}
        {item.typeLabel && item.type && <Stat label={item.typeLabel} value={item.type} />}
        <Stat label="Quantity" value={String(item.qty)} />
      </div>
      {selectedColour && (
        <div className="mt-3">
          <div className="font-figtree text-[12px] text-neutral-tertiary">Color</div>
          <div className="mt-1 flex items-center gap-1.5 font-figtree text-[14px] font-medium text-brand-950">
            <span
              className="h-3.5 w-3.5 rounded-full border border-black/10"
              style={{ backgroundColor: selectedColour.swatch }}
            />
            {selectedColour.label}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SetupDetailPanel({
  setup,
  items,
  pendingCount,
  onCustomize,
  onClose,
}: {
  setup: IncludedItemEntry;
  items: IncludedItemLine[];
  pendingCount: number;
  onCustomize: () => void;
  onClose: () => void;
}) {
  const [selectedTheme, setSelectedTheme] = useState(setup.themeOptions?.[0]);

  const palette = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      for (const id of item.colours ?? []) {
        const colour = item.colourOptions?.find((c) => c.id === id);
        if (colour) seen.set(colour.id, colour.label);
      }
    }
    return [...seen.values()];
  }, [items]);

  const stats = [...setup.details, { label: "Items", value: String(items.length) }];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
        <div>
          <div className="font-figtree text-[12px] text-neutral-tertiary">Setup Name</div>
          <h2 className="mt-0.5 font-figtree text-[22px] font-bold text-brand-950">{setup.title}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 text-neutral-tertiary hover:text-brand-950">
          <XCircle className="h-7 w-7" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h3 className="font-figtree text-[16px] font-bold text-brand-950">Setup Details</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Stat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>

        {setup.themeOptions && setup.themeOptions.length > 0 && (
          <div className="mt-6">
            <div className="font-figtree text-[12px] text-neutral-tertiary">Setup Theme</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {setup.themeOptions.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className={`rounded-full border px-4 py-2 font-figtree text-[13px] transition ${
                    selectedTheme === theme
                      ? "border-2 border-brand-950 font-semibold text-brand-950"
                      : "border-black/15 text-neutral-secondary hover:border-black/30"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
            {palette.length > 0 && (
              <p className="mt-2 font-figtree text-[12px] text-neutral-tertiary">Palette: {palette.join(" · ")}</p>
            )}
          </div>
        )}

        <div className="my-6 border-t border-dashed border-black/15" />

        <div className="flex items-center justify-between gap-3">
          <h3 className="font-figtree text-[16px] font-bold text-brand-950">Items Details</h3>
          <button
            type="button"
            onClick={onCustomize}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/15 px-4 py-2 font-figtree text-[13px] font-semibold text-brand-950 transition hover:border-black/30"
          >
            <PlusCircle className="h-4 w-4" /> Customize items
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <ItemDetailCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-black/10 px-6 py-4">
        <p className="font-figtree text-[12px] text-neutral-secondary">
          Requests don&apos;t change your price — the vendor confirms them after booking.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full bg-brand-primary px-6 py-2.5 font-figtree text-[13px] font-semibold text-white transition hover:bg-rose-600"
        >
          Save setup
        </button>
      </div>
    </div>
  );
}
