// src/app/(checkout)/payment/return/page.tsx
import { Suspense } from "react";
import PaymentReturnPage from "@/features/customer-payment/components/PaymentReturnPage";

export default function PaymentReturn() {
  return (
    <Suspense fallback={null}>
      <PaymentReturnPage />
    </Suspense>
  );
}
