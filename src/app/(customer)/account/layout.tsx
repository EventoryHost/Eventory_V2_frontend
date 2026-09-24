// src/app/(customer)/account/layout.tsx
import AccountShell from "@/features/customer-account/components/AccountShell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AccountShell>{children}</AccountShell>
    </div>
  );
}
