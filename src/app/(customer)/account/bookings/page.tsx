// src/app/(customer)/account/bookings/page.tsx
import type { Metadata } from "next";
import BookingsContent from "@/features/customer-account/components/BookingsContent";

export const metadata: Metadata = {
  title: "Bookings - Eventory",
};

// Auth gate + sidebar come from the /account layout.
export default function BookingsPage() {
  return <BookingsContent />;
}
