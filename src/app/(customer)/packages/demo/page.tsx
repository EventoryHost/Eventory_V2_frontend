// src/app/(customer)/packages/demo/page.tsx
import PackageDetailPage from "@/features/customer-package-detail/components/PackageDetailPage";
import { mockPackageDetail } from "@/features/customer-package-detail/data/mockPackageDetailData";

// Fully static preview of the PDP layout — no backend fetch, always renders
// the same example package regardless of backend availability. This literal
// route ("demo") takes precedence over the [packageId] dynamic route below
// it. Linked from the last card on /vendors so anyone can see how the PDP
// looks without depending on live package data.
export default function PackageDetailDemoPage() {
  return <PackageDetailPage data={mockPackageDetail} />;
}
