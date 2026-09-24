"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { UseAuthFormReturn } from "../hooks/useAuthForm";
import OtpInputGroup from "./OtpInputGroup";

const CONTINUE_LABEL: Record<string, string> = {
  phone: "Send OTP",
  otp: "Verify & Continue",
  "set-password": "Save & Continue",
  "phone-password": "Log In",
};

/**
 * Shared form body used by both AuthModal and the /auth full page — owns no
 * state itself, everything comes from `useAuthForm`. The two containers
 * differ only in what wraps this (heading copy, Google button placement,
 * branding panel), not in field behavior or validation.
 */
export default function AuthForm({
  form,
  intent = "login",
}: {
  form: UseAuthFormReturn;
  /** Shows a name field on the phone step when registering — the underlying flow is otherwise identical to login. */
  intent?: "login" | "register";
}) {
  const {
    step,
    name,
    setName,
    phone,
    setPhone,
    otp,
    setOtp,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    resendTimer,
    canContinue,
    passwordMismatch,
    handleContinue,
    handleResendOtp,
    handleSkipSetPassword,
    switchToPasswordLogin,
    switchToPhoneEntry,
  } = form;

  return (
    <div className="flex flex-col">
      <AnimatePresence mode="wait">
        {step === "phone" && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {intent === "register" && (
              <label className="flex flex-col gap-1.5">
                <span className="font-figtree text-[14px] leading-[20px] font-medium tracking-[-0.02em] text-[#71717B]">
                  What&apos;s your Name?
                </span>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full name"
                  autoComplete="name"
                  className="h-12 w-full rounded-full border border-[#E4E4E7] bg-white px-4 py-3.5 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="font-figtree text-[14px] leading-[20px] font-medium tracking-[-0.02em] text-[#71717B]">
                Phone
              </span>
              <div className="flex h-12 items-center rounded-full border border-[#E4E4E7] bg-white focus-within:border-brand-primary">
                <span className="border-r border-black/10 px-4 font-figtree text-[14px] font-medium text-neutral-secondary">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoFocus={intent !== "register"}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Mobile number"
                  className="h-full w-full rounded-r-full bg-transparent px-4 font-figtree text-[14px] text-brand-950 outline-none"
                />
              </div>
            </label>

            {intent !== "register" && (
              <>
                <p className="font-figtree text-[13px] text-neutral-secondary">
                  We&apos;ll text you a one-time code. New here? We&apos;ll set up your account automatically.
                </p>

                <button
                  type="button"
                  onClick={switchToPasswordLogin}
                  className="self-start font-figtree text-[13px] font-semibold text-brand-primary hover:underline"
                >
                  Already set a password? Log in instead
                </button>
              </>
            )}
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            <OtpInputGroup value={otp} onChange={setOtp} hasError={Boolean(error)} />

            <div className="flex items-center justify-between">
              <span className="font-figtree text-[14px] text-neutral-tertiary">
                {resendTimer > 0 ? `Resend in ${resendTimer} s` : "Didn't get it?"}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendTimer > 0}
                className="font-figtree text-[14px] font-semibold text-brand-primary hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                Resend
              </button>
            </div>
          </motion.div>
        )}

        {step === "set-password" && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-8"
          >
            <p className="font-figtree text-[14px] leading-[20px] text-[#9F9FA9]">
              Set a password so you can log in faster next time without the need for OTP.
            </p>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-figtree text-[14px] leading-[20px] font-medium tracking-[-0.02em] text-[#71717B]">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  autoFocus
                  className="h-12 w-full rounded-full border border-[#E4E4E7] bg-white px-4 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-figtree text-[14px] leading-[20px] font-medium tracking-[-0.02em] text-[#71717B]">
                  Confirm password
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="h-12 w-full rounded-full border border-[#E4E4E7] bg-white px-4 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
                />
              </label>
              {passwordMismatch && (
                <p className="font-figtree text-[12px] text-error-700">Passwords don&apos;t match.</p>
              )}
            </div>
          </motion.div>
        )}

        {step === "phone-password" && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1.5">
              <span className="font-figtree text-[14px] leading-[20px] font-medium tracking-[-0.02em] text-[#71717B]">
                Phone
              </span>
              <div className="flex h-12 items-center rounded-full border border-[#E4E4E7] bg-white focus-within:border-brand-primary">
                <span className="border-r border-black/10 px-4 font-figtree text-[14px] font-medium text-neutral-secondary">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoFocus
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Mobile number"
                  className="h-full w-full rounded-r-full bg-transparent px-4 font-figtree text-[14px] text-brand-950 outline-none"
                />
              </div>
            </label>

            <div className="flex flex-col gap-1.5">
              <label className="flex flex-col gap-1.5">
                <span className="font-figtree text-[14px] leading-[20px] font-medium tracking-[-0.02em] text-[#71717B]">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-12 w-full rounded-full border border-[#E4E4E7] bg-white px-4 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
                />
              </label>

              <button
                type="button"
                onClick={switchToPhoneEntry}
                className="self-end font-figtree text-[13px] font-semibold text-brand-primary hover:underline"
              >
                Forgot your password ?
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-4 font-figtree text-[12px] font-medium text-error-700">{error}</p>}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!canContinue || loading}
        className={`flex h-12 w-full items-center justify-center rounded-full bg-brand-primary py-3 font-figtree text-[15px] font-bold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#F4F4F5] disabled:text-[#9F9FA9] ${
          step === "phone-password" ? "mt-6" : "mt-10"
        }`}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : CONTINUE_LABEL[step]}
      </button>

      {step === "phone-password" && (
        <button
          type="button"
          onClick={switchToPhoneEntry}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-brand-primary font-figtree text-[15px] font-bold text-brand-primary transition-colors hover:bg-brand-subtle"
        >
          Log In with OTP
        </button>
      )}

      {step === "set-password" && (
        <button
          type="button"
          onClick={handleSkipSetPassword}
          className="mt-4 self-center font-figtree text-[14px] font-semibold text-brand-primary hover:underline"
        >
          Skip
        </button>
      )}
    </div>
  );
}
