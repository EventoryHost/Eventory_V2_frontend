"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { getBookingDetailView } from "@/features/customer-booking-detail/services/getBookingDetailView";
import type { BookingDetailView } from "@/features/customer-booking-detail/types";
import {
  getBookingReview,
  submitBookingReview,
  type RawBookingReviewState,
  type SubmitBookingReviewBody,
} from "@/lib/customerReviewApi";
import HighlightChips from "./HighlightChips";
import PackageReviewModal, { type PackageReviewDraft } from "./PackageReviewModal";
import PackageReviewRow from "./PackageReviewRow";
import ReviewEventCard from "./ReviewEventCard";
import ReviewTipsCard from "./ReviewTipsCard";
import StarRating from "./StarRating";

type EventQuestion = "overallRating" | "supportRating";
type EventHighlights = "overallHighlights" | "supportHighlights";

const EVENT_QUESTIONS: { key: EventQuestion; highlightsKey: EventHighlights; title: string; art: string }[] = [
  {
    key: "overallRating",
    highlightsKey: "overallHighlights",
    title: "How would you describe the event overall?",
    art: "/images/customer/review/event-overall.png",
  },
  {
    key: "supportRating",
    highlightsKey: "supportHighlights",
    title: "How was the event support & coordination?",
    art: "/images/customer/review/event-support.png",
  },
];

// The filled-state design (node 2023:8947) shows the same chips under both
// questions, with "Good organisation" repeated as filler — these are its
// distinct labels. Swap in the final lists once product has them.
const HIGHLIGHT_OPTIONS = ["Event smoothness", "Overall sync", "Smart planning", "Good organisation"] as const;

// The chips' prompt reads "We love to hear that…", so they only follow a
// good rating. There's no design for a low one.
const HIGHLIGHTS_MIN_RATING = 4;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-1 text-[14px] font-semibold leading-5 text-[#71717B]">{children}</p>;
}

/**
 * Add a review (node 2023:8179). Opened from one booking but, like Booking
 * Details, about the whole event: two event-level questions, then one rating
 * per package. Reviews are create-only on the backend, so anything already
 * rated shows read-only and only the new ratings are sent.
 */
