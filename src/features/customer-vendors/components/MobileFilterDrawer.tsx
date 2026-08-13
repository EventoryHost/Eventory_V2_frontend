"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { FilterSectionConfig } from "../types";
import FilterPanelContent, { type SelectedFilters } from "./FilterPanelContent";

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  sections,
  selected,
  onToggleOption,
  onClear,
  resultCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  sections: FilterSectionConfig[];
  selected: SelectedFilters;
  onToggleOption: (sectionId: FilterSectionConfig["id"], optionId: string) => void;
  onClear: () => void;
  resultCount: number;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative flex max-h-[88vh] min-h-[50vh] w-full flex-col rounded-t-[24px] bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-black/10" />
            </div>

            <div className="flex items-center justify-between px-5 pt-2 pb-1">
              <span className="font-figtree text-[13px] font-medium text-neutral-tertiary">
                Filters
              </span>
              <button
                type="button"
                aria-label="Close filters"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-subtle text-neutral-secondary transition-colors hover:bg-black/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4">
              <FilterPanelContent
                sections={sections}
                selected={selected}
                onToggleOption={onToggleOption}
                onClear={onClear}
              />
            </div>

            <div className="border-t border-black/10 p-5">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl bg-brand-primary py-3.5 font-figtree text-[15px] font-bold text-white transition-opacity hover:opacity-90"
              >
                Show {resultCount} results
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
