import Image from "next/image";
import { Plus, Check } from "lucide-react";
import type { CartAddon } from "../types";
import { formatPrice } from "../utils/currency";

export default function AddonCard({
  addon,
  onToggle,
}: {
  addon: CartAddon;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex w-[200px] shrink-0 flex-col rounded-3xl border border-neutral-subtle bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="relative mb-3 h-32 w-full overflow-hidden rounded-2xl">
        <Image
          src={addon.image}
          alt={addon.title}
          fill
          sizes="200px"
          className="object-cover"
        />
      </div>
      <h4 className="mb-0.5 font-figtree text-[14px] font-semibold text-neutral-primary">
        {addon.title}
      </h4>
      <p className="mb-3 font-figtree text-[12px] text-neutral-tertiary">{addon.category}</p>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="font-figtree text-[15px] font-bold text-neutral-primary">
          {formatPrice(addon.price)}{" "}
          <span className="font-figtree text-[10px] font-normal text-neutral-tertiary">
            {addon.unitLabel}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onToggle(addon.id)}
          aria-pressed={addon.added}
          aria-label={addon.added ? `Remove ${addon.title} add-on` : `Add ${addon.title} add-on`}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 ${
            addon.added ? "bg-success-700 text-white" : "bg-brand-primary text-white"
          }`}
        >
          {addon.added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
