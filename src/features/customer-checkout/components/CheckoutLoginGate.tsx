"use client";

import { useState } from "react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import AuthModal from "@/features/customer-auth/components/AuthModal";

/**
 * Wraps Review/Details/Payment's page content — checkout has no guest
 * equivalent (every /checkout/session, /payments, etc. endpoint requires a
 * logged-in customer, see book-api.pdf's Auth model), unlike Cart, which is
 * soft-authed. Without this, a logged-out visitor landing directly on one
 * of these routes (shared link, stale bookmark, session expiring mid-flow)
 * would just see useBookingSummaryData's normal error state — a raw
 * "Request failed with status 401" — instead of a way to actually log in.
 *
 * Pair with useBookingSummaryData, which already skips its own fetch while
 * logged out and re-fetches automatically the moment isLoggedIn flips true,
 * so no explicit "refresh after login" callback is needed here.
 */
export default function CheckoutLoginGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useCustomerSession();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (isLoggedIn) return <>{children}</>;

  return (
    <>
      <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-[#E4E4E7] bg-white py-16 text-center">
        <p className="font-figtree text-[15px] text-[#3F3F47]">
          Log in to view and continue your booking.
        </p>
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="rounded-full bg-[#F0596F] px-6 py-2.5 font-figtree text-[14px] font-semibold text-white"
        >
          Log in
        </button>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
