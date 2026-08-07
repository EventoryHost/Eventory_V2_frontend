import ScrollableRow from "@/features/customer-packages/components/ScrollableRow";
import type { CartAddon } from "../types";
import AddonCard from "./AddonCard";

export default function AddonCarousel({
  addons,
  onToggle,
}: {
  addons: CartAddon[];
  onToggle: (id: string) => void;
}) {
  return (
    <ScrollableRow>
      {addons.map((addon) => (
        <AddonCard key={addon.id} addon={addon} onToggle={onToggle} />
      ))}
    </ScrollableRow>
  );
}
