import HeroHeading from "./HeroHeading";
import HeroSubtext from "./HeroSubtext";
import HeroSearch from "./HeroSearch";
import ExploreEvents from "./ExploreEvents";
import BrowseVendors from "./BrowseVendors";
import PackagesCarousel from "./PackagesCarousel";
import HowEventoryWorks from "./HowEventoryWorks";
import NeedHelpBanner from "./NeedHelpBanner";
import WhyChooseEventory from "./WhyChooseEventory";
import CorporateEventsBanner from "./CorporateEventsBanner";
import BrandsBar from "./BrandsBar";
import ReviewsCarousel from "./ReviewsCarousel";
import ReelsCarousel from "./ReelsCarousel";
import BlogsSection from "./BlogsSection";
import ReadyToPlanBanner from "./ReadyToPlanBanner";

const Hero = () => {
  return (
    <section className="relative isolate w-full overflow-hidden px-4 pb-10">
      {/* Design team's pre-composed gradient-spot background, replacing the
          hand-placed blur circles — see hero-bg.svg. Anchored to the very
          top of the section (flush against the navbar, no gap) rather than
          the padded content wrapper below, which starts lower. */}
      <img
        src="/images/customer/hero-bg.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 w-full object-cover"
      />

      <div className="pt-6 sm:pt-8 lg:pt-10">
        <div className="relative z-10">
          <HeroHeading />
          <HeroSubtext />
          <HeroSearch />
        </div>
      </div>
      <ExploreEvents />
      <BrowseVendors />
      <PackagesCarousel />
      <HowEventoryWorks />
      <NeedHelpBanner />
      <WhyChooseEventory />
      <CorporateEventsBanner />
      <BrandsBar />
      <ReviewsCarousel />
      <div className="h-[100px] w-full" />
      <ReelsCarousel />
      <div className="h-[100px] w-full" />
      <BlogsSection />
      <ReadyToPlanBanner />
    </section>
  );
};

export default Hero;
