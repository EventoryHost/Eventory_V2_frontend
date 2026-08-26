"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContactPageHeader from "./ContactPageHeader";
import ContactDetailsForm from "./ContactDetailsForm";
import AlternateCoordinatorSection from "./AlternateCoordinatorSection";
import BookingNotesSection from "./BookingNotesSection";
import GstinToggleSection from "./GstinToggleSection";
import PaymentSummary from "@/features/customer-booking/components/PaymentSummary";
import { useBookingSummaryData } from "@/features/customer-booking/hooks/useBookingSummaryData";
import { useCheckoutStepGuard } from "@/features/customer-checkout/hooks/useCheckoutStepGuard";
import CheckoutLoginGate from "@/features/customer-checkout/components/CheckoutLoginGate";
import { confirmCheckoutSessionOffline } from "@/lib/customerCheckoutApi";
import { clearCheckoutSessionId } from "@/lib/checkoutSession";
import { ApiError } from "@/lib/apiClient";

export default function ContactPage() {
  const router = useRouter();
  const { data, loading, error, refresh, applyCoupon, couponLoading, couponFeedback } = useBookingSummaryData();
  const { redirecting } = useCheckoutStepGuard(data, loading, error);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // No in-app payment step exists anymore (product decision — payment is
  // handled off-platform for now) — "Continue to Payment" instead confirms
  // the checkout session directly into real Booking(s), recorded as fully
  // paid on trust (see confirmCheckoutSessionOffline's doc comment), then
  // hands the created bookingIds to /booking-success to display for real.
  async function handleContinue() {
    if (!data?.sessionId) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      const result = await confirmCheckoutSessionOffline(data.sessionId);
      clearCheckoutSessionId();
      router.push(`/booking-success?bookingIds=${result.bookingIds.join(",")}`);
    } catch (err) {
      setConfirmError(err instanceof ApiError ? err.message : "Couldn't confirm your booking. Please try again.");
    } finally {
      setConfirming(false);
    }
  }

  if (redirecting) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 text-center sm:px-6 lg:px-16">
        <p className="mt-10 font-figtree text-[14px] text-[#71717B]">Redirecting…</p>
      </div>
    );
  }

  return (
    <CheckoutLoginGate>
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-8 pb-16 sm:px-6 lg:px-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex w-full flex-col gap-6 lg:flex-1">
            <ContactPageHeader />

            {/* readyForPayment being false already bounces this page back to
                Review via useCheckoutStepGuard above, so canContinue can
                still be false here for two reasons: unmet contact.valid, or
                a line missing eventType/date/location that predates this
                step (nothing on Review edits that — see lineErrors' doc
                comment in customer-booking/types.ts). */}
            {!loading && !error && data && !data.canContinue && data.contact.errors.length > 0 && (
              <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 font-figtree text-[13px] text-[#92400E]">
                Can&apos;t continue yet — {data.contact.errors.join(", ")}.
              </div>
            )}

            {!loading && !error && data && (data.lineErrors?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-1 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-5 py-4 font-figtree text-[13px] text-[#92400E]">
                <span>Can&apos;t continue yet — some packages are missing details:</span>
                <ul className="list-disc pl-5">
                  {data.lineErrors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <ContactDetailsForm
              sessionId={data?.sessionId ?? ""}
              initialName={data?.contact.name ?? ""}
              initialPhone={data?.contact.phone ?? ""}
              initialEmail={data?.contact.email ?? ""}
              phoneVerified={data?.contact.phoneVerified ?? false}
              onSaved={refresh}
            />
            <AlternateCoordinatorSection />
            <BookingNotesSection />
            <GstinToggleSection />
          </div>

          <div className="w-full lg:w-[424px] lg:shrink-0">
            {loading && (
              <p className="text-center font-figtree text-[13px] text-[#71717B]">Loading summary…</p>
            )}
            {!loading && error && (
              <p className="text-center font-figtree text-[13px] text-[#B91C1C]">{error}</p>
            )}
            {!loading && !error && data && (
              <>
                <PaymentSummary
                  vendorCount={data.paymentSummary.vendorCount}
                  packageCount={data.paymentSummary.packageCount}
                  rows={data.paymentSummary.rows}
                  grandTotal={data.paymentSummary.grandTotal}
                  tokenAmount={data.paymentSummary.tokenAmount}
                  payInFull={data.paymentSummary.payInFull}
                  cancellationNote={data.paymentSummary.cancellationNote}
                  ctaLabel={confirming ? "Confirming…" : "Continue to Payment"}
                  onCtaClick={handleContinue}
                  ctaLoading={confirming}
                  ctaDisabled={data.vendorGroups.length === 0 || !data.canContinue}
                  onApplyCoupon={applyCoupon}
                  couponLoading={couponLoading}
                  couponFeedback={couponFeedback}
                />
                {confirmError && (
                  <p className="mt-3 text-center font-figtree text-[13px] text-[#B91C1C]">{confirmError}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CheckoutLoginGate>
  );
}
