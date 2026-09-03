"use client";

import { useState } from "react";
import { Zap, LayoutGrid, Snowflake, DoorOpen, Truck, Hammer, Archive, Droplet, ParkingSquare, Lightbulb, Shield, type LucideIcon } from "lucide-react";
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
  lighting: Lightbulb,
  security: Shield,
};

const PREVIEW_COUNT = 4;

export default function VendorRequirements({ requirements }: { requirements: VendorRequirement[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const preview = requirements.slice(0, PREVIEW_COUNT);

  if (requirements.length === 0) return null;

  return (
    <section id="venue-needs" className="border-t border-black/5 pt-8">
      <SectionHeading>Vendor&apos;s Requirement</SectionHeading>

      <div className="grid grid-cols-1 gap-y-6 gap-x-10 sm:grid-cols-2">
        {preview.map((requirement) => {
          const Icon = ICON_MAP[requirement.icon];
          return (
            <div key={requirement.id} className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-neutral-secondary" strokeWidth={1.5} />
              <span className="font-figtree text-[16px] text-neutral-secondary">{requirement.label}</span>
            </div>
          );
        })}
      </div>

      {requirements.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-8 rounded-full border border-black/15 px-5 py-2.5 font-figtree text-[14px] font-medium text-brand-950 transition hover:bg-black/5"
        >
          See all Requirements
        </button>
      )}

      <VendorRequirementsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requirements={requirements}
      />
    </section>
  );
}
