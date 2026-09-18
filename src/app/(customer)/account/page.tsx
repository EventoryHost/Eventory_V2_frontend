// src/app/(customer)/account/page.tsx
import type { Metadata } from "next";
import AccountPageContent from "@/features/customer-account/components/AccountPageContent";

export const metadata: Metadata = {
  title: "My Account - Eventory",
};

// Everything on this page is scoped to the signed-in customer, whose bearer
// token only exists in the browser — same reasoning as the cart page, so it
// fetches client-side inside AccountPageContent. The auth gate, page chrome
// and sidebar come from the /account layout.
export default function AccountPage() {
  return <AccountPageContent />;
}
