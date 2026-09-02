// src/app/(customer)/layout.tsx
import { Lora } from "next/font/google";
import Navbar from "@/features/customer-landing/components/Navbar";
import Footer from "@/features/customer-landing/components/Footer";
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
      <Footer />
    </div>
  );
}
