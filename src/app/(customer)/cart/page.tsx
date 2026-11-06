// src/app/(customer)/cart/page.tsx
import type { Metadata } from "next";
import CartPageContent from "@/features/customer-cart/components/CartPageContent";

// Private/non-public route: never indexable, in any environment.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Cart identity (a logged-in customer's bearer token, or an anonymous
// guest's id) only exists in the browser, so this page fetches client-side
// inside CartPageContent rather than being server-rendered.
export default function CartPage() {
  return (
    <div className="bg-white">
      <CartPageContent />
    </div>
  );
}
