import { apiFetch } from "@/lib/apiClient";
import { apiUrl } from "@/lib/api";
import type { Customer } from "@/lib/customerSession";

interface AuthResponse {
  success: true;
  message: string;
  accessToken: string;
  customer: Customer;
}

export async function signup(input: { name: string; email: string; password: string }) {
  return apiFetch<AuthResponse>("/customer/auth/signup", { method: "POST", body: input, auth: false });
}

export async function login(input: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/customer/auth/login", { method: "POST", body: input, auth: false });
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

export async function verifyPhoneOtp(input: { mobile: string; code: string; session: string }) {
  const response = await apiFetch<{ success: true; message: string; data: Customer }>(
    "/customer/phone/verify-otp",
    { method: "POST", body: input }
  );
  return response.data;
}

/** Full-page redirect target — not a fetch call, the backend itself redirects to Google. */
export function googleLoginUrl() {
  return apiUrl("/customer/auth/google");
}
