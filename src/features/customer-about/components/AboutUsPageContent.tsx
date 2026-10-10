import HeroSection from "./HeroSection";
import OurStorySection from "./OurStorySection";

// More sections land here as the About Us page is built out further.
export default function AboutUsPageContent() {
  return (
    <div className="w-full bg-white">
      <HeroSection />
      <OurStorySection />
    </div>
  );
}
