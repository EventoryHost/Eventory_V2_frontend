import { Calendar, Clock, Users, MapPin } from "lucide-react";
import type { EventDetails as EventDetailsData } from "../types";

const FIELDS = [
  { key: "date", icon: Calendar },
  { key: "timeRange", icon: Clock },
  { key: "location", icon: MapPin },
  { key: "guestCount", icon: Users },
] as const;

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function EventDetails({ details }: { details: EventDetailsData }) {
  const filled = FIELDS.filter(({ key }) => details[key]);
  if (filled.length === 0) return null;

  return (
    <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-3 font-figtree text-[13px] text-neutral-secondary sm:grid-cols-2">
      {filled.map(({ key, icon: Icon }) => {
        const rawValue = details[key] as string | number;
        const displayValue =
          key === "guestCount" ? `${rawValue} Guests` : key === "date" ? formatDate(rawValue as string) : rawValue;

        return (
          <div key={key} className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-brand-primary" />
            <span>{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}
