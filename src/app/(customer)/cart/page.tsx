// src/app/(customer)/cart/page.tsx
import CartPageContent from "@/features/customer-cart/components/CartPageContent";

// Cart identity (a logged-in customer's bearer token, or an anonymous
// guest's id) only exists in the browser, so this page fetches client-side
// inside CartPageContent rather than being server-rendered.
export default function CartPage() {
  return <CartPageContent />;
}
