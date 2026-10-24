"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { MAX_COMPARE_PACKAGES } from "@/lib/customerCompareApi";

export interface CompareTraySlotItem {
  id: string;
  image?: string;
  title: string;
}

/**
 * Package listing's sticky compare tray — Figma node 2785:27229 (empty, 0
 * selected) and 2843:25710 (2 of 3 selected). Fixed to the viewport bottom
 * while "Compare Packages" mode is on (toggled from the header button, node
 * 2814:25563), same category-locked, max-3 comparison session the wishlist's
 * "Compare Packages" flow already builds (WishlistContent.tsx) — this is the
 * second entry point into that same /customer/compare session.
 */
export default function ComparePackagesTray({
  items,
  onRemove,
  onClear,
  onCompare,
  busy,
  message,
}: {
  items: CompareTraySlotItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  busy: boolean;
  message: string | null;
}) {
  const remaining = MAX_COMPARE_PACKAGES - items.length;
  const canCompare = items.length >= 2 && !busy;

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-[760px] flex-col gap-2">
        {message && (
          <p className="self-center rounded-full bg-[#1E0306] px-4 py-1.5 text-[12px] font-medium text-white shadow-lg">
            {message}
          </p>
        )}
        <div className="flex w-full flex-wrap items-center justify-between gap-4 rounded-[20px] border border-[#e4e4e7] bg-white py-4 pl-6 pr-5 shadow-[0px_8px_32px_0px_rgba(0,0,0,0.14)]">
          <div className="flex w-[230px] shrink-0 flex-col gap-0.5">
            <p className="text-[15px] font-semibold text-black">
              {items.length === 0 ? "Comparing packages" : `Comparing ${items.length} of ${MAX_COMPARE_PACKAGES} packages`}
            </p>
            <p className="text-[12px] text-[#9f9fa9]">
              Same category only ·{" "}
              {remaining > 0 ? `you can add ${remaining} more` : "comparison is full"}
            </p>
          </div>

          <div className="flex shrink-0 items-start gap-3.5">
            {Array.from({ length: MAX_COMPARE_PACKAGES }).map((_, i) => {
              const item = items[i];
              if (!item) {
                return (
                  <div
                    key={i}
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-dashed border-[#d0d0d0] bg-[#fafafa]"
                  >
                    <p className="text-[22px] font-normal text-[#9f9fa9]">+</p>
                  </div>
                );
              }
              return (
                <div key={item.id} className="relative size-14 shrink-0 rounded-xl border border-[#f0f0f0]">
                  <Image
                    src={item.image ?? "/images/customer/packages-pics.png"}
                    alt={item.title}
                    fill
                    className="rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${item.title} from comparison`}
                    onClick={() => onRemove(item.id)}
                    className="absolute -top-2 left-[41px] flex size-5 items-center justify-center rounded-full border border-[#e6e6e6] bg-white text-black shadow-[0px_1px_3px_0px_rgba(0,0,0,0.15)]"
                  >
                    <X className="size-3" strokeWidth={3} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <button
              type="button"
              onClick={onClear}
              disabled={items.length === 0}
              className="text-[14px] font-medium text-brand-primary underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={onCompare}
              disabled={!canCompare}
              className={`rounded-full px-6 py-3 text-[14px] font-semibold transition-colors ${
                canCompare ? "bg-brand-primary text-white" : "bg-[#e6e6e6] text-[#9f9fa9]"
              }`}
            >
              {busy ? "Opening…" : "Compare now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
