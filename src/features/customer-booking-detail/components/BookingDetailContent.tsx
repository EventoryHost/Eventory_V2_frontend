"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { createMilestonePayment } from "@/lib/customerPaymentApi";
import { loadCashfree } from "@/lib/cashfree";
import { getBookingDetailView } from "../services/getBookingDetailView";
import { buildBookingBanner } from "../utils/bookingBanner";
import type { BookingDetailView } from "../types";
import BookingJourney from "./BookingJourney";
import BookingPackagePanel from "./BookingPackagePanel";
import BookingPackagesList from "./BookingPackagesList";
import BookingSidebar from "./BookingSidebar";
import BookingStatusBanner from "./BookingStatusBanner";
import EventSummaryHeader from "./EventSummaryHeader";

type DetailTab = "timeline" | "packages";

const BREADCRUMBS = [
  { label: "Your account", href: "/account" },
  { label: "Your bookings", href: "/account/bookings" },
];

/**
 * Booking Details (node 1629:6393). The route is keyed by one booking, but
 * the page is about the whole event: the header, totals and timeline span
 * every package booked for it — see getBookingDetailView.
 */
export default function BookingDetailContent({ bookingId }: { bookingId: string }) {
  const { isLoggedIn, isHydrated } = useCustomerSession();
  const router = useRouter();

  const [view, setView] = useState<BookingDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSettled, setHasSettled] = useState(false);
  const [tab, setTab] = useState<DetailTab>("timeline");
  /** Booking reference of the package whose panel is open (node 1629:9256). */
  const [openPackage, setOpenPackage] = useState<string | null>(null);
  const [bannerBusy, setBannerBusy] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn) {
      router.replace(`/register?redirectTo=/bookings/${bookingId}`);
      return;
    }

    let cancelled = false;
    getBookingDetailView(bookingId)
      .then((next) => {
        if (cancelled) return;
        setView(next);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load this booking");
      })
      .finally(() => {
        if (!cancelled) setHasSettled(true);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId, isHydrated, isLoggedIn, router]);

  const banner = view ? buildBookingBanner(view) : null;

  /**
   * The banner's CTA. "Pay advance N" starts a real Cashfree order for that
   * milestone and hands off to their hosted page, exactly as checkout does;
   * the "View" banners just open the packages tab.
   */
  async function handleBannerAction() {
    if (!banner || !view) return;

    if (banner.variant !== "advance-due" || !banner.action.milestoneId) {
      setTab("packages");
      return;
    }

    setBannerBusy(true);
    setBannerError(null);
    try {
      const payment = await createMilestonePayment(view.reference, banner.action.milestoneId);
      const cashfree = await loadCashfree();
      // Navigates away entirely — nothing after this runs.
      await cashfree.checkout({ paymentSessionId: payment.paymentSessionId, redirectTarget: "_self" });
    } catch (err: unknown) {
      setBannerError(err instanceof Error ? err.message : "Couldn't start that payment. Please try again.");
      setBannerBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-16">
      <div className="flex flex-col gap-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[14px] leading-5">
          {BREADCRUMBS.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <Link href={crumb.href} className="text-[#1447E6] hover:underline">
                {crumb.label}
              </Link>
              <ChevronRight className="h-4 w-4 text-[#1447E6]" />
            </span>
          ))}
          <span aria-current="page" className="font-medium text-[#1447E6]">
            Booking Details
          </span>
        </nav>

        <h1 className="text-[24px] font-semibold leading-[1.35] tracking-[-0.02em] text-[#030303]">
          Booking Details
        </h1>
      </div>

      {!hasSettled ? (
        <p className="text-[14px] leading-5 text-[#71717B]">Loading this booking…</p>
      ) : error || !view ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-[14px] leading-5 text-[#C81E0D]">{error ?? "Could not load this booking"}</p>
          <Link
            href="/account/bookings"
            className="rounded-full border border-[#E4E4E7] px-4 py-1.5 text-[14px] font-medium text-[#27272A] transition-colors hover:bg-[#FAFAFA]"
          >
            Back to my bookings
          </Link>
        </div>
      ) : (
        <>
          <EventSummaryHeader view={view} />

          <BookingStatusBanner
            banner={banner}
            onAction={handleBannerAction}
            isBusy={bannerBusy}
            error={bannerError}
          />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-8">
              {/* Tabs */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {([
                    { value: "timeline", label: "Timeline" },
                    { value: "packages", label: "Your Packages" },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTab(value)}
                      aria-current={tab === value ? "page" : undefined}
                      className={`px-4 py-2.5 text-[20px] leading-7 ${
                        tab === value
                          ? "border-b-2 border-brand-primary font-semibold text-[#030303]"
                          : "font-medium text-[#3F3F47]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span aria-hidden className="h-px w-full bg-[#E4E4E7]" />
              </div>

              {tab === "timeline" ? (
                <BookingJourney steps={view.journey} />
              ) : (
                <BookingPackagesList packages={view.packages} onOpen={setOpenPackage} />
              )}
            </div>

            <BookingSidebar view={view} />
          </div>

          {openPackage && (
            <BookingPackagePanel bookingReference={openPackage} onClose={() => setOpenPackage(null)} />
          )}
        </>
      )}
    </div>
  );
}
