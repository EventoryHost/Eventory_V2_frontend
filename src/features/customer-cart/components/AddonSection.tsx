import type { CartAddon } from "../types";
import AddonCarousel from "./AddonCarousel";

export default function AddonSection({
  addons,
  onToggle,
}: {
  addons: CartAddon[];
  onToggle: (id: string) => void;
}) {
  if (addons.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 font-figtree text-[20px] font-semibold text-neutral-primary">
        Add-Ons Recommendation
      </h2>
      <AddonCarousel addons={addons} onToggle={onToggle} />
    </section>
  );
}
