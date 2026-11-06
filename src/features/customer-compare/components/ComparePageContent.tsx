"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, X } from "lucide-react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { useComparisonView } from "../hooks/useComparisonView";
import CompareTable from "./CompareTable";

/**
 * Side-by-side package comparison (node 1200:2536). The comparison itself is
 * a server-side session the customer fills from their wishlist ("Compare
 * Packages"), so this page has no query string of its own — it renders
 * whatever GET /customer/compare currently holds.
 *
 * The package listing's own "Compare now" flow instead opens CompareModal
 * in place — same data/logic via useComparisonView, just without navigating
 * away from the listing. This full page remains for the wishlist's own
 * "Compare Packages" entry point and for a directly-shared /compare link.
 */
export default function ComparePageContent() {
  const { isLoggedIn, isHydrated } = useCustomerSession();
  const router = useRouter();
  const { view, error, hasSettled, handleRemove, packageCount } = useComparisonView(isHydrated && isLoggedIn);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn) router.replace("/register?redirectTo=/compare");
  }, [isHydrated, isLoggedIn, router]);

  return (
    <div className="bg-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E4E7] px-4 py-6 sm:px-6 lg:px-16">
        <div className="flex flex-col gap-1">
          <h1 className="text-[24px] font-semibold leading-8 text-[#030303]">Comparing Packages</h1>
          <p className="text-[16px] leading-6 text-[#71717B]">
            {packageCount > 0
              ? `Comparing ${packageCount} ${packageCount === 1 ? "Package" : "Packages"}`
              : "Nothing to compare yet"}
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-[10px] border border-[#E4E4E7] bg-white px-3 py-1.5 text-[14px] font-semibold leading-5 text-[#030303] transition-colors hover:bg-[#FAFAFA]"
          >
            <Printer className="h-5 w-5" />
            Print/Export
          </button>
          <button
            type="button"
            onClick={() => router.push("/account/wishlist")}
            aria-label="Close the comparison"
            className="flex items-center rounded-[10px] border border-[#E4E4E7] bg-white p-1.5 text-[#030303] transition-colors hover:bg-[#FAFAFA]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-6 sm:px-6 lg:px-16">
        {!hasSettled ? (
          <p className="text-[14px] leading-5 text-[#71717B]">Loading your comparison…</p>
        ) : error ? (
          <p className="text-[14px] leading-5 text-[#C81E0D]">{error}</p>
        ) : packageCount === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] border border-[#E4E4E7] py-16 text-center">
            <p className="text-[14px] text-[#71717B]">
              Pick packages on your wishlist and choose Compare Packages to build a comparison.
            </p>
            <Link
              href="/account/wishlist"
              className="rounded-full border border-[#E4E4E7] px-4 py-1.5 text-[14px] font-medium text-[#27272A] transition-colors hover:bg-[#FAFAFA]"
            >
              Go to wishlist
            </Link>
          </div>
        ) : (
          <CompareTable columns={view!.columns} sections={view!.sections} onRemove={handleRemove} />
        )}
      </div>
    </div>
  );
}
