import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import type { AddonItem } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";

export default function AddonCard({
  addon,
  isSelected,
  onToggle,
  seed = 0,
}: {
  addon: AddonItem;
  isSelected: boolean;
  onToggle: (id: string) => void;
  seed?: number;
}) {
  const priceUnit = addon.unitLabel.replace(/^\//, "") || "flat";

  return (
    <div className="overflow-hidden rounded-xl border border-black/10">
      <div className="relative h-36 w-full">
        {addon.image ? (
          <Image src={addon.image} alt={addon.title} fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
        ) : (
          <PlaceholderMedia seed={seed} className="absolute inset-0" />
        )}
        <span className="absolute top-2 left-2 rounded bg-white/90 px-2 py-0.5 font-figtree text-[10px] font-bold tracking-wider text-brand-950 uppercase">
          {addon.category}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-figtree text-[14px] font-bold text-brand-950">{addon.title}</h4>
          <div className="shrink-0 text-right">
            <div className="font-figtree text-[15px] font-bold text-brand-950">{formatPrice(addon.price)}</div>
            <div className="font-figtree text-[11px] text-neutral-tertiary">{priceUnit}</div>
          </div>
        </div>

        {addon.description && (
          <p className="mt-1 font-figtree text-[12px] text-neutral-secondary">{addon.description}</p>
        )}
        {addon.subCategory && addon.subCategory !== addon.description && (
          <p className="mt-1 font-figtree text-[11px] text-neutral-tertiary">{addon.subCategory}</p>
        )}

        {addon.warning && (
          <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 font-figtree text-[11px] text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {addon.warning}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="font-figtree text-[12px] text-neutral-tertiary">{isSelected ? "Added" : "Not added"}</span>
          <button
            type="button"
            onClick={() => onToggle(addon.id)}
            aria-pressed={isSelected}
            className={`rounded-lg px-4 py-1.5 font-figtree text-[13px] font-semibold text-white transition ${
              isSelected ? "bg-success-700 hover:bg-success-700/90" : "bg-brand-primary hover:bg-rose-600"
            }`}
          >
            {isSelected ? "Remove" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
