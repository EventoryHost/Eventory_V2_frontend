"use client";

import { useState } from "react";
import { Zap, LayoutGrid, Snowflake, DoorOpen, Truck, Hammer, Archive, Droplet, ParkingSquare, Lightbulb, Shield, type LucideIcon } from "lucide-react";
import type { InstructionFacts, PackageDetail, VendorRequirement, VendorRequirementIcon } from "../types";
import SectionHeading from "./SectionHeading";
import KnowBeforeYouBookModal from "./KnowBeforeYouBookModal";
import { buildInstructions } from "../utils/buildInstructions";

const ICON_MAP: Record<VendorRequirementIcon, LucideIcon> = {
  electricity: Zap,
  stage: LayoutGrid,
  ac: Snowflake,
  room: DoorOpen,
  vehicle: Truck,
  permission: Hammer,
  storage: Archive,
  water: Droplet,
  parking: ParkingSquare,
  lighting: Lightbulb,
  security: Shield,
};

// Figma node 3233:27441 draws these requirement types with its own icons; the
// rest keep the Lucide set above.
const FIGMA_ICON: Partial<Record<VendorRequirementIcon, string>> = {
  electricity: "/images/customer/package-detail/kyb-plug.svg",
  stage: "/images/customer/package-detail/kyb-chair.svg",
  vehicle: "/images/customer/package-detail/kyb-delivery.svg",
};

const PREVIEW_COUNT = 6;

type Highlight = { id: string; label: string; iconSrc?: string; Icon?: LucideIcon };

/**
 * "Know before you book" (Figma node 3233:27441). Starts with the package's
 * setup time and crew size, then the vendor's own requirements — the same data
 * this section showed as "Vendor's Requirement" before it was redesigned and
 * moved below the add-ons.
 */
export default function VendorRequirements({
  requirements,
  summary,
  facts,
  packageTitle,
}: {
  requirements: VendorRequirement[];
  summary: Pick<PackageDetail["summary"], "setupTime" | "crewSize">;
  facts: InstructionFacts;
  packageTitle: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const highlights: Highlight[] = [];
  if (summary.setupTime && summary.setupTime !== "—") {
    highlights.push({
      id: "setup-time",
      label: `Setup time: ${summary.setupTime}`,
      iconSrc: "/images/customer/package-detail/kyb-clock.svg",
    });
  }
  if (summary.crewSize && summary.crewSize !== "—") {
    highlights.push({
      id: "crew",
      label: `A crew of ${summary.crewSize.replace(/\s*crew$/i, "")}`,
      iconSrc: "/images/customer/package-detail/kyb-users.svg",
    });
  }
  for (const requirement of requirements) {
    highlights.push({
      id: requirement.id,
      label: requirement.label,
      iconSrc: FIGMA_ICON[requirement.icon],
      Icon: ICON_MAP[requirement.icon],
    });
  }

  const preview = highlights.slice(0, PREVIEW_COUNT);
  const rows = Math.ceil(preview.length / 2);

  return (
    <section id="venue-needs" className="border-t border-black/5 pt-8">
      <SectionHeading>Know before you book</SectionHeading>

      {/* Column-first, like the Figma: the left column fills before the right. */}
      <div
        className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-flow-col sm:grid-cols-2"
        style={{ gridTemplateRows: `repeat(${rows}, minmax(0, auto))` }}
      >
        {preview.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            {item.iconSrc ? (
              <img src={item.iconSrc} alt="" className="h-6 w-6 shrink-0" />
            ) : item.Icon ? (
              <item.Icon className="h-6 w-6 shrink-0 text-[#030303]" strokeWidth={1.5} />
            ) : null}
            <span className="font-figtree text-[16px] leading-6 text-[#030303]">{item.label}</span>
          </div>
        ))}
      </div>

      {highlights.length === 0 && (
        <p className="font-figtree text-[16px] leading-6 text-[#3F3F47]">
          The vendor hasn&apos;t listed anything specific for this package yet.
        </p>
      )}

      {/* On every package, whether or not the vendor listed requirements: the modal
          also covers setup, crew and item guidance built from the package's own data. */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="mt-6 rounded-xl border border-[#E4E4E7] bg-white px-6 py-3 font-figtree text-[16px] leading-6 font-medium text-[#030303] transition hover:bg-black/5"
      >
        See all instructions
      </button>

      <KnowBeforeYouBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageTitle={packageTitle}
        parts={buildInstructions(facts, requirements)}
      />
    </section>
  );
}
