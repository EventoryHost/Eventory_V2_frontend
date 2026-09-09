import { Calendar, Clock, Users, MapPin, PartyPopper } from "lucide-react";
import type { EventDetails as EventDetailsData } from "../types";

// eventType is real, structured data from the backend (item.eventDetails.eventType,
// set independently of the freeform specialRequest/vendor-note field — the
// "Event type: X" text seen in mock data was a coincidence of that one mock
// record, not an actual convention specialRequest carries). It's rendered as
// its own row below date/time/location, matching the design's
// date -> time -> location -> event order.
const ROW_FIELDS = [
  { key: "date", icon: Calendar },
  { key: "timeRange", icon: Clock },
  { key: "location", icon: MapPin },
  { key: "guestCount", icon: Users },
] as const;

const ICON_COLOR = "#B4112A";

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function EventDetails({ details }: { details: EventDetailsData }) {
  const filled = ROW_FIELDS.filter(({ key }) => details[key]);
  if (filled.length === 0 && !details.eventType) return null;

  return (
    <div className="mb-3 flex flex-col gap-2">
      {filled.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-figtree text-[13px] text-neutral-secondary">
          {filled.map(({ key, icon: Icon }) => {
            const rawValue = details[key] as string | number;
            const displayValue =
              key === "guestCount"
                ? `${rawValue} Guests`
                : key === "date"
                  ? formatDate(rawValue as string)
                  : rawValue;

            return (
              <span key={key} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 shrink-0" style={{ color: ICON_COLOR }} strokeWidth={1.33} />
                {displayValue}
              </span>
            );
          })}
        </div>
      )}

      {details.eventType && (
        <span className="flex items-center gap-1.5 font-figtree text-[13px] text-neutral-secondary">
          <PartyPopper className="h-4 w-4 shrink-0" style={{ color: ICON_COLOR }} strokeWidth={1.33} />
          {details.eventType.charAt(0).toUpperCase() + details.eventType.slice(1)}
        </span>
      )}
    </div>
  );
}
