"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { getBookings, type BookingTab, type RawBookingsResponse } from "@/lib/customerBookingApi";
import AccountEmptyCard from "./AccountEmptyCard";
import ActiveBookingCard from "./ActiveBookingCard";
import { groupBookingsByEvent } from "../utils/groupBookings";

/**
 * The design's three tabs (node 1602:7153). "Completed" is the backend's
 * `past` tab — same rows, friendlier label.
 */
const TABS: { value: BookingTab; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "past", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BookingsContent() {
  const { isLoggedIn } = useCustomerSession();
  const [tab, setTab] = useState<BookingTab>("active");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<RawBookingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Set only from the request's callbacks, never synchronously in the effect.
  const [hasSettled, setHasSettled] = useState(false);

  // Debounce so a search fires once the customer stops typing, not per key.
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    // Search is server-side — the endpoint matches bookingId, eventType and
    // vendor business name, which a client-side filter over one page couldn't.
    getBookings({ tab, q: query || undefined, sort: "eventDate_asc", limit: 50 })
      .then((data) => {
        if (cancelled) return;
        setResponse(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load your bookings");
      })
      .finally(() => {
        if (!cancelled) setHasSettled(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, tab, query]);

  const isLoading = isLoggedIn && !hasSettled;
  const orders = groupBookingsByEvent(response?.bookings ?? []);
  const counts = response?.counts;

  return (
    <>
      {/* Heading + search */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-[34px]">
        <h1 className="shrink-0 text-[24px] font-semibold leading-8 text-[#030303]">My Bookings</h1>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-[14px] border border-[#F1F1F1] bg-white px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-[#666]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            aria-label="Search bookings"
            className="min-w-0 flex-1 text-[16px] font-medium leading-[18px] tracking-[0.01em] text-[#030303] outline-none placeholder:text-[#666]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-start gap-2 overflow-x-auto border-b border-[#E4E4E7]">
        {TABS.map(({ value, label }) => {
          const isActive = value === tab;
          const count = counts?.[value] ?? 0;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-end justify-center gap-1.5 border-b-2 px-4 py-2 text-[14px] ${
                isActive
                  ? "border-brand-primary font-semibold text-[#030303]"
                  : "border-transparent font-medium text-[#71717B]"
              }`}
            >
              {label}
              {count > 0 && (
                <span className="rounded-full bg-[#F4F4F5] px-1.5 py-px text-[11px] font-semibold text-[#3F3F47]">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-[14px] leading-5 text-[#C81E0D]">{error}</p>
      ) : isLoading ? (
        <p className="text-[14px] leading-5 text-[#71717B]">Loading your bookings…</p>
      ) : orders.length === 0 ? (
        query ? (
          <p className="text-[14px] leading-5 text-[#71717B]">
            No bookings match “{query}”.
          </p>
        ) : (
          <AccountEmptyCard
            image="/images/customer/bookings-empty.png"
            imageHeight={133}
            title="No Bookings found"
            description="It looks like you haven't booked any package for any event yet. Don't miss out on the opportunity to secure your spot!"
          />
        )
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <ActiveBookingCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </>
  );
}
