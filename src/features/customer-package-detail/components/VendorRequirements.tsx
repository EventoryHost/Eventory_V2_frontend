"use client";

import { useState } from "react";
import { Zap, LayoutGrid, Snowflake, DoorOpen, Truck, Hammer, Archive, Droplet, ParkingSquare, User, type LucideIcon } from "lucide-react";
import type { VendorRequirement, VendorRequirementIcon } from "../types";
import SectionHeading from "./SectionHeading";
import VendorRequirementsModal from "./VendorRequirementsModal";

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
};

const PREVIEW_COUNT = 4;

export default function VendorRequirements({ requirements }: { requirements: VendorRequirement[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const preview = requirements.slice(0, PREVIEW_COUNT);

  return (
    <section id="venue-needs" className="border-t border-black/5 pt-8">
      <SectionHeading>Vendor&apos;s Requirement</SectionHeading>

      <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {preview.map((requirement) => {
          const Icon = ICON_MAP[requirement.icon] ?? User;
          return (
            <div key={requirement.id} className="flex items-center gap-2 font-figtree text-[14px] text-brand-950">
              <Icon className="h-4 w-4 shrink-0 text-neutral-secondary" />
              {requirement.label}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="mt-5 rounded-lg border border-black/15 px-4 py-2 font-figtree text-[13px] font-semibold text-brand-950 transition hover:border-black/30"
      >
        See all Requirements
      </button>

      <VendorRequirementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requirements={requirements}
      />
    </section>
  );
}
