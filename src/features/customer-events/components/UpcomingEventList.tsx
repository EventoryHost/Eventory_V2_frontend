import UpcomingEventListItem, {
  type UpcomingEventListItemProps,
} from "./UpcomingEventListItem";
import {
  getEventImage,
  getFixedEventsOnDate,
  getSeasonalEventsInMonth,
} from "@/lib/eventCalendarData";

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long" });

function vendorServicesDescription(name: string, vendorServices: string[]): string {
  if (vendorServices.length === 0) {
    return `Discover top-rated vendors for ${name} celebrations near you.`;
  }
  return `Top services booked for ${name}: ${vendorServices.join(", ")}.`;
}

export type UpcomingEventListProps = {
  /** The calendar day currently selected — the list shows events relevant to it. */
  date: Date;
};

export default function UpcomingEventList({ date }: UpcomingEventListProps) {
  const fixedEvents = getFixedEventsOnDate(date);
  const seasonalEvents = fixedEvents.length === 0 ? getSeasonalEventsInMonth(date.getMonth() + 1) : [];

  const events: UpcomingEventListItemProps[] = [
    ...fixedEvents.map((e) => ({
      image: getEventImage(e.name),
      title: e.name,
      description: vendorServicesDescription(e.name, e.vendorServices),
    })),
    ...seasonalEvents.map((e) => ({
      image: getEventImage(e.name),
      title: e.name,
      description: `Typically happens ${e.rangeLabel} — explore vendors who specialize in ${e.name.toLowerCase()} planning.`,
    })),
  ];

  return (
    <div className="flex w-full max-w-[646px] flex-col gap-4">
      <h3 className="font-figtree text-[16px] font-semibold text-body-secondary">
        {fixedEvents.length > 0
          ? `Events on ${DATE_FORMAT.format(date)}`
          : seasonalEvents.length > 0
            ? `Nothing on ${DATE_FORMAT.format(date)} — but this season is popular for`
            : `No major events on ${DATE_FORMAT.format(date)}`}
      </h3>

      {events.length > 0 ? (
        events.map((event, i) => <UpcomingEventListItem key={i} {...event} />)
      ) : (
        <UpcomingEventListItem
          image="/images/customer/events/upcoming.jpg"
          title="Plan something anyway"
          description="Browse packages from verified vendors near you for this date."
        />
      )}
    </div>
  );
}
