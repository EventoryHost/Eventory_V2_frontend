// src/app/(customer)/packages/page.tsx
import { getPackagesPageData } from "@/features/customer-packages/services/getPackagesPageData";
import PackagesPageContent from "@/features/customer-packages/components/PackagesPageContent";

export default async function PackagesPage() {
  const data = await getPackagesPageData();

  return <PackagesPageContent data={data} />;
}
