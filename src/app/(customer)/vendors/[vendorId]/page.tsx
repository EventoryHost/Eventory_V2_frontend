// src/app/(customer)/vendors/[vendorId]/page.tsx
import { cache } from "react";
import type { Metadata } from "next";
import { getVendorProfileData } from "@/features/customer-vendor-profile/services/getVendorProfileData";
import VendorProfilePageContent from "@/features/customer-vendor-profile/components/VendorProfilePageContent";

// Live vendor data (packages, reviews, wishlist counts all move) — rendered
// per request rather than baked into the static build, same reasoning as
// the /vendors listing.
export const dynamic = "force-dynamic";

// One fetch per request, shared by generateMetadata and the page itself.
const loadVendor = cache(getVendorProfileData);

const trim = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

export async function generateMetadata({ params }: { params: Promise<{ vendorId: string }> }): Promise<Metadata> {
  const { vendorId } = await params;
  const { vendor } = await loadVendor(vendorId);
  // vendor.name is the vendor's own name (pocName) — never the business name.
  const title = trim(`${vendor.name} – ${vendor.categoryLabel || "Event Vendor"} in Delhi NCR`, 60);
  const about = vendor.description.replace(/\s+/g, " ").trim();
  const description = about
    ? trim(about, 155)
    : `See ${vendor.name}'s packages, reviews and service areas on Eventory and book online.`;
  const image = vendor.coverImage ?? vendor.avatar;
  return {
    title,
    description,
    alternates: { canonical: `/vendors/${vendorId}` },
    openGraph: { title, description, ...(image && { images: [image] }) },
  };
}

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;
  const data = await loadVendor(vendorId);

  return <VendorProfilePageContent data={data} />;
}
