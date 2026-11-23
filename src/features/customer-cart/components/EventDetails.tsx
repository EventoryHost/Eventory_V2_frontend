import { Fragment } from "react";
import { Users } from "lucide-react";
import type { EventDetails as EventDetailsData } from "../types";

// Figma node 3259:52570. date / time / location share one row split by thin
// dividers; the event type (and guest count, only present for packages where a
// headcount means something) sits on the row below.
const ICON_DIR = "/images/customer/cart";

const TOP_ROW_FIELDS = [
  { key: "date", icon: `${ICON_DIR}/calendar.svg` },
  { key: "timeRange", icon: `${ICON_DIR}/sun.svg` },
  { key: "location", icon: `${ICON_DIR}/map-point.svg` },
] as const;

const TEXT = "font-figtree text-[14px] leading-5.5 font-normal text-[#3F3F47]";

// "12 March, 2026"
function formatDate(value: string): string {
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  const day = parsed.toLocaleDateString("en-GB", { day: "numeric", timeZone: "UTC" });
  const month = parsed.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  const year = parsed.toLocaleDateString("en-GB", { year: "numeric", timeZone: "UTC" });
  return `${day} ${month}, ${year}`;
}

export default function EventDetails({ details }: { details: EventDetailsData }) {
  const topRowFilled = TOP_ROW_FIELDS.filter(({ key }) => details[key]);
  if (topRowFilled.length === 0 && !details.guestCount && !details.eventType) return null;

  const eventLabel = details.eventType
    ? details.eventType.charAt(0).toUpperCase() + details.eventType.slice(1)
    : null;
  const mobileRows: { key: string; icon: string; text: string }[][] = [
    [
      details.date && { key: "date", icon: `${ICON_DIR}/calendar.svg`, text: formatDate(details.date) },
      details.timeRange && { key: "time", icon: `${ICON_DIR}/sun.svg`, text: details.timeRange },
    ].filter(Boolean) as { key: string; icon: string; text: string }[],
    [
      details.location && { key: "loc", icon: `${ICON_DIR}/map-point.svg`, text: details.location },
      eventLabel && { key: "event", icon: `${ICON_DIR}/tag.svg`, text: eventLabel },
    ].filter(Boolean) as { key: string; icon: string; text: string }[],
  ].filter((row) => row.length > 0);

  return (
    <>
      {/* Mobile (Figma 3831:62751): date | time, then location | event type.
          One shared grid so both dividers sit in the same column, and every
          cell truncates with an ellipsis instead of pushing its neighbour out. */}
      <div className={`mb-2 flex flex-col gap-2 md:hidden ${TEXT}`}>
        <div className="grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-x-2 gap-y-2">
          {mobileRows.map((row, i) => (
            <Fragment key={i}>
              {[0, 1].map((j) => {
                const field = row[j];
                return (
                  <Fragment key={j}>
                    {j === 1 && <span className="h-3 w-px bg-[#E4E4E7]" aria-hidden="true" />}
                    {field ? (
                      <span className="flex min-w-0 items-center gap-2" title={field.text}>
                        <img src={field.icon} alt="" className="h-[18px] w-[18px] shrink-0" />
                        <span className="min-w-0 truncate">{field.text}</span>
                      </span>
                    ) : (
                      <span />
                    )}
                  </Fragment>
                );
              })}
            </Fragment>
          ))}
        </div>
        {details.guestCount && (
          <div className="flex items-center gap-2">
            <Users className="h-[18px] w-[18px] shrink-0 text-[#71717B]" strokeWidth={1.5} />
            {details.guestCount} Guests
          </div>
        )}
      </div>

    <div className="mb-2 hidden flex-col gap-3 md:flex">
      {topRowFilled.length > 0 && (
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-2 ${TEXT}`}>
          {topRowFilled.map(({ key, icon }, index) => (
            <span key={key} className="flex items-center gap-2">
              {index > 0 && <span className="mr-0 h-3 w-px shrink-0 bg-[#E4E4E7]" aria-hidden="true" />}
              <img src={icon} alt="" className="h-[18px] w-[18px] shrink-0" />
              {key === "date" ? formatDate(details[key] as string) : details[key]}
            </span>
          ))}
        </div>
      )}

      {(details.guestCount || details.eventType) && (
        <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${TEXT}`}>
          {details.guestCount && (
            <span className="flex items-center gap-2">
              <Users className="h-[18px] w-[18px] shrink-0 text-[#71717B]" strokeWidth={1.5} />
              {details.guestCount} Guests
            </span>
          )}
          {details.eventType && (
            <span className="flex items-center gap-2">
              <img src={`${ICON_DIR}/tag.svg`} alt="" className="h-[18px] w-[18px] shrink-0" />
              {details.eventType.charAt(0).toUpperCase() + details.eventType.slice(1)}
            </span>
          )}
        </div>
      )}
    </div>
    </>
  );
}
