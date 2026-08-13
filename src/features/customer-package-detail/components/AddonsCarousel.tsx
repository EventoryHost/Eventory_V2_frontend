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
    <section className="border-t border-black/5 pt-8">
      <SectionHeading>Add-ons &amp; Extras</SectionHeading>

      <div className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
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
