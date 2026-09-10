import { Calendar, Clock, Users, MapPin, PartyPopper } from "lucide-react";
import type { EventDetails as EventDetailsData } from "../types";

// date/time/location on their own row; guestCount is absent entirely for
// Decorator/DJ/Photographer packages (a headcount isn't meaningful for
// those — see StickyBookingCard's requiresGuestCount), so it and eventType
// (real, structured data from item.eventDetails.eventType) share the row
// below instead, matching the design.
const TOP_ROW_FIELDS = [
  { key: "date", icon: Calendar },
  { key: "timeRange", icon: Clock },
  { key: "location", icon: MapPin },
] as const;

const ICON_COLOR = "#B4112A";

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function EventDetails({ details }: { details: EventDetailsData }) {
  const topRowFilled = TOP_ROW_FIELDS.filter(({ key }) => details[key]);
  if (topRowFilled.length === 0 && !details.guestCount && !details.eventType) return null;

  return (
    <div className="mb-3 flex flex-col gap-2">
      {topRowFilled.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-figtree text-[14px] leading-5.5 font-normal text-[#3F3F47]">
          {topRowFilled.map(({ key, icon: Icon }) => (
            <span key={key} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 shrink-0" style={{ color: ICON_COLOR }} strokeWidth={1.33} />
              {key === "date" ? formatDate(details[key] as string) : details[key]}
            </span>
          ))}
        </div>
      )}

      {(details.guestCount || details.eventType) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-figtree text-[14px] leading-5.5 font-normal text-[#3F3F47]">
          {details.guestCount && (
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 shrink-0" style={{ color: ICON_COLOR }} strokeWidth={1.33} />
              {details.guestCount} Guests
            </span>
          )}
          {details.eventType && (
            <span className="flex items-center gap-1.5">
              <PartyPopper className="h-4 w-4 shrink-0" style={{ color: ICON_COLOR }} strokeWidth={1.33} />
              {details.eventType.charAt(0).toUpperCase() + details.eventType.slice(1)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
