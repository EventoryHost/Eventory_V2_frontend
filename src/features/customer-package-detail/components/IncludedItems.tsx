import { ArrowRight } from "lucide-react";
import type { IncludedItemEntry } from "../types";
import SectionHeading from "./SectionHeading";
import IncludedItemCard from "./IncludedItemCard";

export default function IncludedItems({ items }: { items: IncludedItemEntry[] }) {
  return (
    <section className="border-t border-black/5 pt-8">
      <SectionHeading>What&apos;s Included</SectionHeading>

      <div className="space-y-6">
        {items.map((item, i) => (
          <IncludedItemCard key={item.id} item={item} seed={i} />
        ))}
      </div>

      <button
        type="button"
        className="mt-4 flex items-center gap-1 font-figtree text-[14px] font-medium text-brand-primary hover:underline"
      >
        Check Exclusions <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}
