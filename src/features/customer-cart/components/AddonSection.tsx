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
    <section className="-mx-4 md:mx-0">
      <h4 className="mb-4 px-4 md:px-0 font-figtree text-[13px] font-bold tracking-wider text-neutral-primary uppercase">
        People also buy this
      </h4>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {addons.map((addon) => (
          <AddonCard key={`${addon.itemId}-${addon.id}`} addon={addon} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}
