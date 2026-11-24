"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartAddon } from "../types";
import { formatPrice } from "../utils/currency";
import QuantityInput from "@/features/customer-package-detail/components/QuantityInput";
import IncludedItemImageModal from "@/features/customer-package-detail/components/IncludedItemImageModal";

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
  const [isZoomed, setIsZoomed] = useState(false);

  const subLine = [addon.category, addon.subCategory].filter(Boolean).join(" · ");

  return (
    <>
      {/* Mobile (Figma 3831:62783): photo | name ×qty + price, sub-line, colour + stepper. */}
      <div className="flex items-start gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          aria-label={`View larger image of ${addon.title}`}
          disabled={!addon.image}
          className="relative h-[82px] w-[82px] shrink-0 overflow-hidden rounded-xl bg-neutral-subtle disabled:cursor-default"
        >
          {addon.image && <Image src={addon.image} alt={addon.title} fill sizes="82px" className="object-cover" />}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div>
            <div className="flex items-start justify-between gap-2 font-figtree font-semibold text-[#030303]">
              <p className="min-w-0 text-[14px] leading-5">
                {addon.title} <span className="text-[#3F3F47]">×{addon.quantity}</span>
              </p>
              <p className="shrink-0 text-[16px] leading-5">{formatPrice(addon.price * addon.quantity)}</p>
            </div>
            {subLine && <p className="truncate font-figtree text-[12px] leading-5 text-[#71717B]">{subLine}</p>}
          </div>
          <div className="flex items-center justify-between gap-2">
            {addon.color ? (
              <span className="flex min-w-0 items-center gap-1.5 rounded-md bg-[#F4F4F5] py-1 pr-2 pl-1.5 font-figtree text-[12px] leading-4 font-medium text-[#030303]">
                <span className="h-3 w-3 shrink-0 rounded-full border border-black/10" style={{ background: addon.color }} aria-hidden="true" />
                <span className="truncate">{addon.color}</span>
              </span>
            ) : (
              <span />
            )}
            <div className="flex shrink-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => onDecrement(addon.id)}
                aria-label={`Decrease ${addon.title} quantity`}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E4E4E7] bg-white text-brand-950"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-3 text-center font-figtree text-[14px] leading-4 font-semibold text-[#030303]">
                {addon.quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrement(addon.id)}
                aria-label={`Increase ${addon.title} quantity`}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[#E4E4E7] bg-white text-brand-950"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(addon.id)}
                aria-label={`Remove ${addon.title} add-on`}
                className="flex h-6 w-6 items-center justify-center text-neutral-tertiary"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

    <div className="hidden items-center gap-3 md:flex">
      <button
        type="button"
        onClick={() => setIsZoomed(true)}
        aria-label={`View larger image of ${addon.title}`}
        disabled={!addon.image}
        className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-neutral-subtle disabled:cursor-default"
      >
        {addon.image && <Image src={addon.image} alt={addon.title} fill sizes="84px" className="object-cover" />}
      </button>


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

      {addon.image && (
        <IncludedItemImageModal
          isOpen={isZoomed}
          onClose={() => setIsZoomed(false)}
          image={addon.image}
          alt={addon.title}
        />
      )}
    </>
  );
}
