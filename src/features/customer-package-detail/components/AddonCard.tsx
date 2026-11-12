"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import type { AddonItem } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";
import AddonDetailsModal from "./AddonDetailsModal";

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
  const priceUnit = addon.unitLabel.replace(/^\//, "") || "flat";

  return (
    <>
      {/* Desktop/tablet layout — Figma node 3233:26387: fixed-height image with
          the category pill top-left and a white round "+" bottom-right, then
          name, "sub-category · qty", a dashed divider and the price. */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white md:block">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsDetailsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsDetailsOpen(true);
          }}
          aria-label={`View details for ${addon.title}`}
          className="relative h-[157px] w-full cursor-pointer"
        >
          {addon.image ? (
            <Image src={addon.image} alt={addon.title} fill sizes="237px" className="object-cover" />
          ) : (
            <PlaceholderMedia seed={seed} className="absolute inset-0" />
          )}
          <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 font-figtree text-[12px] leading-4 font-medium tracking-[0.02em] text-[#B4112A] uppercase">
            {addon.category}
          </span>

          {/* Always visible, even after this addon already has a line —
              picking it again (same or different colour) merges into the
              matching line's quantity or starts a new one, handled by
              PackageDetailPage.tsx's addAddon. stopPropagation so it
              doesn't also trigger the card's own details click above. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailsOpen(true);
            }}
            aria-label={`Add ${addon.title}`}
            className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#EA1D3B] shadow-md transition hover:bg-[#FDEEF0]"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <h4 className="truncate font-figtree text-[16px] leading-6 font-medium text-[#030303]">{addon.title}</h4>
          <p className="mt-0.5 truncate font-figtree text-[13px] leading-5 text-[#71717B]">
            {addon.subCategory || addon.category} · {addon.qtyLabel || "Qty"}
          </p>

          <div className="mt-3 border-t border-dashed border-black/15 pt-3">
            <span className="font-figtree text-[18px] leading-6 font-bold text-[#030303]">{formatPrice(addon.price)}</span>
            <span className="font-figtree text-[12px] font-semibold text-[#3F3F47]">/{priceUnit}</span>
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
          role="button"
          tabIndex={0}
          onClick={() => setIsDetailsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setIsDetailsOpen(true);
          }}
          aria-label={`View details for ${addon.title}`}
          className="relative h-[112px] w-[170px] cursor-pointer bg-[#F4F4F5]"
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
    </>
  );
}
