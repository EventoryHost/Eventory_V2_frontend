// src/app/(checkout)/layout.tsx
import { Lora } from "next/font/google";
import CheckoutNavbar from "@/features/customer-checkout/components/CheckoutNavbar";
import CheckoutStepper from "@/features/customer-checkout/components/CheckoutStepper";
import Footer from "@/features/customer-landing/components/Footer";
import "../(customer)/customer-theme.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
  variable: "--font-lora",
});

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${lora.variable} min-h-screen flex flex-col overflow-x-hidden bg-customer-bg text-brand-950`}
    >
      <CheckoutNavbar />
      <CheckoutStepper />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
