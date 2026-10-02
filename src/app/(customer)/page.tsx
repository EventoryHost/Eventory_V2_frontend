// src/app/(customer)/page.tsx
import Hero from "@/features/customer-landing/components/Hero";
import SupportPageContext from "@/features/customer-support/components/SupportPageContext";

export default function CustomerLandingPage() {
  return (
    <div className="bg-white">
      <SupportPageContext pageName="Home" suggestedType="event" />
      <Hero />
      {/* next sections get added here as we build them */}
    </div>
  );
}
