// src/app/(customer)/page.tsx
import type { Metadata } from "next";
import Hero from "@/features/customer-landing/components/Hero";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function CustomerLandingPage() {
  return (
    <div className="bg-white">
      <Hero />
      {/* next sections get added here as we build them */}
    </div>
  );
}
