"use client";

import { useState } from "react";
import { ChevronUp, Minus, Plus, Trash2 } from "lucide-react";
import type { SelectedAddon } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";
import QuantityInput from "./QuantityInput";
import IncludedItemImageModal from "./IncludedItemImageModal";

// A customer isn't going to want 1000 of a single add-on — this caps the
// typed value the same way a real form field would, distinct from min=0
// which lets typing down to 0 behave like the trash icon (filtered out of
// this list once quantity hits 0, same as the decrement button already does).
const MAX_ADDON_QUANTITY = 99;

export default function AddedAddonsSummary({
  addons,
  onIncrement,
  onDecrement,
  onSetQuantity,
  onRemove,
}: {
  addons: SelectedAddon[];
  onIncrement: (lineKey: string) => void;
  onDecrement: (lineKey: string) => void;
  onSetQuantity: (lineKey: string, qty: number) => void;
  onRemove: (lineKey: string) => void;
}) {
  const [zoomedAddon, setZoomedAddon] = useState<SelectedAddon | null>(null);
  // Mobile: the list can be collapsed under its header.
  const [isOpen, setIsOpen] = useState(true);

  if (addons.length === 0) return null;

  return (
    <>
    <div className="mt-6 hidden flex-col gap-4 rounded-2xl bg-[#FAFAFA] px-5 pt-4 pb-2 md:flex">
      {/* Figma node 3233:26483 */}
      <h3 className="font-figtree text-[14px] leading-5 font-medium text-[#030303]">
        Added Add-ons <span className="ml-1">({addons.length})</span>
      </h3>

      <div className="flex flex-col divide-y divide-[#E4E4E7]">
        {addons.map((addon, i) => {
          return (
            <div key={addon.lineKey} className="flex items-start gap-4 py-4 first:pt-0">
              <button
                type="button"
                onClick={() => addon.image && setZoomedAddon(addon)}
                disabled={!addon.image}
                aria-label={addon.image ? `View larger image of ${addon.title}` : undefined}
                className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-lg disabled:cursor-default"
              >
                {addon.image ? (
                  <img src={addon.image} alt={addon.title} className="block h-full w-full object-cover" />
                ) : (
                  <PlaceholderMedia seed={i} className="absolute inset-0" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <h4 className="truncate font-figtree text-[16px] leading-6 font-medium text-[#030303]">
                  {addon.title} <span className="text-[14px] text-[#3F3F47]">×{addon.quantity}</span>
                </h4>
                <p className="truncate font-figtree text-[14px] leading-5 text-[#71717B]">
                  {addon.category}
                  {addon.subCategory ? ` · ${addon.subCategory}` : ""}
                </p>
                {addon.color && (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#F4F4F5] py-1 pr-2.5 pl-2 font-figtree text-[13px] leading-[18px] font-medium text-[#3F3F47]">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: addon.colourOptions?.find((option) => option.label === addon.color)?.swatch ?? "#9F9FA9" }}
                    />
                    {addon.color}
                  </span>
                )}
              </div>

              {/* Price + quantity controls stacked in one right-aligned column, controls sized to spec (130x26). */}
              <div className="flex shrink-0 flex-col items-end gap-4 self-stretch justify-between">
                <span className="font-figtree text-[20px] leading-6 font-semibold text-[#030303]">
                  {formatPrice(addon.price * addon.quantity)}
                </span>

                <div className="flex h-[26px] w-[130px] items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onDecrement(addon.lineKey)}
                    aria-label={`Remove one ${addon.title}`}
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-black/15 text-brand-950 transition hover:bg-black/5"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <QuantityInput
                    value={addon.quantity}
                    onChange={(qty) => onSetQuantity(addon.lineKey, qty)}
                    min={1}
                    max={MAX_ADDON_QUANTITY}
                    aria-label={`Quantity for ${addon.title}`}
                    className="w-9 rounded-md border border-transparent text-center font-figtree text-[14px] font-medium text-brand-950 hover:border-black/15 focus:border-black/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onIncrement(addon.lineKey)}
                    aria-label={`Add one more ${addon.title}`}
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-black/15 text-brand-950 transition hover:bg-black/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <span className="h-[18px] w-px bg-black/10" />
                  <button
                    type="button"
                    onClick={() => onRemove(addon.lineKey)}
                    aria-label={`Remove ${addon.title}`}
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-neutral-tertiary transition hover:bg-black/5 hover:text-error-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>

    {/* Mobile (Figma node 3642:97211): a collapsible grey card — header with a
          chevron, then each line as image | name ×qty + price | colour chip + − qty +.
          Decrementing the last unit removes the line, so there is no separate bin here. */}
      <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-[#FAFAFA] px-3 pt-3 pb-4 md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="font-figtree text-[14px] leading-5 font-semibold text-[#111827]">
            Added Add-ons <span className="ml-1">({addons.length})</span>
          </span>
          <ChevronUp className={`h-5 w-5 text-[#71717B] transition-transform ${isOpen ? "" : "rotate-180"}`} />
        </button>

        {isOpen && (
          <div className="flex flex-col gap-4">
            {addons.map((addon, i) => (
              <div
                key={addon.lineKey}
                className={`flex items-start gap-3 ${i > 0 ? "border-t border-[#E4E4E7] pt-4" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => addon.image && setZoomedAddon(addon)}
                  disabled={!addon.image}
                  aria-label={addon.image ? `View larger image of ${addon.title}` : undefined}
                  className="relative h-[82px] w-[82px] shrink-0 overflow-hidden rounded-xl disabled:cursor-default"
                >
                  {addon.image ? (
                    <img src={addon.image} alt={addon.title} className="block h-full w-full object-cover" />
                  ) : (
                    <PlaceholderMedia seed={i} className="absolute inset-0" />
                  )}
                </button>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-figtree text-[14px] leading-5 font-semibold text-[#030303]">
                        {addon.title} <span className="text-[#3F3F47]">×{addon.quantity}</span>
                      </p>
                      <p className="truncate font-figtree text-[12px] leading-5 text-[#71717B]">
                        {addon.category}
                        {addon.subCategory ? ` · ${addon.subCategory}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 font-figtree text-[16px] leading-5 font-semibold text-[#030303]">
                      {formatPrice(addon.price * addon.quantity)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {addon.color ? (
                      <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-[#F4F4F5] py-1 pr-2 pl-1.5 font-figtree text-[12px] leading-4 font-medium text-[#030303]">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                          style={{ backgroundColor: addon.colourOptions?.find((option) => option.label === addon.color)?.swatch ?? "#9F9FA9" }}
                        />
                        <span className="truncate">{addon.color}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onDecrement(addon.lineKey)}
                        aria-label={`Remove one ${addon.title}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E4E4E7] bg-white text-[#030303]"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-3 text-center font-figtree text-[14px] leading-4 font-semibold text-[#030303]">
                        {addon.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrement(addon.lineKey)}
                        aria-label={`Add one more ${addon.title}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E4E4E7] bg-white text-[#030303]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    <IncludedItemImageModal
      isOpen={zoomedAddon !== null}
      onClose={() => setZoomedAddon(null)}
      image={zoomedAddon?.image ?? null}
      alt={zoomedAddon?.title ?? ""}
    />
    </>
  );
}
