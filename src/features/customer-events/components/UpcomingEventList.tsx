import UpcomingEventListItem, {
  type UpcomingEventListItemProps,
} from "./UpcomingEventListItem";

const EVENTS: UpcomingEventListItemProps[] = Array.from(
  { length: 2 },
  () => ({
    image: "/images/customer/events/holi-party.jpg",
    title: "Holi Party 2026",
    description: "Join the Holi fun all around town and have a blast with everyone!",
    priceLabel: "Staring packages from ₹2500",
  })
);

export default function UpcomingEventList() {
  return (
    <div className="flex w-full max-w-[646px] flex-col gap-4">
      {EVENTS.map((event, i) => (
        <UpcomingEventListItem key={i} {...event} />
      ))}
    </div>
  );
}
