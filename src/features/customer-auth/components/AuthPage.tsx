"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthSuccessPayload } from "../types";
import { useAuthForm } from "../hooks/useAuthForm";
import AuthLogo from "./AuthLogo";
import GoogleButton from "./GoogleButton";
import AuthForm from "./AuthForm";

export default function AuthPage({
  onAuthenticated,
  redirectTo = "/",
  intent = "login",
}: {
  onAuthenticated?: (payload: AuthSuccessPayload) => void;
  redirectTo?: string;
  /** Only changes the copy/framing shown on the initial "phone" step — the underlying flow is identical either way. */
  intent?: "login" | "register";
}) {
  const router = useRouter();

  const form = useAuthForm((payload) => {
    onAuthenticated?.(payload);
    router.push(redirectTo);
  }, intent);

  const heading =
    form.step === "phone-password"
      ? "Welcome Back"
      : form.step === "otp"
        ? "Verify Your Number"
        : form.step === "set-password"
          ? "Set a Password"
          : intent === "register"
            ? "Create Your Account"
            : "Log In or Sign Up";
  const subheading =
    form.step === "phone-password"
      ? "Log in with your mobile number and password"
      : form.step === "otp"
        ? "Enter the OTP we just texted you"
        : form.step === "set-password"
          ? "Optional — makes logging in faster next time"
          : intent === "register"
            ? "Join Eventory in seconds — verify your number to get started"
            : "Enter your mobile number to continue planning your event";

  return (
    <div className="flex min-h-screen w-full bg-customer-bg">
      {/* Left branding panel — hidden on mobile per spec */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#FBE9E7] p-10 lg:flex xl:p-14">
        <div>
          <AuthLogo />
          <p
            className="mt-2 text-[15px] font-medium text-brand-950/70"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Make it happen
          </p>
        </div>

        <div className="relative mx-auto h-[420px] w-full max-w-[440px] overflow-hidden rounded-[32px] shadow-xl">
          <Image
            src="/images/customer/haldi.jpg"
            alt="Celebrations planned with Eventory"
            fill
            sizes="440px"
            className="object-cover"
            priority
          />
        </div>

        <p className="font-figtree text-[14px] font-medium text-brand-950/70">
          2500+ events planned this month
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <AuthLogo />
          </div>

          <h1 className="font-figtree text-[26px] font-bold text-brand-950">{heading}</h1>
          <p className="mt-1 mb-8 font-figtree text-[14px] text-neutral-secondary">{subheading}</p>

          <AuthForm form={form} intent={intent} />

          {form.step === "phone" && (
            <p className="mt-4 font-figtree text-[13px] text-neutral-secondary">
              {intent === "register" ? (
                <>
                  Already have an account?{" "}
                  <Link href="/auth" className="font-semibold text-brand-primary hover:underline">
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  New here?{" "}
                  <Link href="/register" className="font-semibold text-brand-primary hover:underline">
                    Create an account
                  </Link>
                </>
              )}
            </p>
          )}

          {(form.step === "phone" || form.step === "phone-password") && (
            <>
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-black/10" />
                <span className="font-figtree text-[12px] font-medium text-neutral-tertiary">or</span>
                <span className="h-px flex-1 bg-black/10" />
              </div>

              <GoogleButton
                onClick={() => form.handleGoogleLogin(redirectTo)}
                loading={form.loading}
                variant="secondary"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
