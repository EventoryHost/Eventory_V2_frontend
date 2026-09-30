import HeroSection from "./HeroSection";
import WhyChooseSection from "./WhyChooseSection";
import GrowBusinessSection from "./GrowBusinessSection";
import HowItWorksSection from "./HowItWorksSection";

// Built section by section per the design handoff — Hero, then Why Choose
// Eventory, then the Grow Your Business CTA card, then How It Works.
// Nothing dynamic yet (no data fetch), so the page.tsx above this stays a
// plain server component.
export default function BecomeVendorPageContent() {
  return (
    <div>
      <HeroSection />
      <WhyChooseSection />
      <GrowBusinessSection />
      <HowItWorksSection />
    </div>
  );
}
