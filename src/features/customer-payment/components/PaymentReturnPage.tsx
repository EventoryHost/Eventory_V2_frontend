"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, XCircle } from "lucide-react";
import { getPaymentStatus, createTokenPayment, type PaymentStatus } from "@/lib/customerPaymentApi";
import { loadCashfree } from "@/lib/cashfree";
import { ApiError } from "@/lib/apiClient";
import CheckoutLoginGate from "@/features/customer-checkout/components/CheckoutLoginGate";

const POLL_INTERVAL_MS = 2000;
const TIMEOUT_MS = 2 * 60 * 1000;
const TERMINAL_STATUSES: PaymentStatus[] = ["PAID", "FAILED", "EXPIRED", "CANCELLED"];

type ViewState =
  | { kind: "missing-id" }
  | { kind: "polling" }
  | { kind: "timed-out"; checkoutSessionId: string }
  | { kind: "terminal-failed"; status: PaymentStatus; reason: string | null; checkoutSessionId: string }
  | { kind: "error"; message: string };

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");

  const [view, setView] = useState<ViewState>(paymentId ? { kind: "polling" } : { kind: "missing-id" });
  const [retrying, setRetrying] = useState(false);
  const stopRef = useRef(false);

  useEffect(() => {
    if (!paymentId) return;
    stopRef.current = false;
    const startedAt = Date.now();

    async function poll() {
      if (stopRef.current) return;
      try {
        const result = await getPaymentStatus(paymentId!);

        if (result.paymentStatus === "PAID") {
          stopRef.current = true;
          router.replace(`/booking-success?bookingIds=${result.bookingIds.join(",")}`);
          return;
        }

        if (TERMINAL_STATUSES.includes(result.paymentStatus)) {
          stopRef.current = true;
          setView({
            kind: "terminal-failed",
            status: result.paymentStatus,
            reason: result.failureReason,
            checkoutSessionId: result.checkoutSessionId,
          });
          return;
        }

        // Still PENDING.
        if (Date.now() - startedAt >= TIMEOUT_MS) {
          stopRef.current = true;
          setView({ kind: "timed-out", checkoutSessionId: result.checkoutSessionId });
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        stopRef.current = true;
        setView({
          kind: "error",
          message: err instanceof ApiError ? err.message : "Couldn't check your payment status. Please try again.",
        });
      }
    }

    void poll();
    return () => {
      stopRef.current = true;
    };
  }, [paymentId, router]);

  const handleRetry = useCallback(async (checkoutSessionId: string) => {
    setRetrying(true);
    try {
      const result = await createTokenPayment(checkoutSessionId);
      const cashfree = await loadCashfree();
      await cashfree.checkout({ paymentSessionId: result.paymentSessionId, redirectTarget: "_self" });
    } catch (err) {
      setRetrying(false);
      setView({
        kind: "error",
        message: err instanceof ApiError ? err.message : "Couldn't start a new payment attempt. Please try again.",
      });
    }
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      {view.kind === "missing-id" && (
        <>
          <XCircle size={40} className="text-[#E7000B]" />
          <p className="font-figtree text-[16px] font-semibold text-[#030303]">
            We couldn&apos;t find a payment to check here.
          </p>
          <Link href="/booking-summary" className="font-figtree text-[14px] font-semibold text-[#F0596F] underline">
            Back to your booking
          </Link>
        </>
      )}

      {view.kind === "polling" && (
        <>
          <Loader2 size={40} className="animate-spin text-[#F0596F]" />
          <p className="font-figtree text-[16px] font-semibold text-[#030303]">
            Confirming your payment…
          </p>
          <p className="font-figtree text-[14px] text-[#71717B]">
            This usually takes a few seconds. Don&apos;t close this tab.
          </p>
        </>
      )}

      {view.kind === "timed-out" && (
        <>
          <Loader2 size={40} className="text-[#71717B]" />
          <p className="font-figtree text-[16px] font-semibold text-[#030303]">
            Still processing.
          </p>
          <p className="font-figtree text-[14px] text-[#71717B]">
            Your payment is taking longer than expected to confirm. Check your bookings again in a
            few minutes — you&apos;ll see it there once it clears.
          </p>
          <Link href="/booking-summary" className="font-figtree text-[14px] font-semibold text-[#F0596F] underline">
            Back to your booking
          </Link>
        </>
      )}

      {view.kind === "terminal-failed" && (
        <>
          <XCircle size={40} className="text-[#E7000B]" />
          <p className="font-figtree text-[16px] font-semibold text-[#030303]">
            {view.status === "FAILED" ? "Payment failed" : `Payment ${view.status.toLowerCase()}`}
          </p>
          {view.reason && (
            <p className="font-figtree text-[14px] text-[#71717B]">{view.reason}</p>
          )}
          <button
            type="button"
            disabled={retrying}
            onClick={() => handleRetry(view.checkoutSessionId)}
            className="mt-2 flex h-11 items-center justify-center rounded-full bg-[#F0596F] px-6 font-figtree text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {retrying ? "Starting…" : "Try again"}
          </button>
          <Link href="/booking-summary" className="font-figtree text-[13px] font-medium text-[#71717B] underline">
            Back to your booking
          </Link>
        </>
      )}

      {view.kind === "error" && (
        <>
          <XCircle size={40} className="text-[#E7000B]" />
          <p className="font-figtree text-[16px] font-semibold text-[#030303]">{view.message}</p>
          <Link href="/booking-summary" className="font-figtree text-[14px] font-semibold text-[#F0596F] underline">
            Back to your booking
          </Link>
        </>
      )}
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <CheckoutLoginGate>
      <PaymentReturnContent />
    </CheckoutLoginGate>
  );
}
