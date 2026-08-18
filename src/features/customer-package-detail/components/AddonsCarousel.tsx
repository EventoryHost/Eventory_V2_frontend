import type { AddonItem } from "../types";
import SectionHeading from "./SectionHeading";
import AddonCard from "./AddonCard";

export default function AddonsCarousel({
  addons,
  selectedIds,
  onToggle,
}: {
  addons: AddonItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <section id="addons" className="border-t border-black/5 pt-8">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <SectionHeading eyebrow="Optional · nothing is pre-selected">Add-ons &amp; extras</SectionHeading>
        <p className="font-figtree text-[12px] text-neutral-tertiary">Every add-on updates the price in the card on the right.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addons.map((addon, i) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            seed={i}
            isSelected={selectedIds.has(addon.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}
