import type { CartAddon } from "../types";
import AddonCard from "./AddonCard";

export default function AddonSection({
  addons,
  onToggle,
}: {
  addons: CartAddon[];
  onToggle: (id: string) => void;
}) {
  if (addons.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-figtree text-[18px] font-bold tracking-wide text-neutral-primary uppercase">
        People also buy this
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {addons.map((addon) => (
          <AddonCard key={addon.id} addon={addon} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}
