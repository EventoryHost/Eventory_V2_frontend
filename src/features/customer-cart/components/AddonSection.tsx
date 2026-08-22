import type { RecommendedAddon } from "../types";
import AddonCard from "./AddonCard";

export default function AddonSection({
  addons,
  onAdd,
}: {
  addons: RecommendedAddon[];
  onAdd: (addon: RecommendedAddon) => void;
}) {
  if (addons.length === 0) return null;

  return (
    <section>
      <h4 className="mb-4 font-figtree text-[13px] font-bold tracking-wider text-neutral-primary uppercase">
        People also buy this
      </h4>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {addons.map((addon) => (
          <AddonCard key={`${addon.itemId}-${addon.id}`} addon={addon} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
