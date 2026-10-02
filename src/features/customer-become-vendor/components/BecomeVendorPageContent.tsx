import HeroSection from "./HeroSection";
import WhyChooseSection from "./WhyChooseSection";
import GrowBusinessSection from "./GrowBusinessSection";
import HowItWorksSection from "./HowItWorksSection";
import VendorTestimonialsSection from "./VendorTestimonialsSection";
import PricingComparisonSection from "./PricingComparisonSection";
import LocalitiesSection from "./LocalitiesSection";
import FAQSection from "./FAQSection";

// Built section by section per the design handoff — Hero, then Why Choose
// Eventory, then the Grow Your Business CTA card, then How It Works, then
// the vendor video testimonials carousel, then the pricing comparison +
// commission calculator, then the live-localities accordion, then FAQs.
// Nothing dynamic yet (no data fetch), so the page.tsx above this stays a
// plain server component.
export default function BecomeVendorPageContent() {
  return (
    <div>
      <HeroSection />
      <WhyChooseSection />
      <GrowBusinessSection />
      <HowItWorksSection />
      <VendorTestimonialsSection />
      <PricingComparisonSection />
      <LocalitiesSection />
      <FAQSection />
    </div>
  );
}
