"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

export type AddOnItem = {
  image: string;
  title: string;
  price: string;
};

export type AddOnsSectionProps = {
  addOns: AddOnItem[];
  onRemove?: (index: number) => void;
};

export default function AddOnsSection({ addOns, onRemove }: AddOnsSectionProps) {
  return (
    <div className="flex w-full max-w-[828px] flex-col gap-4 border-t border-[#E5E7EB] pt-5">
      <h3 className="font-figtree text-[16px] font-bold uppercase tracking-wide text-[#101828]">
        Add-ons ({addOns.length})
      </h3>

      <div className="flex flex-col gap-4">
        {addOns.map((addOn, i) => (
          <div
            key={i}
            className="flex w-full max-w-[828px] items-center gap-3 rounded-[12px] border border-[#E5E7EB] p-4"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border border-[#E5E7EB]">
              <Image src={addOn.image} alt={addOn.title} fill className="object-cover" />
            </div>

            <p className="flex-1 font-figtree text-[16px] font-normal text-[#374151]">
              {addOn.title}
            </p>

            <p className="font-figtree text-[16px] font-bold text-[#101828]">
              {addOn.price}
            </p>

            <button
              type="button"
              aria-label="Remove add-on"
              onClick={() => onRemove?.(i)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]"
            >
              <Trash2 size={16} className="text-[#EA1D3B]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
