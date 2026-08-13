// Domain types for the customer-facing Auth modal + full page. Both surfaces
// are driven by the same `useAuthForm` hook and `services/authService.ts`.

export type { Customer } from "@/lib/customerSession";
import type { Customer } from "@/lib/customerSession";

export type AuthStep = "signup" | "login" | "phone" | "otp";

export interface AuthFormState {
  step: AuthStep;
  name: string;
  email: string;
  password: string;
  phone: string;
  otp: string;
  loading: boolean;
  error: string;
  resendTimer: number;
}

/** What a successful auth flow (signup, login, or OAuth) hands back to the caller. */
export type AuthSuccessPayload = Customer;
