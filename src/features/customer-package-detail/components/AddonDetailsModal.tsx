"use client";

import { useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { AddonItem } from "../types";
import { formatPrice } from "../utils/formatPrice";
import PlaceholderMedia from "./PlaceholderMedia";

const DESCRIPTION_PREVIEW_LENGTH = 140;

function scrollToPolicies() {
  document.getElementById("policies")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function AddonDetailsModal({
  addon,
  isOpen,
  onClose,
  onAdd,
  seed = 0,
}: {
  addon: AddonItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (colourId?: string) => void;
  seed?: number;
}) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [selectedColourId, setSelectedColourId] = useState<string | undefined>(addon?.colourOptions?.[0]?.id);

  if (typeof document === "undefined" || !addon) return null;

  const priceUnit = addon.unitLabel.replace(/^\//, "");
  const description = addon.description ?? "";
  const isLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const shownDescription = isLongDescription && !isDescriptionExpanded
    ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}...`
    : description;

  function handleAdd() {
    onAdd(selectedColourId);
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={addon.title}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[85vh] w-full max-w-[640px] overflow-y-auto rounded-3xl bg-white p-5 shadow-xl sm:p-6"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-neutral-secondary transition-colors hover:bg-black/10"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative h-[162px] w-full shrink-0 overflow-hidden rounded-lg sm:w-[183px]">
                {addon.image ? (
                  <Image src={addon.image} alt={addon.title} fill sizes="183px" className="object-cover" />
                ) : (
                  <PlaceholderMedia seed={seed} className="absolute inset-0" />
                )}
                <span className="absolute top-2 left-2 rounded-full bg-white/95 px-3 py-1 font-figtree text-[11px] font-semibold tracking-wide text-brand-primary uppercase shadow-sm">
                  {addon.category}
                </span>
              </div>

              <div className="flex-1 pr-8">
                <h3 className="font-figtree text-[22px] font-semibold text-brand-950 sm:text-[24px]">{addon.title}</h3>
                {addon.subCategory && (
                  <p className="mt-0.5 font-figtree text-[14px] text-neutral-secondary">{addon.subCategory}</p>
                )}
                {description && (
                  <p className="mt-2 font-figtree text-[15px] leading-6 text-neutral-secondary">
                    {shownDescription}{" "}
                    {isLongDescription && (
                      <button
                        type="button"
                        onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                        className="font-figtree text-[15px] leading-6 text-brand-950 underline"
                      >
                        {isDescriptionExpanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </p>
                )}
              </div>
            </div>

            {addon.details && addon.details.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {addon.details.map((detail) => (
                  <div key={detail.label}>
                    <div className="font-figtree text-[13px] text-neutral-secondary">{detail.label}</div>
                    <div className="mt-0.5 font-figtree text-[15px] font-semibold text-brand-950">{detail.value}</div>
                  </div>
                ))}
              </div>
            )}

            {addon.colourOptions && addon.colourOptions.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 font-figtree text-[13px] font-semibold text-neutral-secondary">Choose a color</div>
                <div className="flex flex-wrap gap-3">
                  {addon.colourOptions.map((colour) => {
                    const selected = selectedColourId === colour.id;
                    return (
                      <button
                        key={colour.id}
                        type="button"
                        onClick={() => setSelectedColourId(colour.id)}
                        className={`flex items-center gap-1.5 rounded-2xl border py-2 pr-3 pl-2 transition ${
                          selected ? "border-brand-primary" : "border-black/15 hover:border-black/30"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? "border-brand-primary" : "border-black/10"
                          }`}
                        >
                          <span className="h-8 w-8 rounded-full" style={{ backgroundColor: colour.swatch }} />
                        </span>
                        <span className="flex flex-col items-start text-left">
                          <span className="font-figtree text-[14px] text-brand-950">{colour.label}</span>
                          {selected && <span className="font-figtree text-[11px] text-neutral-tertiary">Selected</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 border-t border-black/10 pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-figtree text-[22px] font-bold text-brand-950">
                    {formatPrice(addon.price)}
                    {priceUnit && <span className="ml-1 font-figtree text-[13px] font-medium text-neutral-secondary">/{priceUnit}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={scrollToPolicies}
                    className="mt-0.5 font-figtree text-[13px] text-neutral-secondary underline"
                  >
                    Cancellation and other policies
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="shrink-0 rounded-full bg-brand-primary px-8 py-2.5 font-figtree text-[15px] font-semibold text-white transition hover:bg-rose-600"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
