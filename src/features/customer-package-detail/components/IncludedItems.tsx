"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { IncludedItemEntry } from "../types";
import { useCustomizeWorkshop } from "../hooks/useCustomizeWorkshop";
import SectionHeading from "./SectionHeading";
import IncludedItemCard from "./IncludedItemCard";
import CustomizeWorkshopModal from "./CustomizeWorkshopModal";
import YourRequestsPanel from "./YourRequestsPanel";

export default function IncludedItems({ items }: { items: IncludedItemEntry[] }) {
  const workshop = useCustomizeWorkshop(items);
  const [activeSetupId, setActiveSetupId] = useState<string | null>(null);

  const activeSetup = items.find((setup) => setup.id === activeSetupId) ?? null;

  return (
    <section id="included" className="border-t border-black/5 pt-8">
      <SectionHeading eyebrow="Setups in this package">What&apos;s Included</SectionHeading>

      <div className="space-y-6">
        {items.map((setup, i) => (
          <IncludedItemCard
            key={setup.id}
            item={setup}
            liveItems={workshop.itemsBySetup[setup.id]}
            pendingCount={workshop.requests.filter((r) => r.setupId === setup.id).length}
            seed={i}
            onCustomize={() => setActiveSetupId(setup.id)}
          />
        ))}
      </div>

      <YourRequestsPanel requests={workshop.requests} onDismiss={workshop.dismissRequest} />

      <a
        href="#not-included"
        className="mt-4 flex items-center gap-1 font-figtree text-[14px] font-medium text-brand-primary hover:underline"
      >
        Check Exclusions <ArrowRight className="h-4 w-4" />
      </a>

      {activeSetup && (
        <CustomizeWorkshopModal
          setup={activeSetup}
          items={workshop.itemsBySetup[activeSetup.id] ?? []}
          workshop={workshop}
          onClose={() => setActiveSetupId(null)}
        />
      )}
    </section>
  );
}
