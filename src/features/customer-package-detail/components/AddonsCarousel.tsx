"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AddonItem, SelectedAddon } from "../types";
import SectionHeading from "./SectionHeading";
import AddonCard from "./AddonCard";
import AddedAddonsSummary from "./AddedAddonsSummary";

const ALL_TAB = "All";
// One card is 237px wide with a 16px gap; arrows page by ~3 cards.
const SCROLL_STEP_PX = 3 * (237 + 16);

export default function AddonsCarousel({
  addons,
  lines,
  onAdd,
  onChangeLineQuantity,
  onSetLineQuantity,
}: {
  addons: AddonItem[];
  lines: SelectedAddon[];
  onAdd: (addonId: string, colourId?: string) => void;
  onChangeLineQuantity: (lineKey: string, delta: number) => void;
  onSetLineQuantity: (lineKey: string, qty: number) => void;
}) {
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const railRef = useRef<HTMLDivElement>(null);

  // "All" plus each distinct add-on category, in the order the vendor listed them.
  // Each tab's round thumbnail is the first add-on image in that category.
  const tabs = useMemo(() => {
    const categories: { label: string; image?: string }[] = [];
    for (const addon of addons) {
      const label = addon.category || "Other";
      const existing = categories.find((category) => category.label === label);
      if (!existing) categories.push({ label, image: addon.image });
      else if (!existing.image && addon.image) existing.image = addon.image;
    }
    return [{ label: ALL_TAB, image: addons.find((addon) => addon.image)?.image }, ...categories];
  }, [addons]);

  const visibleAddons = activeTab === ALL_TAB ? addons : addons.filter((addon) => (addon.category || "Other") === activeTab);

  function selectTab(label: string) {
    setActiveTab(label);
    railRef.current?.scrollTo({ left: 0 });
  }

  function scrollRail(direction: 1 | -1) {
    railRef.current?.scrollBy({ left: direction * SCROLL_STEP_PX, behavior: "smooth" });
  }

  return (
    <section id="addons" className="border-t border-black/5 pt-8">
      {/* Desktop/tablet — Figma node 3233:26387: category tabs, then the cards for the selected tab. */}
      <div className="hidden md:block">
        <SectionHeading>Add-ons &amp; Extras</SectionHeading>

        <div className="flex items-start justify-between gap-6">
          <div role="tablist" aria-label="Add-on categories" className="flex min-w-0 gap-6 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const isActive = tab.label === activeTab;
              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectTab(tab.label)}
                  className="flex shrink-0 flex-col items-center gap-2 px-1"
                >
                  <span className="relative h-10 w-10 overflow-hidden rounded-full bg-[#D9D9D9]">
                    {tab.image && <Image src={tab.image} alt="" fill sizes="40px" className="object-cover" />}
                  </span>
                  <span
                    className={`border-b-2 pb-1.5 font-figtree text-[14px] leading-5 whitespace-nowrap ${
                      isActive ? "border-[#F0596F] font-medium text-[#030303]" : "border-transparent text-[#3F3F47]"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-3 pt-2">
            <span className="font-figtree text-[14px] text-[#71717B]">
              {visibleAddons.length} add-on{visibleAddons.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              aria-label="Scroll add-ons left"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E4E7] text-[#71717B] transition hover:bg-black/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              aria-label="Scroll add-ons right"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E4E7] text-[#030303] transition hover:bg-black/5"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={railRef}
          className="mt-6 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visibleAddons.map((addon) => (
            <div key={addon.id} className="w-[237px] shrink-0">
              <AddonCard
                addon={addon}
                seed={addons.indexOf(addon)}
                onAdd={(colourId) => onAdd(addon.id, colourId)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile header (Figma node 2565:28233) — same accent-bar title, but
          with an "N available" count where desktop has none. */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <h2 className="flex items-center gap-2 font-figtree text-[18px] font-semibold text-[#222]">
          <span className="h-[22px] w-1 rounded-sm bg-[#F0596F]" />
          Add-ons &amp; Extras
        </h2>
        <p className="font-figtree text-[12px] text-[#71717B]">{addons.length} available</p>
      </div>

      {/* Mobile horizontal-scroll rail (Figma node 2565:28233's "Add-on rail"). */}
      <div className="flex gap-[10px] overflow-x-auto md:hidden">
        {addons.map((addon, i) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            seed={i}
            onAdd={(colourId) => onAdd(addon.id, colourId)}
          />
        ))}
      </div>

      <AddedAddonsSummary
        addons={lines}
        onIncrement={(lineKey) => onChangeLineQuantity(lineKey, 1)}
        onDecrement={(lineKey) => onChangeLineQuantity(lineKey, -1)}
        onSetQuantity={onSetLineQuantity}
        onRemove={(lineKey) => onSetLineQuantity(lineKey, 0)}
      />
    </section>
  );
}
