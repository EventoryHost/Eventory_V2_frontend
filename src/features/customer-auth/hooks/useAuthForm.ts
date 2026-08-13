"use client";

import { useEffect, useState } from "react";
import { signup, login, sendPhoneOtp, verifyPhoneOtp, googleLoginUrl } from "../services/authService";
import { useCustomerSession } from "./useCustomerSession";
import type { AuthStep } from "../types";
import type { Customer } from "@/lib/customerSession";
import { ApiError } from "@/lib/apiClient";
import { mergeGuestCartIfAny } from "@/lib/customerCartApi";

const RESEND_SECONDS = 30;
const REDIRECT_STORAGE_KEY = "post_login_redirect";

/**
 * Shared state + handlers for both AuthModal and the /auth full page — see
 * components/AuthForm.tsx, which is the shared presentational component
 * this hook is meant to be paired with.
 *
 * Step flow: signup/login (email+password) -> on success, if the customer's
 * phone isn't verified yet, "phone"/"otp" (optional, skippable) -> onSuccess.
 */
export function useAuthForm(onSuccess: (customer: Customer) => void, defaultStep: "signup" | "login" = "signup") {
  const { login: storeSession } = useCustomerSession();

  const [step, setStep] = useState<AuthStep>(defaultStep);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSession, setOtpSession] = useState("");
  const [pendingCustomer, setPendingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  function getErrorMessage(err: unknown) {
    if (err instanceof ApiError) return err.message;
    return err instanceof Error ? err.message : "Something went wrong. Please try again.";
  }

  const canContinueSignup = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && password.length >= 8;
  const canContinueLogin = /\S+@\S+\.\S+/.test(email) && password.length > 0;
  const canContinuePhone = phone.length === 10;
  const canContinueOtp = otp.length === 6;
  const canContinue =
    step === "signup"
      ? canContinueSignup
      : step === "login"
        ? canContinueLogin
        : step === "phone"
          ? canContinuePhone
          : canContinueOtp;

  function afterAuthenticated(customer: Customer, accessToken: string) {
    storeSession(customer, accessToken);
    // Deliberately explicit, once, right after login succeeds — not automatic
    // on every page load (matches the backend's own guidance for /cart/merge).
    void mergeGuestCartIfAny();
    if (!customer.isPhoneVerified) {
      setPendingCustomer(customer);
      setStep("phone");
      return;
    }
    onSuccess(customer);
  }

  async function handleContinue() {
    if (loading) return;

    if (step === "signup") {
      if (!canContinueSignup) return;
      setLoading(true);
      setError("");
      try {
        const result = await signup({ name, email, password });
        afterAuthenticated(result.customer, result.accessToken);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === "login") {
      if (!canContinueLogin) return;
      setLoading(true);
      setError("");
      try {
        const result = await login({ email, password });
        afterAuthenticated(result.customer, result.accessToken);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

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

    if (!canContinueOtp) return;
    setLoading(true);
    setError("");
    try {
      const updatedCustomer = await verifyPhoneOtp({ mobile: phone, code: otp, session: otpSession });
      onSuccess(updatedCustomer);
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

  function handleSkipPhoneVerification() {
    if (pendingCustomer) onSuccess(pendingCustomer);
  }

  function handleGoogleLogin(redirectTo?: string) {
    if (typeof window === "undefined") return;
    if (redirectTo) window.sessionStorage.setItem(REDIRECT_STORAGE_KEY, redirectTo);
    window.location.href = googleLoginUrl();
  }

  function switchStep(nextStep: "signup" | "login") {
    setStep(nextStep);
    setError("");
    setPassword("");
  }

  function goBackToPhone() {
    setStep("phone");
    setOtp("");
    setError("");
  }

  return {
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
    handleGoogleLogin,
    switchStep,
    goBackToPhone,
  };
}

export type UseAuthFormReturn = ReturnType<typeof useAuthForm>;
