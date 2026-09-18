// src/app/(customer)/account/payments/page.tsx
import type { Metadata } from "next";
import PaymentDetailsContent from "@/features/customer-account/components/PaymentDetailsContent";

export const metadata: Metadata = {
  title: "Payment Details - Eventory",
};

// Auth gate + sidebar come from the /account layout.
export default function PaymentDetailsPage() {
  return <PaymentDetailsContent />;
}
