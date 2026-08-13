"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { UseAuthFormReturn } from "../hooks/useAuthForm";
import OtpInputGroup from "./OtpInputGroup";

/**
 * Shared form body used by both AuthModal and the /auth full page — owns no
 * state itself, everything comes from `useAuthForm`. The two containers
 * differ only in what wraps this (heading copy, Google button placement,
 * branding panel), not in field behavior or validation.
 */
export default function AuthForm({ form }: { form: UseAuthFormReturn }) {
  const {
    step,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    phone,
    setPhone,
    otp,
    setOtp,
    loading,
    error,
    resendTimer,
    canContinue,
    handleContinue,
    handleResendOtp,
    handleSkipPhoneVerification,
    switchStep,
    goBackToPhone,
  } = form;

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        {(step === "signup" || step === "login") && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {step === "signup" && (
              <label className="flex flex-col gap-1.5">
                <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="rounded-xl border border-black/15 bg-white px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="rounded-xl border border-black/15 bg-white px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-figtree text-[13px] font-semibold text-neutral-secondary">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={step === "signup" ? "At least 8 characters" : "Enter your password"}
                autoComplete={step === "signup" ? "new-password" : "current-password"}
                className="rounded-xl border border-black/15 bg-white px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
              />
            </label>

            <p className="font-figtree text-[13px] text-neutral-secondary">
              {step === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchStep("login")}
                    className="font-semibold text-brand-primary hover:underline"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => switchStep("signup")}
                    className="font-semibold text-brand-primary hover:underline"
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>
          </motion.div>
        )}

        {(step === "phone" || step === "otp") && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {step === "phone" ? (
              <>
                <p className="font-figtree text-[13px] text-neutral-secondary">
                  Verify your mobile number to secure your account (optional).
                </p>
                <div className="flex items-center rounded-xl border border-black/15 bg-white focus-within:border-brand-primary">
                  <span className="border-r border-black/10 px-4 py-3 font-figtree text-[14px] font-medium text-neutral-secondary">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Mobile number"
                    className="w-full rounded-r-xl bg-transparent px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-figtree text-[13px] text-neutral-secondary">
                    OTP sent to <span className="font-semibold text-brand-950">+91 {phone}</span>
                  </p>
                  <button
                    type="button"
                    onClick={goBackToPhone}
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
              </>
            )}

            <button
              type="button"
              onClick={handleSkipPhoneVerification}
              className="self-start font-figtree text-[12px] font-semibold text-neutral-tertiary hover:underline"
            >
              Skip for now
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
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
      </button>
    </div>
  );
}
