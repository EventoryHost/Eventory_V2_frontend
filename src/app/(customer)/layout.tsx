// src/app/(customer)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { Lora } from "next/font/google";
import Navbar from "@/features/customer-landing/components/Navbar";
import Footer from "@/features/customer-landing/components/Footer";
import BecomeVendorFooter from "@/features/customer-become-vendor/components/BecomeVendorFooter";
import HelpWidget from "@/features/customer-help/components/HelpWidget";
import "./customer-theme.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
  variable: "--font-lora",
});

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Become a Vendor got its own footer redesign (Figma node 2438:22038)
  // that's explicitly scoped to that one page — every other page under this
  // shared layout keeps the original Footer.
  const pathname = usePathname();
  const isBecomeVendorPage = pathname === "/become-a-vendor";

  return (
    <div
      // overflow-x-hidden (without overflow-y set) gets promoted by the CSS
      // spec to overflow-y: auto, turning this into its own scroll container
      // — which breaks `position: sticky` on any descendant (e.g. the PDP's
      // StickyBookingCard), since sticky resolves against its nearest
      // scrolling ancestor, not necessarily the page viewport.
      // overflow-x-clip prevents the same horizontal overflow without
      // establishing a scroll container, so sticky descendants stick to the
      // real viewport as expected.
      className={`${lora.variable} min-h-screen flex flex-col overflow-x-clip bg-customer-bg text-brand-950`}
    >
      <Navbar />
      <main className="flex-1">{children}</main>
      {isBecomeVendorPage ? <BecomeVendorFooter /> : <Footer />}
      <HelpWidget />
    </div>
  );
}
