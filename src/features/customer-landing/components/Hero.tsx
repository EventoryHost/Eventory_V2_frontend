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
    <section className="w-full px-4 pt-16 pb-10 sm:pt-20 lg:pt-24">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-[#FFFAF1] blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-[-80px] h-[300px] w-[300px] rounded-full bg-[#FFFAF1] blur-3xl" />
        <div className="pointer-events-none absolute top-[220px] right-[40px] h-[220px] w-[220px] rounded-full bg-[#FFFAF1] blur-3xl" />

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