export default function BookingReviewContent({ bookingId }: { bookingId: string }) {
  const { isLoggedIn, isHydrated } = useCustomerSession();
  const router = useRouter();

  const [view, setView] = useState<BookingDetailView | null>(null);
  const [state, setState] = useState<RawBookingReviewState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSettled, setHasSettled] = useState(false);

  const [eventRatings, setEventRatings] = useState<Record<EventQuestion, number>>({
    overallRating: 0,
    supportRating: 0,
  });
  const [eventHighlights, setEventHighlights] = useState<Record<EventHighlights, string[]>>({
    overallHighlights: [],
    supportHighlights: [],
  });
  /** New package reviews saved from the popup, by booking reference. */
  const [packageDrafts, setPackageDrafts] = useState<Record<string, PackageReviewDraft>>({});
  /** The package whose "Share your thoughts" popup is open, and the rating it opens with. */
  const [openPackage, setOpenPackage] = useState<{ reference: string; rating?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn) {
      router.replace(`/register?redirectTo=/bookings/${bookingId}/review`);
      return;
    }

    let cancelled = false;
    Promise.all([getBookingDetailView(bookingId), getBookingReview(bookingId)])
      .then(([nextView, nextState]) => {
        if (cancelled) return;
        setView(nextView);
        setState(nextState);
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

  const packageState = new Map(state?.packages.map((row) => [row.bookingId, row]) ?? []);
  // Only packages the customer can rate now, or already has — a declined or
  // cancelled package has nothing to review.
  const packages =
    view?.packages.filter((row) => {
      const current = packageState.get(row.reference);
      return current && (current.reviewable || current.review);
    }) ?? [];

  const savedEvent = state?.eventReview ?? null;
  const canRateEvent = Boolean(state?.canReviewEvent) && !savedEvent;

  const body: SubmitBookingReviewBody = {};
  if (canRateEvent && (eventRatings.overallRating || eventRatings.supportRating)) {
    body.event = {};
    for (const question of EVENT_QUESTIONS) {
      const rating = eventRatings[question.key];
      if (!rating) continue;
      body.event[question.key] = rating;
      const picked = eventHighlights[question.highlightsKey];
      if (rating >= HIGHLIGHTS_MIN_RATING && picked.length) body.event[question.highlightsKey] = picked;
    }
  }
  const newPackageRatings = Object.entries(packageDrafts)
    .filter(([reference, draft]) => draft.rating > 0 && !packageState.get(reference)?.review)
    .map(([reference, draft]) => ({
      bookingId: reference,
      rating: draft.rating,
      ...(draft.comment ? { comment: draft.comment } : {}),
      ...(draft.photos.length ? { photos: draft.photos } : {}),
    }));
  if (newPackageRatings.length) body.packages = newPackageRatings;
  const hasSomethingToSubmit = Boolean(body.event || body.packages);

  const openRow = openPackage ? packages.find((row) => row.reference === openPackage.reference) ?? null : null;
  const openSaved = openPackage ? packageState.get(openPackage.reference)?.review ?? null : null;
  const openDraft = openPackage ? packageDrafts[openPackage.reference] : undefined;
  const modalInitial: PackageReviewDraft = openSaved
    ? { rating: openSaved.rating, comment: openSaved.comment, photos: openSaved.photos }
    : {
        rating: openPackage?.rating ?? openDraft?.rating ?? 0,
        comment: openDraft?.comment ?? "",
        photos: openDraft?.photos ?? [],
      };

  const nothingLeftToRate = Boolean(state) && !canRateEvent && packages.every((row) => packageState.get(row.reference)?.review);

  function rateEventQuestion(question: (typeof EVENT_QUESTIONS)[number], value: number) {
    setEventRatings((prev) => ({ ...prev, [question.key]: value }));
    // Dropping below a good rating hides the chips, so drop what was picked.
    if (value < HIGHLIGHTS_MIN_RATING) {
      setEventHighlights((prev) => ({ ...prev, [question.highlightsKey]: [] }));
    }
  }

  function toggleHighlight(key: EventHighlights, option: string) {
    setEventHighlights((prev) => ({
      ...prev,
      [key]: prev[key].includes(option) ? prev[key].filter((item) => item !== option) : [...prev[key], option],
    }));
  }

  async function handleSubmit() {
    if (!hasSomethingToSubmit) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const next = await submitBookingReview(bookingId, body);
      setState(next);
      setPackageDrafts({});
      setEventRatings({ overallRating: 0, supportRating: 0 });
      setEventHighlights({ overallHighlights: [], supportHighlights: [] });
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const breadcrumbs = [
    { label: "Your account", href: "/account" },
    { label: "Your bookings", href: "/account/bookings" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 py-8 sm:px-6 lg:px-16">
      <div className="flex flex-col gap-4">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[14px] leading-5">
          {breadcrumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <Link href={crumb.href} className="text-[#1447E6] hover:underline">
                {crumb.label}
              </Link>
              <ChevronRight className="h-4 w-4 text-[#1447E6]" />
            </span>
          ))}
          <span aria-current="page" className="font-medium text-[#1447E6]">
            Add a review
          </span>
        </nav>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-[24px] font-semibold leading-[1.35] tracking-[-0.02em] text-[#030303]">Add a review</h1>
          <p className="text-[14px] leading-5 text-[#71717B]">
            Add a review for the event that we just made it happen for you
          </p>
        </div>
      </div>

      {!hasSettled ? (
        <p className="text-[14px] leading-5 text-[#71717B]">Loading this booking…</p>
      ) : error || !view || !state ? (
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
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {!state.canReviewEvent && packages.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#E4E4E7] bg-[#FAFAFA] p-4">
                <p className="text-[14px] leading-5 text-[#3F3F47]">
                  You can leave a review once your event is complete.
                </p>
                <Link
                  href={`/bookings/${bookingId}`}
                  className="text-[14px] font-medium leading-5 text-brand-primary hover:underline"
                >
                  Back to booking details
                </Link>
              </div>
            ) : (
              <>
                {state.canReviewEvent && (
                  <div className="flex flex-col gap-6">
                    <SectionLabel>EVENT</SectionLabel>
                    <div className="flex flex-col gap-12">
                      {EVENT_QUESTIONS.map((question) => {
                        const saved = savedEvent?.[question.key] ?? null;
                        // A saved event review is final — a question skipped
                        // at the time can't be answered later.
                        if (savedEvent && !saved) return null;
                        const rating = saved ?? eventRatings[question.key];
                        return (
                          <div key={question.key} className="flex flex-col gap-2">
                            <Image src={question.art} alt="" width={64} height={64} className="h-16 w-16 object-cover" />
                            <div className="flex flex-col gap-5">
                              <h2 className="text-[20px] font-semibold leading-7 text-[#3F3F47]">{question.title}</h2>
                              {saved ? (
                                <StarRating value={saved} label={question.title} />
                              ) : (
                                <StarRating
                                  value={rating}
                                  onChange={(value) => rateEventQuestion(question, value)}
                                  label={question.title}
                                />
                              )}
                              {rating >= HIGHLIGHTS_MIN_RATING &&
                                (saved ? (
                                  <HighlightChips
                                    options={HIGHLIGHT_OPTIONS}
                                    selected={savedEvent?.[question.highlightsKey] ?? []}
                                  />
                                ) : (
                                  <HighlightChips
                                    options={HIGHLIGHT_OPTIONS}
                                    selected={eventHighlights[question.highlightsKey]}
                                    onToggle={(option) => toggleHighlight(question.highlightsKey, option)}
                                  />
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {packages.length > 0 && (
                  <div className={`flex flex-col gap-4 ${state.canReviewEvent ? "mt-7" : ""}`}>
                    <SectionLabel>PACKAGES</SectionLabel>
                    <h2 className="text-[20px] font-semibold leading-7 text-[#3F3F47]">
                      How were the packages for your event?
                    </h2>
                    <div className="flex flex-col gap-5">
                      {packages.map((row) => (
                        <PackageReviewRow
                          key={row.id}
                          row={row}
                          rating={packageDrafts[row.reference]?.rating ?? 0}
                          savedRating={packageState.get(row.reference)?.review?.rating}
                          onOpen={() => setOpenPackage({ reference: row.reference })}
                          onRate={(value) => setOpenPackage({ reference: row.reference, rating: value })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-col items-start gap-2">
                  {nothingLeftToRate ? (
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-[14px] leading-5 text-[#008236]">
                        {submitted ? "Thanks — your review has been submitted." : "You've reviewed everything for this event."}
                      </p>
                      <Link
                        href={`/bookings/${bookingId}`}
                        className="text-[14px] font-medium leading-5 text-brand-primary hover:underline"
                      >
                        Back to booking details
                      </Link>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!hasSomethingToSubmit || isSubmitting}
                        className="rounded-full bg-brand-primary px-6 py-2.5 text-[14px] font-medium leading-5 text-white transition-colors hover:bg-[#E14E64] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isSubmitting ? "Submitting…" : "Submit review"}
                      </button>
                      {submitted && !submitError && (
                        <p className="text-[12px] leading-4 text-[#008236]">Thanks — your ratings have been saved.</p>
                      )}
                    </>
                  )}
                  {submitError && <p className="text-[12px] leading-4 text-[#C81E0D]">{submitError}</p>}
                </div>
              </>
            )}
          </div>

          <PackageReviewModal
            row={openRow}
            initial={modalInitial}
            onClose={() => setOpenPackage(null)}
            onSave={
              openSaved || !openPackage
                ? undefined
                : (draft) => {
                    setPackageDrafts((prev) => ({ ...prev, [openPackage.reference]: draft }));
                    setOpenPackage(null);
                  }
            }
          />

          <aside className="flex w-full flex-col gap-8 lg:sticky lg:top-6 lg:w-[429px] lg:shrink-0 lg:pt-6">
            <ReviewEventCard view={view} completed={state.canReviewEvent} />
            <ReviewTipsCard />
          </aside>
        </div>
      )}
    </div>
  );
}
