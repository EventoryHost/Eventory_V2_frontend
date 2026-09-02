import { Package, MapPin, Clock, Users } from "lucide-react";
import type { PackageDetail } from "../types";
import SectionHeading from "./SectionHeading";

// Indoor / Outdoor / Sample decoration rows were dropped per backend team
// confirmation — no schema field exists for these on any vendor type yet
// (a real product decision still pending on which vendor types + shape), so
// this only renders the 4 rows that are genuinely backed by real data:
// step2_productsAndPricing.setups, Vendor.serviceAreas/city,
// step1_eventAndCrew.duration, step1_eventAndCrew.crewSize.
export default function PackageSummary({ summary }: { summary: PackageDetail["summary"] }) {
  const rows = [
    { icon: Package, label: "Setups", value: summary.setupsLabel },
    { icon: MapPin, label: "Service area", value: summary.serviceArea },
    { icon: Clock, label: "Setup time", value: summary.setupTime },
    { icon: Users, label: "Crew size", value: summary.crewSize },
  ].filter((row) => row.value && row.value !== "—");

  if (rows.length === 0) return null;

  return (
    <section className="border-t border-black/5 pt-8">
      <SectionHeading>Package Summary</SectionHeading>

      <div className="grid grid-cols-1 gap-y-6 gap-x-10 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3">
            <row.icon className="mt-0.5 h-5 w-5 shrink-0 text-neutral-tertiary" strokeWidth={1.5} />
            <div>
              <div className="mb-0.5 font-figtree text-[13px] text-neutral-tertiary">{row.label}</div>
              <div className="font-figtree text-[15px] font-medium text-brand-950">{row.value}</div>
            </div>
          </div>
        ))}
      </div>

      {rows.length > 6 && (
        <button
          type="button"
          className="mt-8 rounded-full border border-black/15 px-5 py-2.5 font-figtree text-[14px] font-medium text-brand-950 transition hover:bg-black/5"
        >
          See all Features
        </button>
      )}
    </section>
  );
}
