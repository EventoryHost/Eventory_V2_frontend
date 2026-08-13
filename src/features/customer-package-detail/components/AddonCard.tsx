import Image from "next/image";
import { Plus, Check } from "lucide-react";
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
  return (
    <div className="relative w-[200px] shrink-0 snap-start overflow-hidden rounded-xl border border-black/10">
      <div className="relative h-32 w-full">
        {addon.image ? (
          <Image src={addon.image} alt={addon.title} fill sizes="200px" className="object-cover" />
        ) : (
          <PlaceholderMedia seed={seed} className="absolute inset-0" />
        )}
      </div>

      <span className="absolute top-2 left-2 rounded bg-white/90 px-2 py-0.5 font-figtree text-[10px] font-bold tracking-wider text-brand-950 uppercase">
        {addon.category}
      </span>

      <button
        type="button"
        onClick={() => onToggle(addon.id)}
        aria-pressed={isSelected}
        aria-label={isSelected ? `Remove ${addon.title} add-on` : `Add ${addon.title} add-on`}
        className={`absolute right-2 bottom-14 flex h-6 w-6 items-center justify-center rounded-full font-bold text-white shadow-md transition-colors ${
          isSelected ? "bg-success-700" : "bg-brand-primary hover:bg-rose-600"
        }`}
      >
        {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      </button>

      <div className="p-3">
        <h4 className="font-figtree text-[13px] font-bold text-brand-950">{addon.title}</h4>
        <p className="mb-1 font-figtree text-[11px] text-neutral-tertiary">
          {addon.category} · {addon.qtyLabel}
        </p>
        <div className="font-figtree text-[13px] font-bold text-brand-950">
          {formatPrice(addon.price)}
          <span className="font-figtree text-[10px] font-normal text-neutral-tertiary">{addon.unitLabel}</span>
        </div>
      </div>
    </div>
  );
}
