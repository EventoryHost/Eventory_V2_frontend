"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Plus } from "lucide-react";
import type { AddonItem } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";
import AddonDetailsModal from "./AddonDetailsModal";

export default function AddonCard({
  addon,
  quantity,
  onAdd,
  seed = 0,
}: {
  addon: AddonItem;
  quantity: number;
  /** colourId is the color the customer picked in the details modal (undefined when this addon has no color options) — needs to reach the cart payload, see PackageDetailPage.tsx's addonColours state. */
  onAdd: (colourId?: string) => void;
  seed?: number;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const priceUnit = addon.unitLabel.replace(/^\//, "") || "flat";

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-black/10">
        <div className="relative aspect-[4/3] w-full">
          {addon.image ? (
            <Image src={addon.image} alt={addon.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
          ) : (
            <PlaceholderMedia seed={seed} className="absolute inset-0" />
          )}
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 font-figtree text-[10px] font-bold tracking-wide text-brand-primary uppercase shadow-sm">
            {addon.category}
          </span>

          {/* Once added, quantity is only ever changed from the "Added
              Add-ons" summary tab above (AddedAddonsSummary) — no
              increment/decrement here, and the + to add it again only
              reappears once it's removed from that tab (quantity back to 0). */}
          {quantity === 0 && (
            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              aria-label={`Add ${addon.title}`}
              className="absolute -bottom-4 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-subtle text-brand-primary shadow-md transition hover:bg-brand-primary/15"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
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

      <AddonDetailsModal
        addon={addon}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onAdd={onAdd}
        seed={seed}
      />
    </>
  );
}
