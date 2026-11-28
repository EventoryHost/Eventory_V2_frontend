// src/app/(customer)/contact/page.tsx
import { Suspense } from "react";
import ContactPage from "@/features/customer-contact/components/ContactPage";

export default function Contact() {
  return (
    <Suspense fallback={null}>
      <ContactPage />
    </Suspense>
  );
}
