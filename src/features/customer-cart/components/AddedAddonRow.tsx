import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartAddon } from "../types";
import { formatPrice } from "../utils/currency";
import QuantityInput from "@/features/customer-package-detail/components/QuantityInput";

// A customer isn't going to want 1000 of a single add-on — same cap as
// PDP's own Added Add-ons row (AddedAddonsSummary.tsx), which this mirrors.
const MAX_ADDON_QUANTITY = 99;

export default function AddedAddonRow({
  addon,
  onIncrement,
  onDecrement,
  onSetQuantity,
  onRemove,
}: {
  addon: CartAddon;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSetQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-neutral-subtle">
        {addon.image && <Image src={addon.image} alt={addon.title} fill sizes="84px" className="object-cover" />}
      </div>

      <div className="min-w-0 flex-1">
        <h5 className="truncate font-figtree text-[14px] leading-[20px] font-semibold text-[#030303]">
          {addon.title} ×{addon.quantity}
        </h5>
        {(addon.category || addon.subCategory) && (
          <p className="mt-1 truncate font-figtree text-[12px] leading-[20px] text-[#71717B]">
            {[addon.category, addon.subCategory].filter(Boolean).join(" · ")}
          </p>
        )}
        {addon.color && (
          <span className="mt-2 inline-flex items-center rounded-full border border-black/10 bg-white px-2.5 py-1 font-figtree text-[12px] leading-[18px] font-semibold text-[#030303]">
            Color: {addon.color}
          </span>
        )}
      </div>

      {/* Price + quantity controls stacked in one right-aligned column — same layout as PDP's Added Add-ons row. */}
      <div className="flex shrink-0 flex-col items-end gap-3">
        <p className="font-figtree text-[16px] leading-[20px] font-semibold text-[#030303]">
          {formatPrice(addon.price * addon.quantity)}
        </p>

        <div className="flex h-[26px] w-[130px] items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onDecrement(addon.id)}
            aria-label={`Decrease ${addon.title} quantity`}
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
            aria-label={`Increase ${addon.title} quantity`}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-black/15 text-brand-950 transition hover:bg-black/5"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <span className="h-[18px] w-px bg-black/10" />
          <button
            type="button"
            onClick={() => onRemove(addon.id)}
            aria-label={`Remove ${addon.title} add-on`}
            className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-neutral-tertiary transition hover:bg-black/5 hover:text-error-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
