import { Package, Ruler, Clock, Users } from "lucide-react";
import type { PackageDetail } from "../types";
import SectionHeading from "./SectionHeading";

export default function PackageSummary({ summary }: { summary: PackageDetail["summary"] }) {
  const rows = [
    { icon: Package, label: "Setups", value: summary.setupsLabel },
    { icon: Ruler, label: "Setup coverage", value: summary.setupCoverage },
    { icon: Clock, label: "Setup time", value: summary.setupTime },
    { icon: Users, label: "Crew size", value: summary.crewSize },
  ].filter((row) => row.value);

  return (
    <section className="border-t border-black/5 pt-8">
      <SectionHeading>Package includes</SectionHeading>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3">
            <row.icon className="mt-0.5 h-5 w-5 shrink-0 text-neutral-tertiary" />
            <div>
              <div className="mb-0.5 font-figtree text-[11px] text-neutral-tertiary">{row.label}</div>
              <div className="font-figtree text-[14px] font-medium text-brand-950">{row.value}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 rounded-full border border-black/15 px-5 py-2 font-figtree text-[13px] font-medium text-brand-950 transition hover:bg-black/5"
      >
        See all 8 features
      </button>
    </section>
  );
}
