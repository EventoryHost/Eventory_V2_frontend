import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartAddon } from "../types";
import { formatPrice } from "../utils/currency";

export default function AddedAddonRow({
  addon,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  addon: CartAddon;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-subtle">
          {addon.image && <Image src={addon.image} alt={addon.title} fill sizes="64px" className="object-cover" />}
        </div>
        <div>
          <h5 className="font-figtree text-[15px] font-semibold text-neutral-primary">
            {addon.title}{" "}
            <span className="font-figtree text-[13px] font-normal text-neutral-tertiary">
              ×{addon.quantity}
            </span>
          </h5>
          <p className="mb-2 font-figtree text-[12px] text-neutral-tertiary">{addon.category}</p>
          {addon.variant && (
            <span className="inline-block rounded-full border border-neutral-subtle bg-[#F9F9F9] px-3 py-1 font-figtree text-[11px] text-neutral-secondary">
              {addon.variant}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <p className="font-figtree text-[16px] font-bold text-neutral-primary">
          {formatPrice(addon.price * addon.quantity)}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-lg border border-neutral-subtle bg-white">
            <button
              type="button"
              onClick={() => onDecrement(addon.id)}
              aria-label={`Decrease ${addon.title} quantity`}
              className="flex h-8 w-8 items-center justify-center text-neutral-secondary transition-colors hover:bg-[#F9F9F9] hover:text-brand-primary"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center font-figtree text-[13px] font-semibold text-neutral-primary">
              {addon.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(addon.id)}
              aria-label={`Increase ${addon.title} quantity`}
              className="flex h-8 w-8 items-center justify-center text-neutral-secondary transition-colors hover:bg-[#F9F9F9] hover:text-brand-primary"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onRemove(addon.id)}
            aria-label={`Remove ${addon.title} add-on`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-tertiary transition-colors hover:bg-error-subtle hover:text-error-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
