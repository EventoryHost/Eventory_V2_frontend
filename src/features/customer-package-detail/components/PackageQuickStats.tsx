import type { PackageDetail } from "../types";

export default function PackageQuickStats({ summary }: { summary: PackageDetail["summary"] }) {
  const rows = [
    { label: "Setup coverage", value: summary.setupCoverage },
    { label: "Setup time", value: summary.setupTime },
    { label: "Crew", value: summary.crewSize },
    { label: "Indoor / Outdoor", value: summary.indoorOutdoor },
    { label: "Sample decoration", value: summary.sampleDecoration },
    { label: "Service area", value: summary.serviceArea },
  ].filter((row) => row.value);

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-2xl border border-black/10 p-6 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="mb-0.5 font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
            {row.label}
          </div>
          <div className="font-figtree text-[14px] font-medium text-brand-950">{row.value}</div>
        </div>
      ))}
    </div>
  );
}
