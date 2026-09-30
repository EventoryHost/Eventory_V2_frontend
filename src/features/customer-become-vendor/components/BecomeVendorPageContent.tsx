import HeroSection from "./HeroSection";

// Built section by section per the design handoff — Hero is the first.
// Nothing dynamic yet (no data fetch), so the page.tsx above this stays a
// plain server component.
export default function BecomeVendorPageContent() {
  return (
    <div>
      <HeroSection />
    </div>
  );
}
