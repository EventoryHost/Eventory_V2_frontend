"use client";

import Link from "next/link";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { useAccountDashboard } from "../hooks/useAccountDashboard";
import AccountStatsRow from "./AccountStatsRow";
import ActiveBookingCard from "./ActiveBookingCard";
import RecentlyViewedCard from "./RecentlyViewedCard";

function SectionHeading({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-[24px] font-semibold leading-8 text-[#030303]">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="flex min-w-4 items-center justify-center rounded-[49px] bg-[#00A63E] px-[5px] text-[11px] font-bold leading-4 text-[#FAFAFA]">
          {count}
        </span>
      )}
    </div>
  );
}

function EmptyState({ message, cta }: { message: string; cta?: { label: string; href: string } }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#E4E4E7] bg-white px-6 py-10 text-center">
      <p className="text-[14px] text-[#71717B]">{message}</p>
      {cta && (
        <Link
          href={cta.href}
          className="rounded-full border border-[#E4E4E7] px-4 py-1.5 text-[14px] font-medium text-[#27272A] transition-colors hover:bg-[#FAFAFA]"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export default function AccountPageContent() {
  // The auth gate and the sidebar live in AccountShell (the /account layout).
  const { isLoggedIn } = useCustomerSession();
  const { isLoading, error, orders, activeBookingCount, recentlyViewed, counts } = useAccountDashboard({
    enabled: isLoggedIn,
  });

  return (
    <>
      <AccountStatsRow
        bookings={counts.bookings}
        cartItems={counts.cartItems}
        wishlist={counts.wishlist}
        viewedItems={counts.viewedItems}
      />

      <section className="flex flex-col gap-4">
        <SectionHeading title="Active Bookings" count={activeBookingCount} />

        {error ? (
          <EmptyState message={error} />
        ) : isLoading ? (
          <EmptyState message="Loading your bookings…" />
        ) : orders.length === 0 ? (
          <EmptyState
            message="You don't have any active bookings yet."
            cta={{ label: "Browse packages", href: "/packages" }}
          />
        ) : (
          orders.map((order) => <ActiveBookingCard key={order.id} order={order} />)
        )}
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading title="Recently Viewed" />

        {recentlyViewed.length === 0 ? (
          <EmptyState
            message="Packages you open will show up here."
            cta={{ label: "Start exploring", href: "/packages" }}
          />
        ) : (
          recentlyViewed.map((item) => <RecentlyViewedCard key={item.packageId} item={item} />)
        )}
      </section>
    </>
  );
}
