// src/app/auth/layout.tsx
import { Lora } from "next/font/google";
import "../(customer)/customer-theme.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
  variable: "--font-lora",
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${lora.variable} overflow-x-hidden`}>{children}</div>;
}
