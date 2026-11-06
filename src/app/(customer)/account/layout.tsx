// src/app/(customer)/account/layout.tsx
import type { Metadata } from "next";
import AccountShell from "@/features/customer-account/components/AccountShell";

// Private route: never indexable, in any environment (robots.txt alone does not de-index).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AccountShell>{children}</AccountShell>
    </div>
  );
}
