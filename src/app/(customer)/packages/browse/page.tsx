// src/app/(customer)/packages/browse/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { getPackageListingData } from "@/features/customer-package-listing/services/getPackageListingData";
import PackageListingContent from "@/features/customer-package-listing/components/PackageListingContent";

export const metadata: Metadata = {
  title: "Browse Event Packages in Delhi NCR",
  description: "Filter event packages by event type, area, budget and date. Compare decorators and other verified vendors across Delhi NCR and book online.",
  alternates: { canonical: "/packages/browse" },
};

// Live inventory — rendered per request rather than baked into the static
// build, same reasoning as /vendors and /packages.
export const dynamic = "force-dynamic";

export default async function PackageBrowsePage() {
  const data = await getPackageListingData();

  return (
    <Suspense fallback={null}>
      <PackageListingContent data={data} />
    </Suspense>
  );
}
