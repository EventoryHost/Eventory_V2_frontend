"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import AccountSidebar from "./AccountSidebar";

/**
 * Shared chrome for every /account/* route: the auth gate and the sidebar.
 * Lives in the route layout so the sidebar isn't torn down and re-mounted
 * (losing its scroll position, and re-firing the session's profile refresh)
 * on each navigation between account pages.
 */
export default function AccountShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isHydrated } = useCustomerSession();
  const router = useRouter();

  // Every endpoint behind these pages is customer-scoped, so a signed-out
  // visitor goes to the auth screen and comes back here afterwards.
  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.replace("/register?redirectTo=/account");
  }, [isHydrated, isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="text-[14px] text-[#71717B]">Taking you to sign in…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-start">
      <AccountSidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
    </div>
  );
}
