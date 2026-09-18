// src/app/(customer)/account/viewed/page.tsx
import type { Metadata } from "next";
import ViewedItemsContent from "@/features/customer-account/components/ViewedItemsContent";

export const metadata: Metadata = {
  title: "Viewed Items - Eventory",
};

// Auth gate + sidebar come from the /account layout.
export default function ViewedItemsPage() {
  return <ViewedItemsContent />;
}
