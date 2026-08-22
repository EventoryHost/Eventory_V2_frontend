import Image from "next/image";
import { AlertTriangle, Check, Plus } from "lucide-react";
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
    <div className="overflow-hidden rounded-2xl border border-black/10">
      <div className="relative aspect-square w-full">
        {addon.image ? (
          <Image src={addon.image} alt={addon.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
        ) : (
          <PlaceholderMedia seed={seed} className="absolute inset-0" />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 font-figtree text-[10px] font-bold tracking-wide text-brand-primary uppercase shadow-sm">
          {addon.category}
        </span>
        <button
          type="button"
          onClick={() => onToggle(addon.id)}
          aria-pressed={isSelected}
          aria-label={isSelected ? `Remove ${addon.title}` : `Add ${addon.title}`}
          className={`absolute -bottom-4 right-3 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition ${
            isSelected ? "bg-success-700 hover:bg-success-700/90" : "bg-brand-primary hover:bg-rose-600"
          }`}
        >
          {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="p-4 pt-6">
        <h4 className="truncate font-figtree text-[15px] font-bold text-brand-950">{addon.title}</h4>
        <p className="mt-0.5 truncate font-figtree text-[13px] text-neutral-secondary">
          {addon.category} · {addon.qtyLabel || "Qty"}
        </p>

        {addon.warning && (
          <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 font-figtree text-[11px] text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {addon.warning}
          </div>
        )}

        <div className="mt-3 border-t border-dashed border-black/15 pt-3">
          <span className="font-figtree text-[16px] font-bold text-brand-950">{formatPrice(addon.price)}</span>
          <span className="font-figtree text-[12px] text-neutral-tertiary">/{priceUnit}</span>
        </div>
      </div>
    </div>
  );
}
