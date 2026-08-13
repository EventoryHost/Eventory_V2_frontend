import Image from "next/image";
import { Plus } from "lucide-react";
import type { RecommendedAddon } from "../types";
import { formatPrice } from "../utils/currency";

export default function AddonCard({
  addon,
  onAdd,
}: {
  addon: RecommendedAddon;
  onAdd: (addon: RecommendedAddon) => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-subtle bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
      <div className="relative h-48 w-full bg-neutral-subtle">
        {addon.image && <Image src={addon.image} alt={addon.title} fill sizes="280px" className="object-cover" />}
        <span className="absolute top-3 left-3 rounded bg-white/90 px-2 py-1 font-figtree text-[11px] font-bold text-brand-primary uppercase shadow-sm backdrop-blur">
          {addon.category}
        </span>
        <button
          type="button"
          onClick={() => onAdd(addon)}
          aria-label={`Add ${addon.title} add-on`}
          className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg transition-transform group-hover:scale-110"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <h4 className="mb-1 font-figtree text-[15px] font-semibold text-neutral-primary">
          {addon.title}
        </h4>
        <p className="mb-3 font-figtree text-[12px] text-neutral-tertiary">{addon.category}</p>
        <div className="border-t border-dashed border-neutral-subtle pt-3">
          <p className="font-figtree text-[15px] font-bold text-neutral-primary">
            {formatPrice(addon.price)}{" "}
            <span className="font-figtree text-[11px] font-normal text-neutral-tertiary">
              {addon.unitLabel}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
