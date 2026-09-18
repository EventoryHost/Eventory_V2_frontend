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
        className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-[#F2F2F2]"
      >
        <h4 className="font-figtree text-[12px] leading-[16px] font-semibold text-[#111827]">
          Added Add-ons ({addons.length})
        </h4>
        <ChevronDown
          className={`h-4 w-4 text-neutral-secondary transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-6 px-6 pb-6">
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
