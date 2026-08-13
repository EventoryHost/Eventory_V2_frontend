import Image from "next/image";
import { Check, Pencil } from "lucide-react";
import type { IncludedItemEntry } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";

export default function IncludedItemCard({ item, seed = 0 }: { item: IncludedItemEntry; seed?: number }) {
  const [firstArea, ...moreAreas] = item.decoratingAreas;

  return (
    <div className="rounded-2xl border border-black/10 p-4">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
          {item.image ? (
            <Image src={item.image} alt={item.title} fill sizes="96px" className="object-cover" />
          ) : (
            <PlaceholderMedia seed={seed} className="absolute inset-0" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-figtree text-[16px] font-bold text-brand-950">{item.title}</h3>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded border border-black/10 bg-black/[0.03] px-2 py-1 font-figtree text-[11px] text-brand-950"
            >
              <Pencil className="h-3 w-3" /> Customise
            </button>
          </div>

          <div className="mt-1 space-y-0.5 font-figtree text-[13px] text-neutral-secondary">
            <div>
              <span className="text-neutral-tertiary">Decorating:</span> {firstArea}
              {moreAreas.length > 0 && (
                <>
                  , <button type="button" className="underline">{moreAreas.join(", ")}</button>
                </>
              )}
            </div>
            <div>
              <span className="text-neutral-tertiary">Theme:</span> {item.theme}
            </div>
            <div>
              <span className="text-neutral-tertiary">Setup type:</span> {item.setupType}
            </div>
          </div>

          <div className="mt-2 font-figtree text-[15px] font-bold text-brand-950">{formatPrice(item.price)}</div>
        </div>
      </div>

      <div className="border-t border-dashed border-black/10 pt-3">
        <div className="mb-2 font-figtree text-[11px] tracking-wide text-neutral-tertiary uppercase">Items</div>
        <div className="grid grid-cols-1 gap-2 font-figtree text-[13px] text-neutral-secondary sm:grid-cols-2">
          {item.items.map((line) => (
            <div key={line.id} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 shrink-0 text-success-700" />
              {line.label} × {line.qty}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
