"use client";

import { useEffect, useState } from "react";
import { sendPhoneOtp, verifyPhoneOtp, loginWithPassword, setCustomerPassword, googleLoginUrl } from "../services/authService";
import { useCustomerSession } from "./useCustomerSession";
import type { AuthStep } from "../types";
import type { Customer } from "@/lib/customerSession";
import { ApiError } from "@/lib/apiClient";
import { mergeGuestCartIfAny } from "@/lib/customerCartApi";

const RESEND_SECONDS = 30;
const REDIRECT_STORAGE_KEY = "post_login_redirect";

/** A "local" auth provider entry means the account has a password set. */
function hasLocalPassword(customer: Customer) {
  return customer.authProviders?.some((provider) => provider.provider === "local") ?? false;
}

/**
 * Shared state + handlers for both AuthModal and the /auth full page — see
 * components/AuthForm.tsx, which is the shared presentational component
 * this hook is meant to be paired with.
 *
 * Step flow: phone -> otp (verifying the code logs the customer into an
 * existing account or creates a new one) -> set-password (optional,
 * skippable) -> onSuccess. "phone-password" is the alternate entry point,
 * reachable from the phone step, for customers who already set a password.
 */
export function useAuthForm(onSuccess: (customer: Customer) => void, intent: "login" | "register" = "login") {
  const { login: storeSession, session: currentCustomer } = useCustomerSession();

  const [step, setStep] = useState<AuthStep>("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSession, setOtpSession] = useState("");

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  function getErrorMessage(err: unknown) {
    if (err instanceof ApiError) return err.message;
    return err instanceof Error ? err.message : "Something went wrong. Please try again.";
  }

  const canContinuePhone = phone.length === 10 && (intent !== "register" || name.trim().length > 0);
  const canContinueOtp = otp.length === 6;
  const canContinueSetPassword = password.length >= 8 && password === confirmPassword;
  const canContinuePhonePassword = phone.length === 10 && password.length > 0;
  const passwordMismatch = step === "set-password" && confirmPassword.length > 0 && password !== confirmPassword;

  const canContinue =
    step === "phone"
      ? canContinuePhone
      : step === "otp"
        ? canContinueOtp
        : step === "set-password"
          ? canContinueSetPassword
          : canContinuePhonePassword;

  async function handleContinue() {
    if (loading) return;

    if (step === "phone") {
      if (!canContinuePhone) return;
      setLoading(true);
      setError("");
      try {
        const result = await sendPhoneOtp(phone);
        setOtpSession(result.session);
        setStep("otp");
        setResendTimer(RESEND_SECONDS);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === "otp") {
      if (!canContinueOtp) return;
      setLoading(true);
      setError("");
      try {
        const { customer, accessToken } = await verifyPhoneOtp({
          mobile: phone,
          code: otp,
          session: otpSession,
          ...(intent === "register" && name.trim() ? { name: name.trim() } : {}),
        });
        storeSession(customer, accessToken);
        void mergeGuestCartIfAny();
        if (!hasLocalPassword(customer)) {
          setStep("set-password");
        } else {
          onSuccess(customer);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === "set-password") {
      if (!canContinueSetPassword) return;
      setLoading(true);
      setError("");
      try {
        const updatedCustomer = await setCustomerPassword(password);
        onSuccess(updatedCustomer);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!canContinuePhonePassword) return;
    setLoading(true);
    setError("");
    try {
      const result = await loginWithPassword({ mobile: phone, password });
      storeSession(result.customer, result.accessToken);
      void mergeGuestCartIfAny();
      onSuccess(result.customer);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await sendPhoneOtp(phone);
      setOtpSession(result.session);
      setResendTimer(RESEND_SECONDS);
      setOtp("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSkipSetPassword() {
    if (currentCustomer) onSuccess(currentCustomer);
  }

  function handleGoogleLogin(redirectTo?: string) {
    if (typeof window === "undefined") return;
    if (redirectTo) window.sessionStorage.setItem(REDIRECT_STORAGE_KEY, redirectTo);
    window.location.href = googleLoginUrl();
  }

  function switchToPasswordLogin() {
    setStep("phone-password");
    setError("");
    setPassword("");
  }

  function switchToPhoneEntry() {
    setStep("phone");
    setOtp("");
    setPassword("");
    setError("");
  }

  return {
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
    handleGoogleLogin,
    switchToPasswordLogin,
    switchToPhoneEntry,
  };
}

export type UseAuthFormReturn = ReturnType<typeof useAuthForm>;
