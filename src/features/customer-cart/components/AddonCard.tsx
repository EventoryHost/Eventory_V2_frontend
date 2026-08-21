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
    <div className="group w-[200px] shrink-0 overflow-hidden rounded-xl border border-neutral-subtle bg-white transition-shadow hover:shadow-md">
      <div className="relative h-[120px] w-full bg-neutral-subtle">
        {addon.image && <Image src={addon.image} alt={addon.title} fill sizes="200px" className="object-cover" />}
        <span className="absolute top-2 left-2 rounded bg-white/90 px-2 py-0.5 font-figtree text-[10px] font-bold text-brand-primary uppercase shadow-sm backdrop-blur">
          {addon.category}
        </span>
        <button
          type="button"
          onClick={() => onAdd(addon)}
          aria-label={`Add ${addon.title} add-on`}
          className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white shadow-md transition-transform group-hover:scale-110"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3">
        <h4 className="truncate font-figtree text-[14px] font-semibold text-neutral-primary">
          {addon.title}
        </h4>
        <p className="mb-2 font-figtree text-[12px] text-neutral-tertiary">{addon.category}</p>
        <div className="border-t border-dashed border-neutral-subtle pt-2">
          <p className="font-figtree text-[14px] font-bold text-neutral-primary">
            {formatPrice(addon.price)}{" "}
            <span className="font-figtree text-[10px] font-normal text-neutral-tertiary">
              {addon.unitLabel}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
