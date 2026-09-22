// src/app/(customer)/vendors/[vendorId]/page.tsx
import { getVendorProfileData } from "@/features/customer-vendor-profile/services/getVendorProfileData";
import VendorProfilePageContent from "@/features/customer-vendor-profile/components/VendorProfilePageContent";

// Live vendor data (packages, reviews, wishlist counts all move) — rendered
// per request rather than baked into the static build, same reasoning as
// the /vendors listing.
export const dynamic = "force-dynamic";

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  const data = await getVendorProfileData(vendorId);

  return <VendorProfilePageContent data={data} />;
}
