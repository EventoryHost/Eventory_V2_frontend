"use client";

import { useState } from "react";
import { CheckCircle2, SquareArrowOutUpRight } from "lucide-react";
import type { IncludedItemEntry } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { useCustomizeWorkshop } from "../hooks/useCustomizeWorkshop";
import PlaceholderMedia from "./PlaceholderMedia";
import SectionHeading from "./SectionHeading";
import CustomizeWorkshopModal from "./CustomizeWorkshopModal";

export default function IncludedItems({ items }: { items: IncludedItemEntry[] }) {
  const workshop = useCustomizeWorkshop(items);
  const [activeSetupId, setActiveSetupId] = useState<string | null>(null);
  const activeSetup = items.find((setup) => setup.id === activeSetupId) ?? null;

  return (
    <section id="included" className="border-t border-black/5 pt-8">
      <SectionHeading>What&apos;s Included</SectionHeading>

      <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white">
        <div className="flex flex-col gap-4 p-4">
          {items.map((setup, i) => (
            <div key={setup.id} className="flex flex-col gap-4 rounded-xl border border-[#E4E4E7] bg-white p-4">
              {/* Top: image + info + View setup */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative h-[178px] w-full shrink-0 overflow-hidden rounded-xl sm:w-[216px]">
                  {setup.image ? (
                    <img src={setup.image} alt={setup.title} className="block h-full w-full object-cover" />
                  ) : (
                    <PlaceholderMedia seed={i} className="absolute inset-0" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-figtree text-[18px] font-medium leading-[26px] tracking-[-0.02em] text-[#3F3F47]">
                    {setup.title}
                  </h3>

                  <div className="mt-2 flex flex-col gap-1">
                    {setup.details.map((detail) => (
                      <p key={detail.label} className="font-figtree text-[12px] leading-[16px] text-[#71717B]">
                        {detail.label}:{" "}
                        <span className="text-[#3F3F47]">
                          {detail.value}
                          {detail.moreCount ? <span className="underline">, +{detail.moreCount} more</span> : null}
                        </span>
                      </p>
                    ))}
                  </div>

                  <div className="mt-3 font-figtree text-[18px] font-bold text-brand-950">
                    {formatPrice(setup.price)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSetupId(setup.id)}
                  className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-black/15 px-3.5 py-2 font-figtree text-[13px] font-medium text-brand-950 transition hover:bg-black/5"
                >
                  <SquareArrowOutUpRight className="h-3.5 w-3.5" />
                  View setup
                </button>
              </div>

              {setup.items.length > 0 && (
                <>
                  <hr className="border-dashed border-black/10" />

                  {/* Bottom: items checklist + customisations chip */}
                  <div className="flex flex-col justify-between gap-4 pb-3 sm:flex-row">
                    <div className="flex-1">
                      <p className="mb-3 font-figtree text-[12px] leading-[20px] font-medium tracking-[0.03em] text-[#71717B]">
                        ITEMS ({setup.items.length} Items)
                      </p>
                      <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                        {setup.items.map((line) => (
                          <div key={line.id} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success-700" strokeWidth={1.5} />
                            <span className="font-figtree text-[14px] leading-[20px] text-[#3F3F47]">
                              {line.label} × {line.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {!!setup.customisationsCount && (
                      <div className="shrink-0">
                        <span className="inline-flex h-8 min-h-8 w-[139px] items-center justify-center rounded-full bg-[#FFFBEB] px-4 font-figtree text-[13px] font-medium text-amber-700">
                          {setup.customisationsCount} customisations
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {activeSetup && (
        <CustomizeWorkshopModal
          setup={activeSetup}
          items={workshop.itemsBySetup[activeSetup.id] ?? []}
          workshop={workshop}
          onClose={() => setActiveSetupId(null)}
        />
      )}
    </section>
  );
}
