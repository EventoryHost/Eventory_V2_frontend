// Domain types for the customer-facing Auth modal + full page. Both surfaces
// are driven by the same `useAuthForm` hook and `services/authService.ts`.

export type { Customer } from "@/lib/customerSession";
import type { Customer } from "@/lib/customerSession";

export type AuthStep = "phone" | "otp" | "set-password" | "phone-password";

export interface AuthFormState {
  step: AuthStep;
  name: string;
  phone: string;
  otp: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error: string;
  resendTimer: number;
}

/** What a successful auth flow (phone+OTP, phone+password, or OAuth) hands back to the caller. */
export type AuthSuccessPayload = Customer;
