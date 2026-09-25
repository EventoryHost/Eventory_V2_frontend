import { apiFetch } from "@/lib/apiClient";
import { apiUrl } from "@/lib/api";
import type { Customer, CustomerAddress } from "@/lib/customerSession";

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
  // Shared by the anonymous login/register flow AND the already-logged-in
  // "Verify with OTP" flows (ContactDetailsForm, PhoneEditForm) — unlike
  // verifyPhoneOtp/verifyPhoneOtpForAccount below, this one function serves
  // both, so it must keep sending auth (header + cookie) by default; the
  // backend's own req.customer check here (409 on a phone already linked to
  // another account) only matters for, and only runs for, the
  // already-logged-in callers.
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
  // auth: false — this is the anonymous login/signup path (the OTP screen
  // on /auth or /register). Without it, apiFetch attaches any token still
  // sitting in storage (a leftover/expired session, or a different
  // account's), and the backend runs its "attach this phone to whichever
  // account that token belongs to" branch instead of a fresh login — so
  // typing a different number here silently left the customer on their old
  // session instead of logging them into the number they just verified.
  // See verifyPhoneOtpForAccount below for the (correct) authenticated case.
  //
  // credentials: "omit" — REAL BUG FOUND 2026-09-26: auth:false above only
  // suppresses the Authorization HEADER. apiFetch still sends
  // credentials:"include" by default, so a browser that still carries a
  // valid httpOnly accessToken COOKIE (e.g. a previous logout() call whose
  // fire-and-forget POST /customer/auth/logout silently failed, leaving the
  // cookie uncleared while localStorage was cleared anyway) gets identified
  // by the backend's identifyOptionalCustomer middleware via that cookie
  // regardless. The backend then runs the SAME "already logged in, just
  // attaching a phone" branch this comment already warns about — and that
  // branch always returns accessToken:null (no new session issued for an
  // already-logged-in customer). storeSession(customer, null) then leaves
  // isLoggedIn false (customerSession.ts's persist()/isLoggedIn both
  // require a truthy accessToken), so the navbar keeps showing
  // Signup/Login even though the OTP itself verified successfully — the
  // exact symptom reported. Omitting credentials here closes the gap
  // between "intended anonymous" and "actually still authenticated via a
  // stale cookie" for good, without touching verifyPhoneOtpForAccount's
  // legitimate authenticated use below.
  return apiFetch<AuthResponse>("/customer/phone/verify-otp", {
    method: "POST",
    body: input,
    auth: false,
    credentials: "omit",
  });
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

/**
 * The signed-in customer's own profile — GET /api/customers/:id, which is
 * `protectCustomer, requireSelf` on the backend, so `customerId` must be the
 * caller's own `id` (the model's `id` field, not `_id`) or it 403s.
 *
 * Note the plural `/customers` mount here: it's a different router from the
 * `/customer/*` namespace everything else in this file uses.
 */
export async function getCustomerProfile(customerId: string) {
  const response = await apiFetch<{ success: true; data: Customer }>(
    `/customers/${encodeURIComponent(customerId)}`,
    { auth: true }
  );
  return response.data;
}

/** Fields the backend lets a customer change on themselves — SELF_UPDATABLE_FIELDS in customerController.js. */
export interface CustomerProfilePatch {
  name?: string;
  gender?: Customer["gender"];
  profilePicture?: string;
  dateOfBirth?: string;
  /**
   * Replaces the whole array — there's no per-address endpoint, so callers
   * must send every address they want to keep, not just the changed one.
   * Max 10, enforced by the validator.
   */
  addresses?: CustomerAddress[];
}

/**
 * PATCH /api/customers/:id. The validator is `.strict()`, so any key outside
 * the patch type above is a 400 rather than being silently dropped.
 */
export async function updateCustomerProfile(customerId: string, patch: CustomerProfilePatch) {
  const response = await apiFetch<{ success: true; data: Customer }>(
    `/customers/${encodeURIComponent(customerId)}`,
    { method: "PATCH", auth: true, body: patch }
  );
  return response.data;
}

/**
 * PATCH /api/customers/:id/email — its own endpoint because changing the
 * address resets isEmailVerified (no verification mail is actually sent;
 * the backend reports it honestly as unverified). 409s when another account
 * already holds that address.
 */
export async function updateCustomerEmail(customerId: string, email: string) {
  const response = await apiFetch<{ success: true; message: string; data: Customer }>(
    `/customers/${encodeURIComponent(customerId)}/email`,
    { method: "PATCH", auth: true, body: { email } }
  );
  return response.data;
}
