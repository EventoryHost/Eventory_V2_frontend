// src/app/(customer)/packages/page.tsx
import type { Metadata } from "next";
import { getPackagesPageData } from "@/features/customer-packages/services/getPackagesPageData";
import PackagesPageContent from "@/features/customer-packages/components/PackagesPageContent";

export const metadata: Metadata = {
  title: "Event Packages: Decorators, Caterers, DJs & More",
  description: "Explore curated event packages for birthdays, anniversaries, baby showers and corporate events in Delhi NCR. Compare what's included and book verified vendors online.",
  alternates: { canonical: "/packages" },
};

// Live inventory, not build-time content — render per-request rather than
// baking a snapshot into the static build.
export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const data = await getPackagesPageData();

  return <PackagesPageContent data={data} />;
}
