// src/app/(customer)/packages/browse/page.tsx
import { Suspense } from "react";
import { getPackageListingData } from "@/features/customer-package-listing/services/getPackageListingData";
import PackageListingContent from "@/features/customer-package-listing/components/PackageListingContent";

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
