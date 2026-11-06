import type { Metadata } from "next";
import BecomeVendorPageContent from "@/features/customer-become-vendor/components/BecomeVendorPageContent";

export const metadata: Metadata = {
  title: "Become a Vendor: List Your Event Business",
  description: "Join Eventory and get discovered by customers across Delhi NCR. Showcase your packages, receive booking requests and grow your event business.",
  alternates: { canonical: "/become-a-vendor" },
};

export default function BecomeVendorPage() {
  return <BecomeVendorPageContent />;
}
