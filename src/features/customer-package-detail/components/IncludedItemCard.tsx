import Image from "next/image";
import { Check, Pencil } from "lucide-react";
import type { IncludedItemEntry, IncludedItemLine } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";

export default function IncludedItemCard({
  item,
  liveItems,
  pendingCount = 0,
  seed = 0,
  onCustomize,
}: {
  item: IncludedItemEntry;
  liveItems?: IncludedItemLine[];
  pendingCount?: number;
  seed?: number;
  onCustomize?: () => void;
}) {
  const lines = liveItems ?? item.items;
  const customisableCount = lines.filter((line) => line.typeOptions?.length || line.colourOptions?.length).length;
  const subtitle = item.details.map((detail) => detail.value).join(" · ");

  return (
    <div className="rounded-2xl border border-black/10 p-4">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          {item.image ? (
            <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
          ) : (
            <PlaceholderMedia seed={seed} className="absolute inset-0" />
          )}
          <button
            type="button"
            onClick={onCustomize}
            aria-label={`Customise ${item.title}`}
            className="absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand-950 shadow"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <h3 className="flex items-center gap-1.5 font-figtree text-[16px] font-bold text-brand-950">
              {item.title}
              {pendingCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />}
            </h3>

            <div className="flex shrink-0 items-center gap-2">
              {item.price > 0 && (
                <span className="font-figtree text-[15px] font-bold text-brand-950">{formatPrice(item.price)}</span>
              )}
              <button
                type="button"
                onClick={onCustomize}
                className="flex items-center gap-1 rounded border border-black/10 bg-black/[0.03] px-2 py-1 font-figtree text-[11px] text-brand-950 transition hover:border-black/20"
              >
                <Pencil className="h-3 w-3" /> View setup
                {pendingCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <p className="mt-0.5 font-figtree text-[13px] text-neutral-secondary">{subtitle}</p>
        </div>
      </div>

      {lines.length > 0 && (
        <div className="mt-4 space-y-1.5 font-figtree text-[13px] text-neutral-secondary">
          {lines.map((line) => (
            <div
              key={line.id}
              className={`flex items-center gap-1.5 ${line.removalRequested ? "text-neutral-tertiary line-through" : ""}`}
            >
              <Check className={`h-4 w-4 shrink-0 ${line.removalRequested ? "text-neutral-tertiary" : "text-success-700"}`} />
              {line.label} × {line.qty}
              {line.isNew && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 no-underline">
                  New
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 font-figtree text-[12px] text-neutral-tertiary">
        {customisableCount > 0 ? `${customisableCount} item${customisableCount === 1 ? "" : "s"} customisable` : "Included as shown"}
      </div>
    </div>
  );
}
