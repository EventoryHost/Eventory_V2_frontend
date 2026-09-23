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

  // key={packageId} forces React to unmount/remount PackageDetailPage on a
  // client-side navigation between two packages, resetting its local state
  // (vendorNote, workshop customizations, etc.) — without it, React reuses
  // the same component instance since it's the same component type, so
  // leftover state like a typed note silently carries over to the next
  // package viewed in the same session.
  return <PackageDetailPage key={packageId} data={data} editItemId={editItemId} />;
}
