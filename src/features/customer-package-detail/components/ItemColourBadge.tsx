import { ALL_EXTENDED_COLOURS } from "../data/extendedColorPalette";
import type { IncludedItemLine } from "../types";

function resolveCustomColour(id: string) {
  return ALL_EXTENDED_COLOURS.find((c) => c.id === id);
}

/**
 * Figma nodes 3233:25979 (single colour — "Chosen" chip: swatch dot + the
 * colour's name) and 3233:26143 (2+ colours — overlapping swatches + "N
 * colours", no names). Shown next to an item's label in the What's
 * Included checklist (IncludedItems.tsx).
 *
 * `customColours` (picked via the Customize items modal, extended palette)
 * takes priority over `colours` (the vendor's own single-select palette,
 * freely changeable in the item-details view, SetupDetailPanel.tsx) — if
 * the customer has explicitly customized the colour, that's what's shown.
 */
export default function ItemColourBadge({ item }: { item: IncludedItemLine }) {
  const custom = item.customColours ?? [];

  if (custom.length >= 2) {
    const swatches = custom.map(resolveCustomColour).filter((c): c is NonNullable<typeof c> => Boolean(c));
    if (swatches.length === 0) return null;
    // Figma node 3233:26143 always draws 3 overlapping swatches regardless
    // of how many colours were actually picked — PM request 2026-11-02:
    // "always show 3 colors, if more than one present". With exactly 2
    // real swatches, the 3rd cycles back to the first rather than leaving
    // a visibly thinner stack.
    const display = Array.from({ length: 3 }, (_, i) => swatches[i % swatches.length]);
    return (
      <span className="flex shrink-0 items-center gap-1.5">
        <span className="flex items-center">
          {display.map((colour, i) => (
            <span
              key={`${colour.id}-${i}`}
              className="h-3 w-3 shrink-0 rounded-full border border-white"
              style={{ backgroundColor: colour.swatch, marginLeft: i === 0 ? 0 : -4 }}
            />
          ))}
        </span>
        <span className="font-figtree text-[12px] leading-4 whitespace-nowrap text-[#71717B]">
          {custom.length} colour{custom.length === 1 ? "" : "s"}
        </span>
      </span>
    );
  }

  const singleId = custom[0] ?? (item.colours?.length === 1 ? item.colours[0] : undefined);
  if (!singleId) return null;
  const colour = custom[0] ? resolveCustomColour(singleId) : item.colourOptions?.find((c) => c.id === singleId);
  if (!colour) return null;

  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-[6px] bg-[#F4F4F5] py-0.5 pr-2 pl-1.5">
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colour.swatch }} />
      <span className="font-figtree text-[12px] leading-4 font-medium whitespace-nowrap text-[#030303]">
        {colour.label}
      </span>
    </span>
  );
}
