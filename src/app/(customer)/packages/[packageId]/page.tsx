// src/app/(customer)/packages/[packageId]/page.tsx
import { notFound } from "next/navigation";
import { getPackageDetail, PackageNotFoundError } from "@/features/customer-package-detail/services/getPackageDetail";
import PackageDetailPage from "@/features/customer-package-detail/components/PackageDetailPage";

// Live inventory, not build-time content.
export const dynamic = "force-dynamic";

export default async function PackageDetail({
  params,
  searchParams,
}: {
  params: Promise<{ packageId: string }>;
  searchParams: Promise<{ editItemId?: string }>;
}) {
  const { packageId } = await params;
  const { editItemId } = await searchParams;

  let data;
  try {
    data = await getPackageDetail(packageId);
  } catch (error) {
    if (error instanceof PackageNotFoundError) notFound();
    throw error;
  }

  return <PackageDetailPage data={data} editItemId={editItemId} />;
}
