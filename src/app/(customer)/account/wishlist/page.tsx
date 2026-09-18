// src/app/(customer)/account/wishlist/page.tsx
import type { Metadata } from "next";
import WishlistContent from "@/features/customer-account/components/WishlistContent";

export const metadata: Metadata = {
  title: "Wishlist - Eventory",
};

// Auth gate + sidebar come from the /account layout.
export default function WishlistPage() {
  return <WishlistContent />;
}
