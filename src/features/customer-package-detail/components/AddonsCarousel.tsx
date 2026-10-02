import type { AddonItem, SelectedAddon } from "../types";
import SectionHeading from "./SectionHeading";
import AddonCard from "./AddonCard";
import AddedAddonsSummary from "./AddedAddonsSummary";

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
  return (
    <section id="addons" className="border-t border-black/5 pt-8">
      <SectionHeading>Add-ons &amp; extras</SectionHeading>
      <AddedAddonsSummary
        addons={lines}
        onIncrement={(lineKey) => onChangeLineQuantity(lineKey, 1)}
        onDecrement={(lineKey) => onChangeLineQuantity(lineKey, -1)}
        onSetQuantity={onSetLineQuantity}
        onRemove={(lineKey) => onSetLineQuantity(lineKey, 0)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {addons.map((addon, i) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            seed={i}
            onAdd={(colourId) => onAdd(addon.id, colourId)}
          />
        ))}
      </div>
    </section>
  );
}
