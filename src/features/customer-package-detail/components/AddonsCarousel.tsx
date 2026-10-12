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
      {/* Desktop/tablet header — unchanged. */}
      <div className="hidden md:block">
        <SectionHeading>Add-ons &amp; extras</SectionHeading>
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

      <AddedAddonsSummary
        addons={lines}
        onIncrement={(lineKey) => onChangeLineQuantity(lineKey, 1)}
        onDecrement={(lineKey) => onChangeLineQuantity(lineKey, -1)}
        onSetQuantity={onSetLineQuantity}
        onRemove={(lineKey) => onSetLineQuantity(lineKey, 0)}
      />

      {/* Desktop/tablet grid — unchanged. */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {addons.map((addon, i) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            seed={i}
            onAdd={(colourId) => onAdd(addon.id, colourId)}
          />
        ))}
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
    </section>
  );
}
