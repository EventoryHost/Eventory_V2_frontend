import { Zap, LayoutGrid, Snowflake, DoorOpen, type LucideIcon } from "lucide-react";
import type { VendorRequirement, VendorRequirementIcon } from "../types";
import SectionHeading from "./SectionHeading";

const ICON_MAP: Record<VendorRequirementIcon, LucideIcon> = {
  electricity: Zap,
  stage: LayoutGrid,
  ac: Snowflake,
  room: DoorOpen,
};

export default function VendorRequirements({ requirements }: { requirements: VendorRequirement[] }) {
  return (
    <section className="border-t border-black/5 pt-8">
      <SectionHeading>Vendor&apos;s Requirement</SectionHeading>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {requirements.map((requirement) => {
          const Icon = ICON_MAP[requirement.icon];
          return (
            <div key={requirement.id} className="flex items-center gap-3">
              <Icon className="h-6 w-6 text-neutral-secondary" />
              <span className="font-figtree text-[14px] font-medium text-brand-950">{requirement.label}</span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-6 rounded-full border border-black/15 px-5 py-2 font-figtree text-[13px] font-medium text-brand-950 transition hover:bg-black/5"
      >
        See all Requirements
      </button>
    </section>
  );
}
