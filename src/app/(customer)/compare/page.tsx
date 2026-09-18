// src/app/(customer)/compare/page.tsx
import type { Metadata } from "next";
import ComparePageContent from "@/features/customer-compare/components/ComparePageContent";

export const metadata: Metadata = {
  title: "Comparing Packages - Eventory",
};

// The comparison lives in the customer's own session behind an authenticated
// endpoint, so the page loads it client-side (and sends signed-out visitors
// to the auth screen) rather than rendering anything on the server.
export default function ComparePage() {
  return <ComparePageContent />;
}
