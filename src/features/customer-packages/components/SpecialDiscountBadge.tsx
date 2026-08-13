import { BadgePercent } from "lucide-react";

export default function SpecialDiscountBadge({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-brand-primary px-2.5 py-1 font-figtree text-[10px] font-bold uppercase tracking-wide text-white sm:px-3 sm:text-[11px]">
      <BadgePercent className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
