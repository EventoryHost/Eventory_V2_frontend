import { apiFetch } from "@/lib/apiClient";
import { apiUrl } from "@/lib/api";
import type { Customer } from "@/lib/customerSession";

interface AuthResponse {
  success: true;
  message: string;
  accessToken: string;
  customer: Customer;
}

export async function logout() {
  return apiFetch<{ success: true; message: string }>("/customer/auth/logout", { method: "POST", auth: false });
}

export async function sendPhoneOtp(mobile: string) {
  return apiFetch<{ success: true; message: string; session: string }>("/customer/phone/send-otp", {
    method: "POST",
    body: { mobile },
  });
}

/**
 * Verifies the OTP for the given phone number/session — the primary entry
 * point for phone-based login and signup. The backend creates a new account
 * on first verification for a given mobile number, or attaches/confirms the
 * number on an existing one, and returns both the customer and a JS-usable
 * accessToken directly in the body.
 */
export async function verifyPhoneOtp(input: { mobile: string; code: string; session: string; name?: string }) {
  return apiFetch<AuthResponse>("/customer/phone/verify-otp", { method: "POST", body: input });
}

/**
 * Same /phone/verify-otp endpoint as verifyPhoneOtp, but for an
 * already-logged-in customer re-verifying/attaching a phone number (e.g. the
 * checkout Contact page's "Verify with OTP") — the backend runs its
 * "attach/re-verify on my own account" branch here instead of the anonymous
 * login branch, and returns the updated Customer directly rather than a new
 * accessToken/session.
 */
export async function verifyPhoneOtpForAccount(input: { mobile: string; code: string; session: string }) {
  return apiFetch<{ success: true; message: string; data: Customer }>("/customer/phone/verify-otp", {
    method: "POST",
    body: input,
  });
}

/** Alternate login for customers who've set a password — same endpoint as email login, keyed by mobile instead. */
export async function loginWithPassword(input: { mobile: string; password: string }) {
  return apiFetch<AuthResponse>("/customer/auth/login", { method: "POST", body: input, auth: false });
}

/** Sets a password on the current (already phone-authenticated) account, enabling phone+password login next time. */
export async function setCustomerPassword(password: string) {
  const response = await apiFetch<{ success: true; message: string; data: Customer }>(
    "/customer/auth/set-password",
    { method: "POST", body: { password } }
  );
  return response.data;
}

/** Full-page redirect target — not a fetch call, the backend itself redirects to Google. */
export function googleLoginUrl() {
  return apiUrl("/customer/auth/google");
}
