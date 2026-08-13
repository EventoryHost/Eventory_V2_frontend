// src/app/(customer)/packages/page.tsx
import { getPackagesPageData } from "@/features/customer-packages/services/getPackagesPageData";
import PackagesPageContent from "@/features/customer-packages/components/PackagesPageContent";

// Live inventory, not build-time content — render per-request rather than
// baking a snapshot into the static build.
export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const data = await getPackagesPageData();

  return <PackagesPageContent data={data} />;
}
