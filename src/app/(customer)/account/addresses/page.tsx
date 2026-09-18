// src/app/(customer)/account/addresses/page.tsx
import type { Metadata } from "next";
import SavedAddressContent from "@/features/customer-account/components/SavedAddressContent";

export const metadata: Metadata = {
  title: "Saved Address - Eventory",
};

// Reads and writes the signed-in customer's own addresses, so it's
// client-side. Auth gate + sidebar come from the /account layout.
export default function SavedAddressPage() {
  return <SavedAddressContent />;
}
