// src/app/(customer)/vendors/page.tsx
import { Suspense } from "react";
import { getVendorsPageData } from "@/features/customer-vendors/services/getVendorsPageData";
import VendorsPageContent from "@/features/customer-vendors/components/VendorsPageContent";

// Live inventory, not build-time content — render per-request rather than
// baking a snapshot into the static build (also avoids the build needing a
// reachable backend at all).
export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const data = await getVendorsPageData();

  return (
    <div className="bg-white">
      <Suspense fallback={null}>
        <VendorsPageContent data={data} />
      </Suspense>
    </div>
  );
}
