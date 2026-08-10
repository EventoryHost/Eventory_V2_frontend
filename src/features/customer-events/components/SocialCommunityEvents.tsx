import EventPackageCarousel from "./EventPackageCarousel";
import { type EventPackageCardProps } from "./EventPackageCard";

const EVENTS: EventPackageCardProps[] = Array.from({ length: 4 }, () => ({
  image: "/images/customer/events/upcoming.jpg",
  avatars: [
    "/images/customer/user-review.png",
    "/images/customer/user-review.png",
    "/images/customer/user-review.png",
  ],
  bookedLabel: "127 booked this week",
  badge: "Trending",
  title: "Holi Party 2026 in Ghaziabad",
  description:
    "Join the Holi fun all around town and have a blast with everyone!",
}));

export default function SocialCommunityEvents() {
  return (
    <EventPackageCarousel
      heading="Social & Community Events"
      subtitle="Bringing communities together through celebration"
      events={EVENTS}
    />
  );
}
