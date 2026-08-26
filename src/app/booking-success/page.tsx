// src/app/booking-success/page.tsx
import { Suspense } from "react";
import BookingSuccessPage from "@/features/customer-payment/components/BookingSuccessPage";

export default function BookingSuccess() {
  return (
    <Suspense fallback={null}>
      <BookingSuccessPage />
    </Suspense>
  );
}
