import type { AddonItem } from "../types";
import SectionHeading from "./SectionHeading";
import AddonCard from "./AddonCard";

export default function AddonsCarousel({
  addons,
  quantities,
  onChangeQuantity,
}: {
  addons: AddonItem[];
  quantities: Record<string, number>;
  onChangeQuantity: (id: string, delta: number) => void;
}) {
  return (
    <section id="addons" className="border-t border-black/5 pt-8">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <SectionHeading eyebrow="Optional · nothing is pre-selected">Add-ons &amp; extras</SectionHeading>
        <p className="font-figtree text-[12px] text-neutral-tertiary">Every add-on updates the price in the card on the right.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {addons.map((addon, i) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            seed={i}
            quantity={quantities[addon.id] ?? 0}
            onIncrement={() => onChangeQuantity(addon.id, 1)}
            onDecrement={() => onChangeQuantity(addon.id, -1)}
          />
        ))}
      </div>
    </section>
  );
}
