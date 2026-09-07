import type { AddonItem } from "../types";
import SectionHeading from "./SectionHeading";
import AddonCard from "./AddonCard";
import AddedAddonsSummary from "./AddedAddonsSummary";

export default function AddonsCarousel({
  addons,
  quantities,
  onChangeQuantity,
}: {
  addons: AddonItem[];
  quantities: Record<string, number>;
  onChangeQuantity: (id: string, delta: number) => void;
}) {
  const addedAddons = addons
    .filter((addon) => (quantities[addon.id] ?? 0) > 0)
    .map((addon) => ({ ...addon, quantity: quantities[addon.id] }));

  return (
    <section id="addons" className="border-t border-black/5 pt-8">
      <SectionHeading>Add-ons &amp; extras</SectionHeading>

      <AddedAddonsSummary
        addons={addedAddons}
        onIncrement={(id) => onChangeQuantity(id, 1)}
        onDecrement={(id) => onChangeQuantity(id, -1)}
        onRemove={(id) => onChangeQuantity(id, -(quantities[id] ?? 0))}
      />

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
