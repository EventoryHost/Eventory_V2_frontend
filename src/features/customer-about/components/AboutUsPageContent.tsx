import HeroSection from "./HeroSection";
import OurStorySection from "./OurStorySection";
import OurValuesSection from "./OurValuesSection";
import MeetTeamSection from "./MeetTeamSection";
import LocalitiesSection from "@/features/customer-become-vendor/components/LocalitiesSection";
import BlogsSection from "@/features/customer-landing/components/BlogsSection";
import ReadyToBringVisionSection from "./ReadyToBringVisionSection";

// More sections land here as the About Us page is built out further.
export default function AboutUsPageContent() {
  return (
    <div className="w-full bg-white">
      <HeroSection />
      <OurStorySection />
      <OurValuesSection />
      <MeetTeamSection />
      <LocalitiesSection variant="pink" />
      <BlogsSection />
      <ReadyToBringVisionSection />
    </div>
  );
}
