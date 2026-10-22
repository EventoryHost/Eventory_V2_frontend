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
import ReviewProposalPanel, { type ProposalOutcome } from "./ReviewProposalPanel";
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
export default function BookingDetailContent({
  bookingId,
  openProposal = false,
}: {
  bookingId: string;
  /** Open this booking's Review Proposal panel on load (?proposal=1). */
  openProposal?: boolean;
}) {
  const { isLoggedIn, isHydrated } = useCustomerSession();
  const router = useRouter();

  const [view, setView] = useState<BookingDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSettled, setHasSettled] = useState(false);
  const [tab, setTab] = useState<DetailTab>("timeline");
  /** Booking reference of the package whose panel is open (node 1629:9256). */
  const [openPackage, setOpenPackage] = useState<string | null>(null);
  /** Booking reference whose Review Proposal panel is open (node 2276:15962). */
  const [reviewingProposal, setReviewingProposal] = useState<string | null>(openProposal ? bookingId : null);
  /** Bumped after the customer answers a proposal, to reload the page's booking. */
  const [reloadKey, setReloadKey] = useState(0);
  /** The milestone whose Cashfree checkout is starting (banner or sidebar). */
  const [payingMilestoneId, setPayingMilestoneId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  /** Where the payment was started from — its error shows there. */
  const [paySource, setPaySource] = useState<"banner" | "sidebar">("banner");
  /** One-line confirmation after the customer answers a proposal. */
  const [notice, setNotice] = useState<string | null>(null);

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
  }, [bookingId, isHydrated, isLoggedIn, router, reloadKey]);

  const banner = view ? buildBookingBanner(view) : null;

  /**
   * Starts a real Cashfree order for one milestone of the opened booking and
   * hands off to their hosted page, exactly as checkout does. Keyed on the
   * booking's Mongo _id — the payment endpoint's own lookup.
   */
  async function payMilestone(milestoneId: string, source: "banner" | "sidebar") {
    if (!view || payingMilestoneId) return;
    setPayingMilestoneId(milestoneId);
    setPaySource(source);
    setPayError(null);
    try {
      const payment = await createMilestonePayment(view.bookingObjectId || view.reference, milestoneId);
      const cashfree = await loadCashfree();
      // Navigates away entirely — nothing after this runs.
      await cashfree.checkout({ paymentSessionId: payment.paymentSessionId, redirectTarget: "_self" });
    } catch (err: unknown) {
      setPayError(err instanceof Error ? err.message : "Couldn't start that payment. Please try again.");
      setPayingMilestoneId(null);
    }
  }

  /**
   * The banner's CTA. "Pay advance N" pays that milestone; "Review Proposal"
   * opens the panel; the "View" banners open the one package they're about,
   * or the packages tab.
   */
  async function handleBannerAction() {
    if (!banner || !view) return;

    if (banner.variant === "proposal" && banner.action.bookingReference) {
      setReviewingProposal(banner.action.bookingReference);
      return;
    }

    if (banner.variant === "advance-due" && banner.action.milestoneId) {
      await payMilestone(banner.action.milestoneId, "banner");
      return;
    }

    if (banner.action.packageReference) {
      setOpenPackage(banner.action.packageReference);
      return;
    }
    setTab("packages");
  }

  function handleProposalResolved(outcome: ProposalOutcome) {
    setReviewingProposal(null);
    setNotice(
      outcome === "accepted"
        ? "Proposal accepted. Your booking is confirmed."
        : "Your requests were sent to the vendor. We'll let you know when their updated proposal is ready."
    );
    setReloadKey((key) => key + 1);
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

          {notice && (
            <div
              role="status"
              className="flex items-start justify-between gap-3 rounded-2xl border border-[#B9F8CF] bg-[#F0FDF4] px-4 py-3 text-[14px] leading-5 text-[#016630]"
            >
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="shrink-0 text-[12px] font-medium text-[#016630] hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <BookingStatusBanner
            banner={banner}
            onAction={handleBannerAction}
            isBusy={Boolean(payingMilestoneId) && paySource === "banner"}
            error={paySource === "banner" ? payError : null}
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
                <BookingJourney steps={view.journey} onReviewProposal={setReviewingProposal} />
              ) : (
                <BookingPackagesList packages={view.packages} onOpen={setOpenPackage} />
              )}
            </div>

            <BookingSidebar
              view={view}
              onPay={(milestoneId) => payMilestone(milestoneId, "sidebar")}
              payingMilestoneId={payingMilestoneId}
              payError={paySource === "sidebar" ? payError : null}
            />
          </div>

          {openPackage && (
            <BookingPackagePanel
              bookingReference={openPackage}
              onClose={() => setOpenPackage(null)}
              onReviewProposal={(reference) => {
                setOpenPackage(null);
                setReviewingProposal(reference);
              }}
            />
          )}

          {reviewingProposal && (
            <ReviewProposalPanel
              bookingReference={reviewingProposal}
              onClose={() => setReviewingProposal(null)}
              onResolved={handleProposalResolved}
              onStale={() => setReloadKey((key) => key + 1)}
            />
          )}
        </>
      )}
    </div>
  );
}
