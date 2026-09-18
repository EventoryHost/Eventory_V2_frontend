// src/app/(customer)/account/profile/page.tsx
import type { Metadata } from "next";
import ProfileInformationContent from "@/features/customer-account/components/ProfileInformationContent";

export const metadata: Metadata = {
  title: "Profile Information - Eventory",
};

// Reads and writes the signed-in customer only, so it's client-side inside
// ProfileInformationContent. Auth gate + sidebar come from the /account layout.
export default function ProfilePage() {
  return <ProfileInformationContent />;
}
