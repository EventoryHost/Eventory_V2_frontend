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
      className={`${lora.variable} min-h-screen flex flex-col overflow-x-hidden bg-customer-bg text-brand-950`}
    >
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
