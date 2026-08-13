// src/app/(customer)/packages/[packageId]/page.tsx
import { notFound } from "next/navigation";
import { getPackageDetail, PackageNotFoundError } from "@/features/customer-package-detail/services/getPackageDetail";
import PackageDetailPage from "@/features/customer-package-detail/components/PackageDetailPage";

// Live inventory, not build-time content.
export const dynamic = "force-dynamic";

export default async function PackageDetail({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;

  try {
    const data = await getPackageDetail(packageId);
    return <PackageDetailPage data={data} />;
  } catch (error) {
    if (error instanceof PackageNotFoundError) notFound();
    throw error;
  }
}
