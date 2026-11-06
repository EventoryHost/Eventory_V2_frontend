// src/app/auth/layout.tsx
import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "../(customer)/customer-theme.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
  variable: "--font-lora",
});

// Private route: never indexable, in any environment (robots.txt alone does not de-index).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${lora.variable} overflow-x-hidden`}>{children}</div>;
}
