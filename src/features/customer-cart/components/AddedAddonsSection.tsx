"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CartAddon } from "../types";
import AddedAddonRow from "./AddedAddonRow";

export default function AddedAddonsSection({
  addons,
  onIncrement,
  onDecrement,
  onSetQuantity,
  onRemove,
}: {
  addons: CartAddon[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSetQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (addons.length === 0) return null;

  return (
    <div className="border-t border-black/5 bg-[#FAFAFA]">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between px-3 py-3 transition-colors hover:bg-[#F2F2F2] md:px-6 md:py-4"
      >
        <h4 className="font-figtree text-[14px] leading-5 font-semibold text-[#111827] md:text-[12px] md:leading-[16px]">
          Added Add-ons ({addons.length})
        </h4>
        <ChevronDown
          className={`h-4 w-4 text-neutral-secondary transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-4 px-3 pb-3 md:gap-6 md:px-6 md:pb-6">
          {addons.map((addon, index) => (
            <Fragment key={addon.id}>
              {index > 0 && <hr className="border-neutral-subtle" />}
              <AddedAddonRow
                addon={addon}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onSetQuantity={onSetQuantity}
                onRemove={onRemove}
              />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
