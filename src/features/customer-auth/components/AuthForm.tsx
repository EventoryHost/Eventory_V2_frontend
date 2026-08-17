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
    <div className="flex flex-col gap-4">
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
                <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">Your name</span>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full name"
                  autoComplete="name"
                  className="rounded-xl border border-black/15 bg-white px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">Mobile number</span>
              <div className="flex items-center rounded-xl border border-black/15 bg-white focus-within:border-brand-primary">
                <span className="border-r border-black/10 px-4 py-3 font-figtree text-[14px] font-medium text-neutral-secondary">
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
                  className="w-full rounded-r-xl bg-transparent px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none"
                />
              </div>
            </label>

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
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-figtree text-[13px] text-neutral-secondary">
                OTP sent to <span className="font-semibold text-brand-950">+91 {phone}</span>
              </p>
              <button
                type="button"
                onClick={switchToPhoneEntry}
                className="font-figtree text-[12px] font-semibold text-brand-primary hover:underline"
              >
                Change
              </button>
            </div>

            <OtpInputGroup value={otp} onChange={setOtp} hasError={Boolean(error)} />

            <div>
              {resendTimer > 0 ? (
                <span className="font-figtree text-[12px] text-neutral-tertiary">
                  Resend OTP in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-figtree text-[12px] font-semibold text-brand-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
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
            className="flex flex-col gap-4"
          >
            <p className="font-figtree text-[13px] text-neutral-secondary">
              Set a password so you can log in faster next time — optional, you can always use OTP instead.
            </p>

            <label className="flex flex-col gap-1.5">
              <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                autoFocus
                className="rounded-xl border border-black/15 bg-white px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="rounded-xl border border-black/15 bg-white px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
              />
            </label>
            {passwordMismatch && (
              <p className="-mt-2 font-figtree text-[12px] text-error-700">Passwords don&apos;t match.</p>
            )}

            <button
              type="button"
              onClick={handleSkipSetPassword}
              className="self-start font-figtree text-[12px] font-semibold text-neutral-tertiary hover:underline"
            >
              Skip for now
            </button>
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
              <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">Mobile number</span>
              <div className="flex items-center rounded-xl border border-black/15 bg-white focus-within:border-brand-primary">
                <span className="border-r border-black/10 px-4 py-3 font-figtree text-[14px] font-medium text-neutral-secondary">
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
                  className="w-full rounded-r-xl bg-transparent px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="rounded-xl border border-black/15 bg-white px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
              />
            </label>

            <button
              type="button"
              onClick={switchToPhoneEntry}
              className="self-start font-figtree text-[13px] font-semibold text-brand-primary hover:underline"
            >
              Forgot password? Log in with OTP instead
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="font-figtree text-[12px] font-medium text-error-700">{error}</p>}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!canContinue || loading}
        className="mt-1 flex w-full items-center justify-center rounded-xl bg-brand-primary py-3 font-figtree text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : CONTINUE_LABEL[step]}
      </button>
    </div>
  );
}
