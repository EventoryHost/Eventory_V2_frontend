import { Zap, LayoutGrid, Snowflake, DoorOpen, Truck, Hammer, Archive, Droplet, ParkingSquare, type LucideIcon } from "lucide-react";
import type { VendorRequirement, VendorRequirementIcon } from "../types";
import SectionHeading from "./SectionHeading";

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

function RequirementCard({ requirement }: { requirement: VendorRequirement }) {
  const Icon = ICON_MAP[requirement.icon];
  return (
    <div className="flex items-start gap-3 rounded-xl border border-black/10 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-figtree text-[14px] font-bold text-brand-950">{requirement.label}</div>
        {requirement.description && (
          <p className="mt-0.5 font-figtree text-[12px] text-neutral-secondary">{requirement.description}</p>
        )}
      </div>
    </div>
  );
}

export default function VendorRequirements({ requirements }: { requirements: VendorRequirement[] }) {
  const mustHave = requirements.filter((r) => (r.tier ?? "must") === "must");
  const goodToHave = requirements.filter((r) => r.tier === "good");

  return (
    <section id="venue-needs" className="border-t border-black/5 pt-8">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <SectionHeading eyebrow="Your side of the setup">What we need from your venue</SectionHeading>
        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 font-figtree text-[12px] font-medium text-amber-800">
          Confirm before the event date
        </span>
      </div>

      <p className="mb-6 font-figtree text-[13px] text-neutral-secondary">
        These are arranged by you or your venue. If something isn&apos;t available, tell the vendor early — most of it
        can be worked around, some of it changes the price.
      </p>

      {mustHave.length > 0 && (
        <div className="mb-6">
          <div className="mb-3 font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
            Must have
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mustHave.map((requirement) => (
              <RequirementCard key={requirement.id} requirement={requirement} />
            ))}
          </div>
        </div>
      )}

      {goodToHave.length > 0 && (
        <div>
          <div className="mb-3 font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
            Good to have
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {goodToHave.map((requirement) => (
              <RequirementCard key={requirement.id} requirement={requirement} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
