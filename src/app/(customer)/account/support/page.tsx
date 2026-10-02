// src/app/(customer)/account/support/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import MyTicketsContent from "@/features/customer-support/components/MyTicketsContent";

export const metadata: Metadata = {
  title: "Help Center - Eventory",
};

// Auth gate + sidebar come from the /account layout. Tickets are read
// client-side (mock store today, EMS API later).
export default function SupportPage() {
  return (
    <Suspense fallback={null}>
      <MyTicketsContent />
    </Suspense>
  );
}
