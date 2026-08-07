// src/app/(customer)/vendors/page.tsx
import { Suspense } from "react";
import { getVendorsPageData } from "@/features/customer-vendors/services/getVendorsPageData";
import VendorsPageContent from "@/features/customer-vendors/components/VendorsPageContent";

export default async function VendorsPage() {
  const data = await getVendorsPageData();

  return (
    <Suspense fallback={null}>
      <VendorsPageContent data={data} />
    </Suspense>
  );
}
