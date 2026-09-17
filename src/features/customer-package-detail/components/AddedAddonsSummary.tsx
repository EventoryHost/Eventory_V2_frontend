import { Minus, Plus, Trash2 } from "lucide-react";
import type { SelectedAddon } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";
import QuantityInput from "./QuantityInput";

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
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSetQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  if (addons.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-5 rounded-2xl border-t border-black/10 bg-[#FAFAFA] px-5 pt-3 pb-5">
      <h3 className="font-figtree text-[12px] leading-[16px] font-semibold text-[#111827]">
        Added Add-ons ({addons.length})
      </h3>

      <div className="flex flex-col divide-y divide-black/5">
        {addons.map((addon, i) => {
          return (
            <div key={addon.id} className="flex items-center gap-3 py-4 first:pt-0">
              <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl">
                {addon.image ? (
                  <img src={addon.image} alt={addon.title} className="block h-full w-full object-cover" />
                ) : (
                  <PlaceholderMedia seed={i} className="absolute inset-0" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="truncate font-figtree text-[14px] leading-[20px] font-semibold text-[#030303]">
                  {addon.title} ×{addon.quantity}
                </h4>
                <p className="mt-1 truncate font-figtree text-[12px] leading-[20px] text-[#71717B]">
                  {addon.category}
                  {addon.subCategory ? ` · ${addon.subCategory}` : ""}
                </p>
                {addon.color && (
                  <span className="mt-2 inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1 font-figtree text-[12px] leading-[18px] font-semibold text-[#030303]">
                    Color: {addon.color}
                  </span>
                )}
              </div>

              {/* Price + quantity controls stacked in one right-aligned column, controls sized to spec (130x26). */}
              <div className="flex shrink-0 flex-col items-end gap-3">
                <span className="font-figtree text-[16px] leading-[20px] font-semibold text-[#030303]">
                  {formatPrice(addon.price * addon.quantity)}
                </span>

                <div className="flex h-[26px] w-[130px] items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onDecrement(addon.id)}
                    aria-label={`Remove one ${addon.title}`}
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-black/15 text-brand-950 transition hover:bg-black/5"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <QuantityInput
                    value={addon.quantity}
                    onChange={(qty) => onSetQuantity(addon.id, qty)}
                    min={1}
                    max={MAX_ADDON_QUANTITY}
                    aria-label={`Quantity for ${addon.title}`}
                    className="w-9 rounded-md border border-transparent text-center font-figtree text-[14px] font-medium text-brand-950 hover:border-black/15 focus:border-black/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onIncrement(addon.id)}
                    aria-label={`Add one more ${addon.title}`}
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-black/15 text-brand-950 transition hover:bg-black/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <span className="h-[18px] w-px bg-black/10" />
                  <button
                    type="button"
                    onClick={() => onRemove(addon.id)}
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
  );
}
