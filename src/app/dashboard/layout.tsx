import type { Metadata } from "next";
import DashboardShell from "./DashboardShell";

// Vendor dashboard: private, never indexable. The client-side shell (auth guard, bottom nav) lives in DashboardShell.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
