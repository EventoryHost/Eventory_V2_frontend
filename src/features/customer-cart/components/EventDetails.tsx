import { Calendar, Clock, Users, MapPin, SquarePen } from "lucide-react";
import type { EventDetails as EventDetailsData } from "../types";

const FIELDS = [
  { key: "date", icon: Calendar, label: "Date" },
  { key: "timeRange", icon: Clock, label: "Time" },
  { key: "guestCount", icon: Users, label: "Guests" },
  { key: "location", icon: MapPin, label: "Location" },
] as const;

export default function EventDetails({
  details,
  onEdit,
}: {
  details: EventDetailsData;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 border-t border-black/5 bg-[#F9F9F9] p-6">
      <div className="grid w-full grid-cols-2 gap-6 sm:w-auto sm:flex-1 sm:grid-cols-4">
        {FIELDS.map(({ key, icon: Icon, label }) => {
          const rawValue = details[key];
          const isEmpty = !rawValue;
          const displayValue =
            key === "guestCount" && rawValue ? `${rawValue} Guests` : rawValue ?? "—";

          return (
            <div key={key} className="space-y-1">
              <div
                className={`flex items-center gap-2 ${
                  isEmpty ? "text-neutral-tertiary" : "text-brand-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-figtree text-[11px] font-bold tracking-tight uppercase">
                  {label}
                </span>
              </div>
              <div
                className={`font-figtree text-[14px] font-semibold ${
                  isEmpty ? "text-neutral-tertiary" : "text-neutral-primary"
                }`}
              >
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-2 rounded-full border border-neutral-tertiary/40 px-4 py-2 font-figtree text-[13px] font-semibold text-neutral-primary transition-colors hover:bg-white"
      >
        <SquarePen className="h-4 w-4" /> Edit
      </button>
    </div>
  );
}
