"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, Plus } from "lucide-react";
import type { AddonItem } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";
import AddonDetailsModal from "./AddonDetailsModal";
import IncludedItemImageModal from "./IncludedItemImageModal";

export default function AddonCard({
  addon,
  onAdd,
  seed = 0,
}: {
  addon: AddonItem;
  /** colourId is the color the customer picked in the details modal (undefined when this addon has no color options) — reaches PackageDetailPage.tsx's addAddon, which merges into an existing line of the same addon+colour or creates a new one. */
  onAdd: (colourId?: string) => void;
  seed?: number;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const priceUnit = addon.unitLabel.replace(/^\//, "") || "flat";

  return (
    <>
      {/* Desktop/tablet layout — unchanged. */}
      <div className="hidden overflow-hidden rounded-2xl border border-black/10 md:block">
        <div
          role={addon.image ? "button" : undefined}
          tabIndex={addon.image ? 0 : undefined}
          onClick={() => addon.image && setIsZoomed(true)}
          onKeyDown={(e) => {
            if (addon.image && (e.key === "Enter" || e.key === " ")) setIsZoomed(true);
          }}
          aria-label={addon.image ? `View larger image of ${addon.title}` : undefined}
          className={`relative aspect-[4/3] w-full ${addon.image ? "cursor-pointer" : ""}`}
        >
          {addon.image ? (
            <Image src={addon.image} alt={addon.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
          ) : (
            <PlaceholderMedia seed={seed} className="absolute inset-0" />
          )}
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 font-figtree text-[10px] font-bold tracking-wide text-brand-primary uppercase shadow-sm">
            {addon.category}
          </span>

          {/* Always visible, even after this addon already has a line —
              picking it again (same or different colour) merges into the
              matching line's quantity or starts a new one, handled by
              PackageDetailPage.tsx's addAddon. Quantity for an existing
              line is otherwise only changed from the "Added Add-ons"
              summary tab above (AddedAddonsSummary). stopPropagation so it
              doesn't also trigger the image zoom above. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailsOpen(true);
            }}
            aria-label={`Add ${addon.title}`}
            className="absolute -bottom-4 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-subtle text-brand-primary shadow-md transition hover:bg-brand-primary/15"
          >
            <Plus className="h-4 w-4" />
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

      {/* Mobile layout (Figma node 2565:28233) — fixed 170px-wide card for
          the horizontal rail, image shorter (112px vs. desktop's 4:3), the
          "add" button a small pill floating over the image instead of
          overlapping its bottom edge, and the category tag + price sitting
          inside the body instead of as an image overlay. */}
      <div className="w-[170px] shrink-0 overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white md:hidden">
        <div
          role={addon.image ? "button" : undefined}
          tabIndex={addon.image ? 0 : undefined}
          onClick={() => addon.image && setIsZoomed(true)}
          onKeyDown={(e) => {
            if (addon.image && (e.key === "Enter" || e.key === " ")) setIsZoomed(true);
          }}
          aria-label={addon.image ? `View larger image of ${addon.title}` : undefined}
          className={`relative h-[112px] w-[170px] bg-[#F4F4F5] ${addon.image ? "cursor-pointer" : ""}`}
        >
          {addon.image ? (
            <Image src={addon.image} alt={addon.title} fill sizes="170px" className="object-cover" />
          ) : (
            <PlaceholderMedia seed={seed} className="absolute inset-0" />
          )}
          <span className="absolute top-2 left-2 rounded-full bg-[#FDEEF0] px-2 py-[3px] font-figtree text-[11px] font-semibold tracking-[0.03em] whitespace-nowrap text-[#B4112A] uppercase">
            {addon.category}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailsOpen(true);
            }}
            aria-label={`Add ${addon.title}`}
            className="absolute top-[72px] left-[130px] flex h-8 w-8 items-center justify-center rounded-2xl bg-[#FDEEF0] text-[#F0596F]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-3 pt-[10px] pb-3">
          <div>
            <p className="truncate font-figtree text-[16px] font-medium text-[#222]">{addon.title}</p>
            <p className="truncate font-figtree text-[12px] text-[#71717B]">
              {addon.category} · {addon.qtyLabel || "Qty"}
            </p>
          </div>

          {addon.warning && (
            <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 font-figtree text-[11px] text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {addon.warning}
            </div>
          )}

          <hr className="border-dashed border-black/15" />

          <div className="flex items-baseline gap-0.5">
            <span className="font-figtree text-[16px] font-semibold whitespace-nowrap text-[#222]">
              {formatPrice(addon.price)}
            </span>
            <span className="font-figtree text-[11px] font-medium whitespace-nowrap text-[#3F3F47]">/{priceUnit}</span>
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

      {addon.image && (
        <IncludedItemImageModal
          isOpen={isZoomed}
          onClose={() => setIsZoomed(false)}
          image={addon.image}
          alt={addon.title}
        />
      )}
    </>
  );
}
