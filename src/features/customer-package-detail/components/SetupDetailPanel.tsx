"use client";

import { useMemo, useState } from "react";
import { PlusCircle, XCircle } from "lucide-react";
import type { CustomizeRequest, IncludedItemEntry, IncludedItemLine } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { useScrollingFlag } from "../hooks/useScrollingFlag";
import YourRequestsPanel from "./YourRequestsPanel";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-figtree text-[12px] leading-[18px] text-[#71717B]">{label}</div>
      <div className="font-figtree text-[16px] leading-6 font-medium text-[#030303]">{value}</div>
    </div>
  );
}

// Item Details shows the setup's ORIGINAL configuration for type/volume —
// edits made in "Customize items" show up only in the "Your requests" list
// below, never here. Colour is the one deliberate exception (design change
// 2026-09-30): picking among the vendor's own colours is free, done right
// here, and never a request — so it reads the LIVE `colours` value, not the
// frozen original.
function ItemDetailCard({
  item,
  onSelectColour,
}: {
  item: IncludedItemLine;
  onSelectColour: (colourId: string) => void;
}) {
  const displayType = item.originalType ?? item.type;
  // Volume (Low/Medium/High density) only makes sense for Flowers — real
  // bug fixed 2026-10-04 (PM-reported: "volume field only for flowers").
  const displayVolume = item.category === "Flowers" ? (item.originalVolume ?? item.volume) : undefined;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-[#E4E4E7] bg-white px-3 pt-3 pb-4 ${item.removalRequested ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h4
          className={`font-figtree text-[16px] leading-6 font-medium text-[#030303] ${item.removalRequested ? "line-through" : ""}`}
        >
          {item.label}
        </h4>
        {item.price != null && (
          <span className="shrink-0 font-figtree text-[16px] leading-6 font-semibold text-[#030303]">{formatPrice(item.price)}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-10 gap-y-3 md:gap-x-[120px]">
        {item.category && <Stat label="Item Type" value={item.category} />}
        {item.typeLabel && displayType && <Stat label={item.typeLabel} value={displayType} />}
        {/* Volume (Low/Medium/High density — e.g. flowers) replaces the
            concept of a countable quantity for that item, so Quantity is
            hidden whenever Volume is set (2026-10-01, product-confirmed) —
            shown otherwise, with its unit ("50 Feet") when the vendor set one. */}
        {displayVolume ? (
          <Stat label="Volume" value={displayVolume} />
        ) : (
          <Stat label="Quantity" value={item.unit ? `${item.originalQty} ${item.unit}` : String(item.originalQty)} />
        )}
        {item.dimensions && <Stat label="Dimensions" value={item.dimensions} />}
        {item.length != null && (
          <Stat label="Length" value={item.unit ? `${item.length} ${item.unit}` : String(item.length)} />
        )}
      </div>
      {item.itemDescription && (
        <p className="font-figtree text-[14px] leading-5 text-[#3F3F47]">{item.itemDescription}</p>
      )}
      {/* Colours (Figma 3641:83338): each is a bordered card with a round swatch
          and the name. One option is just shown as the chosen colour; several
          are a radio group — picking among the vendor's own colours is free
          and never a request. */}
      {item.colourOptions && item.colourOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="font-figtree text-[12px] leading-[18px] text-[#71717B]">Color</div>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Color">
            {item.colourOptions.map((colour) => {
              const single = item.colourOptions!.length === 1;
              const selected = single || item.colours?.includes(colour.id);
              return (
                <button
                  key={colour.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={item.removalRequested || single}
                  onClick={() => onSelectColour(colour.id)}
                  className={`flex items-center gap-1 rounded-xl bg-white px-2 py-1.5 font-figtree text-[14px] leading-[17px] text-[#030303] transition disabled:cursor-default ${
                    selected
                      ? "border-[1.5px] border-[#B91D34]"
                      : "border border-[#D5DAE2] hover:border-[#A1A1AA] disabled:opacity-50"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                    <span
                      className="h-[22px] w-[22px] rounded-full ring-2 ring-white ring-offset-1 ring-offset-black/10"
                      style={{ backgroundColor: colour.swatch }}
                    />
                  </span>
                  {colour.label}
                </button>
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
  onSelectVendorColour,
  onCustomize,
  onCloseAttempt,
  onSave,
}: {
  setup: IncludedItemEntry;
  items: IncludedItemLine[];
  requests: CustomizeRequest[];
  onDismissRequest: (request: CustomizeRequest) => void;
  /** Free pick among an item's own vendor-provided colours — never a request. */
  onSelectVendorColour: (itemId: string, colourId: string) => void;
  onCustomize: () => void;
  /** The cross — routes through the leave-guard when there are pending requests. */
  onCloseAttempt: () => void;
  /** "Save setup" — the changes are already live-committed, so this just closes. */
  onSave: () => void;
}) {
  const scrollFlag = useScrollingFlag();
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

  // Theme is shown as the chip picker below, so it is left out of the facts grid.
  const stats = [...setup.details.filter((detail) => !/^themes?$/i.test(detail.label)), { label: "Items", value: String(items.length) }];

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

      <div {...scrollFlag} className="thin-scroll flex-1 overflow-y-auto px-6 py-6">
        <h3 className="font-figtree text-[16px] leading-6 text-[#3F3F47]">Setup Details</h3>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 md:gap-x-[100px]">
          {stats.map((stat) => (
            <Stat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>


        {/* Setup Theme (Figma 3641:83323): outlined chips, the picked one in the brand colour. */}
        {setup.themeOptions && setup.themeOptions.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            <p className="font-figtree text-[14px] leading-5 text-[#71717B]">Setup Theme</p>
            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Setup theme">
              {setup.themeOptions.map((theme) => {
                const selected = selectedTheme === theme;
                return (
                  <button
                    key={theme}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedTheme(theme)}
                    className={`flex min-h-8 items-center justify-center rounded-full px-4 py-1.5 font-figtree text-[14px] leading-5 whitespace-nowrap transition-colors ${
                      selected
                        ? "border-[1.5px] border-[#B91D34] text-[#030303]"
                        : "border border-[#71717B] text-[#71717B] hover:border-[#030303] hover:text-[#030303]"
                    }`}
                  >
                    {theme}
                  </button>
                );
              })}
            </div>
            {palette.length > 0 && (
              <p className="font-figtree text-[12px] leading-[18px] text-[#71717B]">Palette: {palette.join(" · ")}</p>
            )}
          </div>
        )}

        <div className="my-6 border-t border-dashed border-black/15" />

        <div className="flex items-center justify-between gap-3">
          <h3 className="font-figtree text-[16px] leading-6 text-[#3F3F47]">Items Details</h3>
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
          {/* Items added via "Add an item" in the customize modal are NOT
              part of the vendor's real setup — showing them here (even with
              a "New" badge) duplicated them against their own entry in
              "Your requests" below. Real bug fixed 2026-10-04 (PM-reported:
              "do not show it in item details, just have it as a request at
              the bottom"). */}
          {items
            .filter((item) => !item.isNew)
            .map((item) => (
              <ItemDetailCard
                key={item.id}
                item={item}
                onSelectColour={(colourId) => onSelectVendorColour(item.id, colourId)}
              />
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
