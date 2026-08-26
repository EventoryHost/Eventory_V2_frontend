"use client";

import { useEffect, useState } from "react";
import { Phone, Check } from "lucide-react";
import { ApiError } from "@/lib/apiClient";
import { patchCheckoutSessionContact } from "@/lib/customerCheckoutApi";
import { sendPhoneOtp, verifyPhoneOtpForAccount } from "@/features/customer-auth/services/authService";
import { getSnapshot, setSession } from "@/lib/customerSession";
import OtpInputGroup from "@/features/customer-auth/components/OtpInputGroup";

export type ContactDetailsFormProps = {
  /** "" until the checkout session has loaded — fields save silently once it's set. */
  sessionId: string;
  initialName: string;
  initialPhone: string;
  initialEmail: string;
  /** True only when `initialPhone` exactly matches the customer's own verified number. */
  phoneVerified: boolean;
  /** Called after any successful save (field blur or OTP verify) so the caller can re-fetch validation.contact. */
  onSaved?: () => void;
};

const RESEND_SECONDS = 30;

export default function ContactDetailsForm({
  sessionId,
  initialName,
  initialPhone,
  initialEmail,
  phoneVerified,
  onSaved,
}: ContactDetailsFormProps) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [savedName, setSavedName] = useState(initialName);
  const [savedPhone, setSavedPhone] = useState(initialPhone);
  const [savedEmail, setSavedEmail] = useState(initialEmail);

  // The session's contact details load asynchronously after this form
  // mounts — hydrate the fields once they arrive, but only once, so a
  // background refresh() (e.g. after saving one field) never clobbers text
  // the customer is still editing in another. Adjusting state during render
  // (React's documented alternative to an effect here) avoids the extra
  // render pass a useEffect-based sync would cost.
  const [hydrated, setHydrated] = useState(false);
  if (!hydrated && (initialName || initialPhone || initialEmail)) {
    setFullName(initialName);
    setPhone(initialPhone);
    setEmail(initialEmail);
    setSavedName(initialName);
    setSavedPhone(initialPhone);
    setSavedEmail(initialEmail);
    setHydrated(true);
  }

  const [nameStatus, setNameStatus] = useState<string | null>(null);
  const [nameSaving, setNameSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);

  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSession, setOtpSession] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  function getErrorMessage(err: unknown, fallback: string) {
    return err instanceof ApiError ? err.message : fallback;
  }

  async function saveName() {
    const trimmed = fullName.trim();
    if (!sessionId || !trimmed || trimmed === savedName) return;
    setNameSaving(true);
    setNameStatus(null);
    try {
      await patchCheckoutSessionContact(sessionId, { name: trimmed });
      setSavedName(trimmed);
      setNameStatus("Saved.");
      onSaved?.();
    } catch (err) {
      setNameStatus(getErrorMessage(err, "Couldn't save your name."));
    } finally {
      setNameSaving(false);
    }
  }

  async function saveEmail() {
    const trimmed = email.trim();
    if (!sessionId || !trimmed || trimmed === savedEmail) return;
    setEmailSaving(true);
    setEmailStatus(null);
    try {
      await patchCheckoutSessionContact(sessionId, { email: trimmed });
      setSavedEmail(trimmed);
      setEmailStatus("Saved.");
      onSaved?.();
    } catch (err) {
      setEmailStatus(getErrorMessage(err, "Couldn't save your email."));
    } finally {
      setEmailSaving(false);
    }
  }

  const isCurrentPhoneVerified = phoneVerified && phone === savedPhone;

  async function handleSendOtp() {
    if (!sessionId || phone.length !== 10 || otpLoading) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      if (phone !== savedPhone) {
        await patchCheckoutSessionContact(sessionId, { phone });
        setSavedPhone(phone);
        onSaved?.();
      }
      const result = await sendPhoneOtp(phone);
      setOtpSession(result.session);
      setOtp("");
      setOtpOpen(true);
      setResendTimer(RESEND_SECONDS);
    } catch (err) {
      setOtpError(getErrorMessage(err, "Couldn't send the OTP. Try again."));
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleResendOtp() {
    if (resendTimer > 0 || otpLoading) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const result = await sendPhoneOtp(phone);
      setOtpSession(result.session);
      setOtp("");
      setResendTimer(RESEND_SECONDS);
    } catch (err) {
      setOtpError(getErrorMessage(err, "Couldn't resend the code."));
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6 || otpLoading) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const { data: customer } = await verifyPhoneOtpForAccount({ mobile: phone, code: otp, session: otpSession });
      const { accessToken } = getSnapshot();
      if (accessToken) setSession(customer, accessToken);
      setOtpOpen(false);
      setOtp("");
      onSaved?.();
    } catch (err) {
      setOtpError(getErrorMessage(err, "That code didn't work. Try again."));
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-[801px] flex-col gap-5 rounded-[24px] border border-[#E4E4E7] bg-white p-6">
      <div className="flex flex-col gap-1">
        <label className="font-figtree text-[15px] font-semibold text-[#030303]">
          Full name
        </label>
        <p className="font-figtree text-[13px] font-normal leading-[18px] text-[#71717B]">
          So your vendors know who they&apos;re serving.
        </p>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={saveName}
          placeholder="e.g. Ananya Sharma"
          className="mt-2 h-12 w-full rounded-[16px] border border-[#E4E4E7] pt-[13.5px] pr-[14px] pb-[13.5px] pl-[14px] font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
        />
        {nameStatus && (
          <span
            className={`font-figtree text-[12px] ${nameStatus === "Saved." ? "text-[#71717B]" : "text-[#E7000B]"}`}
          >
            {nameSaving ? "Saving…" : nameStatus}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-figtree text-[15px] font-semibold text-[#030303]">
          Phone number
        </label>
        <p className="font-figtree text-[13px] font-normal leading-[18px] text-[#71717B]">
          Your vendor&apos;s team will call this on event day.
        </p>

        <div className="mt-2 flex gap-2">
          <div className="flex h-12 w-[72px] shrink-0 items-center justify-center gap-1 rounded-[16px] border border-[#E4E4E7] bg-[#F4F4F5] pt-[11px] pr-3 pb-[11px] pl-3">
            <span>🇮🇳</span>
            <span className="font-figtree text-[14px] font-medium text-[#030303]">
              +91
            </span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="98765 43210"
            className="h-12 w-full rounded-[16px] border border-[#E4E4E7] bg-white pt-[13.5px] pr-[14px] pb-[13.5px] pl-[14px] font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
          />
        </div>

        {isCurrentPhoneVerified ? (
          <span className="mt-2 flex h-[34px] w-fit items-center gap-1 rounded-full border border-[#16A34A] px-4 font-figtree text-[13px] font-medium text-[#16A34A]">
            <Check size={14} />
            Verified
          </span>
        ) : otpOpen ? (
          <div className="mt-2 flex flex-col gap-2 rounded-[16px] border border-[#E4E4E7] bg-[#FAFAFA] p-3">
            <span className="font-figtree text-[12px] text-[#71717B]">
              Enter the 6-digit code sent to +91 {phone}
            </span>
            <OtpInputGroup value={otp} onChange={setOtp} hasError={!!otpError} />
            {otpError && <span className="font-figtree text-[12px] text-[#E7000B]">{otpError}</span>}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={otp.length !== 6 || otpLoading}
                onClick={handleVerifyOtp}
                className="flex h-9 items-center justify-center rounded-full bg-[#030303] px-5 font-figtree text-[13px] font-semibold text-white transition-opacity disabled:opacity-40"
              >
                {otpLoading ? "Verifying…" : "Verify"}
              </button>
              <button
                type="button"
                disabled={resendTimer > 0 || otpLoading}
                onClick={handleResendOtp}
                className="font-figtree text-[13px] font-medium text-[#F0596F] disabled:text-[#9F9FA9]"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOtpOpen(false);
                  setOtpError("");
                }}
                className="font-figtree text-[13px] font-medium text-[#71717B]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={phone.length !== 10 || !sessionId || otpLoading}
              onClick={handleSendOtp}
              className="mt-2 flex h-[34px] w-fit items-center gap-1 rounded-full border border-[#EA1D3B] bg-[#030303]/0 pt-[7px] pr-5 pb-[7px] pl-4 font-figtree text-[13px] font-medium text-[#EA1D3B] opacity-40 transition-opacity enabled:opacity-100"
            >
              <Phone size={14} />
              {otpLoading ? "Sending…" : "Verify with OTP"}
            </button>
            {otpError && <span className="font-figtree text-[12px] text-[#E7000B]">{otpError}</span>}
          </>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-1.5 font-figtree text-[15px] font-semibold text-[#030303]">
          Email
          <span className="font-figtree text-[12px] font-normal text-[#9CA3AF]">
            optional
          </span>
        </label>
        <p className="font-figtree text-[13px] font-normal leading-[18px] text-[#71717B]">
          For your booking confirmation and receipt.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={saveEmail}
          placeholder="name@example.com"
          className="mt-2 h-12 w-full rounded-[16px] border border-[#E4E4E7] pt-[13.5px] pr-[14px] pb-[13.5px] pl-[14px] font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
        />
        {emailStatus && (
          <span
            className={`font-figtree text-[12px] ${emailStatus === "Saved." ? "text-[#71717B]" : "text-[#E7000B]"}`}
          >
            {emailSaving ? "Saving…" : emailStatus}
          </span>
        )}
      </div>
    </div>
  );
}
