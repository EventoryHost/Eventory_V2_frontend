"use client";

import { useMemo, useState } from "react";
import { PlusCircle, XCircle } from "lucide-react";
import type { CustomizeRequest, IncludedItemEntry, IncludedItemLine } from "../types";
import { formatPrice } from "../utils/formatPrice";
import YourRequestsPanel from "./YourRequestsPanel";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-figtree text-[12px] text-neutral-tertiary">{label}</div>
      <div className="mt-0.5 font-figtree text-[15px] font-semibold text-brand-950">{value}</div>
    </div>
  );
}

// Item Details always shows the setup's ORIGINAL configuration — edits made
// in "Customize items" show up only in the "Your requests" list below, never
// here. So every attribute here reads the original* value, not the
// live-edited one (workshop.itemsBySetup keeps both on the same object).
function ItemDetailCard({ item }: { item: IncludedItemLine }) {
  const displayType = item.originalType ?? item.type;
  const displayVolume = item.originalVolume ?? item.volume;
  const displayColours = item.originalColours ?? item.colours;

  return (
    <div className={`rounded-2xl border border-black/10 p-4 ${item.removalRequested ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-4">
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
        {item.price != null && (
          <span className="shrink-0 font-figtree text-[15px] font-bold text-brand-950">{formatPrice(item.price)}</span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-4">
        {item.category && <Stat label="Item Type" value={item.category} />}
        {item.typeLabel && displayType && <Stat label={item.typeLabel} value={displayType} />}
        {displayVolume ? <Stat label="Volume" value={displayVolume} /> : <Stat label="Quantity" value={String(item.originalQty)} />}
      </div>
      {item.colourOptions && item.colourOptions.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 font-figtree text-[12px] text-neutral-tertiary">Color</div>
          <div className="flex flex-wrap gap-2">
            {item.colourOptions.map((colour) => {
              const selected = displayColours?.includes(colour.id);
              return (
                <span
                  key={colour.id}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-figtree text-[13px] font-medium ${
                    selected ? "border-[1.5px] border-[#B4112A] text-brand-950" : "border-black/15 text-neutral-secondary"
                  }`}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: colour.swatch }}
                  />
                  {colour.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SetupDetailPanel({
  setup,
  items,
  requests,
  onDismissRequest,
  onCustomize,
  onCloseAttempt,
  onSave,
}: {
  setup: IncludedItemEntry;
  items: IncludedItemLine[];
  requests: CustomizeRequest[];
  onDismissRequest: (request: CustomizeRequest) => void;
  onCustomize: () => void;
  /** The cross — routes through the leave-guard when there are pending requests. */
  onCloseAttempt: () => void;
  /** "Save setup" — the changes are already live-committed, so this just closes. */
  onSave: () => void;
}) {
  const [selectedTheme, setSelectedTheme] = useState(setup.themeOptions?.[0]);

  // Same rule as ItemDetailCard — this summarises the setup's original
  // colours, not whatever the customer has since picked in Customize items.
  const palette = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      for (const id of item.originalColours ?? item.colours ?? []) {
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
        <button type="button" onClick={onCloseAttempt} aria-label="Close" className="shrink-0 text-neutral-tertiary hover:text-brand-950">
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
                      ? "border-[1.5px] border-[#B4112A] font-semibold text-brand-950"
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
            {requests.length > 0 && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <ItemDetailCard key={item.id} item={item} />
          ))}
        </div>

        <YourRequestsPanel requests={requests} onDismiss={onDismissRequest} />
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-black/10 px-6 py-4">
        <button
          type="button"
          onClick={onSave}
          className="shrink-0 rounded-full bg-brand-primary px-6 py-2.5 font-figtree text-[13px] font-semibold text-white transition hover:bg-rose-600"
        >
          Save setup
        </button>
      </div>
    </div>
  );
}
