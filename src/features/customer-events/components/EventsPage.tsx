import TrendingEventsCarousel from "./TrendingEventsCarousel";
import FeaturedUpcomingEvents from "./FeaturedUpcomingEvents";
import EventCategoriesCarousel from "./EventCategoriesCarousel";
import EventCalendarSection from "./EventCalendarSection";
import PackagesCarousel from "@/features/customer-landing/components/PackagesCarousel";
import PlanningSomethingSpecialBanner from "./PlanningSomethingSpecialBanner";
import MoreEventsToExplore from "./MoreEventsToExplore";
import HappyCustomersStats from "./HappyCustomersStats";

export default function EventsPage() {
  return (
    <div className="w-full bg-white">
      <div className="w-full py-10 pl-4 sm:pl-6 lg:pl-16">
        <TrendingEventsCarousel />
      </div>
      <FeaturedUpcomingEvents />
      <div className="w-full py-10 pl-4 sm:pl-6 lg:pl-16">
        <EventCategoriesCarousel />
      </div>
      {/* Social & Community Events — hidden for now, PM request. */}
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:gap-8 lg:px-16">
        <EventCalendarSection />
      </div>
      <div className="w-full px-4 py-10 sm:px-6 lg:px-16">
        <PackagesCarousel />
      </div>
      <PlanningSomethingSpecialBanner />
      <MoreEventsToExplore />
      <HappyCustomersStats />
    </div>
  );
}
