"use client";

import { useState } from "react";
import OtpInputGroup from "@/features/customer-auth/components/OtpInputGroup";
import { sendPhoneOtp, verifyPhoneOtpForAccount } from "@/features/customer-auth/services/authService";
import type { Customer } from "@/lib/customerSession";
import { FIELD_BOX_CLASS } from "./ProfileField";

/** Backend's MOBILE_REGEX (customerValidators.js) — reject early rather than round-trip a 400. */
const MOBILE_REGEX = /^[6-9]\d{9}$/;

/**
 * Changing the mobile number can't be a plain PATCH: the number is an
 * identity/login field, so the backend only accepts it through the OTP
 * flow. verifyPhoneOtpForAccount hits the same /phone/verify-otp endpoint as
 * login but takes the backend's "attach/re-verify on my own account" branch,
 * returning the updated Customer instead of a new session.
 */
export default function PhoneEditForm({
  onSaved,
  onCancel,
}: {
  onSaved: (customer: Customer) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"number" | "otp">("number");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [session, setSession] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function requestOtp() {
    if (!MOBILE_REGEX.test(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      const response = await sendPhoneOtp(mobile);
      setSession(response.session);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the OTP. Try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function confirmOtp() {
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      const response = await verifyPhoneOtpForAccount({ mobile, code: otp, session });
      onSaved(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work. Try again.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {step === "number" ? (
        <>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            aria-label="New mobile number"
            value={mobile}
            onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile number"
            className={`${FIELD_BOX_CLASS} text-[#030303] outline-none focus:border-brand-primary`}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={requestOtp}
              disabled={isBusy}
              className="rounded-full bg-brand-primary px-4 py-1.5 text-[14px] font-medium text-white disabled:opacity-60"
            >
              {isBusy ? "Sending…" : "Send OTP"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="text-[14px] font-medium text-[#71717B] hover:underline"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[12px] leading-[18px] text-[#71717B]">
            Enter the 6-digit code sent to {mobile}.
          </p>
          <OtpInputGroup value={otp} onChange={setOtp} hasError={Boolean(error)} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={confirmOtp}
              disabled={isBusy}
              className="rounded-full bg-brand-primary px-4 py-1.5 text-[14px] font-medium text-white disabled:opacity-60"
            >
              {isBusy ? "Verifying…" : "Verify & Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("number");
                setOtp("");
                setError(null);
              }}
              className="text-[14px] font-medium text-[#71717B] hover:underline"
            >
              Change number
            </button>
          </div>
        </>
      )}

      {error && <p className="text-[12px] leading-[18px] text-[#C81E0D]">{error}</p>}
    </div>
  );
}
