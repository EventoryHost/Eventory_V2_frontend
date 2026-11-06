// src/app/(customer)/vendors/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { getVendorsPageData } from "@/features/customer-vendors/services/getVendorsPageData";
import VendorsPageContent from "@/features/customer-vendors/components/VendorsPageContent";

export const metadata: Metadata = {
  title: "Verified Event Vendors in Delhi NCR",
  description: "Browse verified decorators and other event vendors in Delhi NCR. See ratings, experience, service areas and packages before you book.",
  alternates: { canonical: "/vendors" },
};

// Live inventory, not build-time content — render per-request rather than
// baking a snapshot into the static build (also avoids the build needing a
// reachable backend at all).
export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const data = await getVendorsPageData();

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Suspense fallback={null}>
        <VendorsPageContent data={data} />
      </Suspense>
    </div>
  );
}
