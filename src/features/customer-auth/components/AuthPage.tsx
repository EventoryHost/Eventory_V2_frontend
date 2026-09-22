"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
          <h2 className="font-figtree text-[44px] leading-none font-semibold tracking-[-0.01em] text-[#F0596F]">
            Eventory
          </h2>
          <p className="mt-2 font-figtree text-[28px] leading-[32px] font-semibold tracking-[-0.01em] text-[#3F3F47]">
            Make it happen
          </p>
        </div>

        <div className="relative mx-auto mt-5 h-[470px] w-full max-w-[440px] overflow-hidden rounded-[32px] shadow-xl">
          <Image
            src="/images/customer/auth.png"
            alt="Celebrations planned with Eventory"
            fill
            sizes="440px"
            className="object-cover"
            priority
          />
        </div>

        <p className="mt-auto font-figtree text-[14px] font-medium text-brand-950/70">
          2500+ events planned this month
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2">
        <div className="flex w-full max-w-[416px] flex-col gap-4 lg:pt-[72px]">
          <div className="mb-4 lg:hidden">
            <AuthLogo />
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="hidden items-center gap-1 self-start font-figtree text-[16px] leading-[32px] tracking-[-0.01em] text-[#3F3F47] lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <h1 className="font-figtree text-[28px] leading-none font-semibold tracking-[-0.01em] text-black">
              {heading}
            </h1>
            <p className="mt-1 font-figtree text-[14px] leading-[20px] font-medium tracking-[-0.02em] text-[#9F9FA9]">
              {subheading}
            </p>
          </div>

          <AuthForm form={form} intent={intent} />

          {(form.step === "phone" || form.step === "phone-password") && (
            <>
              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-black/10" />
                <span className="font-figtree text-[12px] font-medium text-neutral-tertiary">
                  or
                </span>
                <span className="h-px flex-1 bg-black/10" />
              </div>

              <GoogleButton
                onClick={() => form.handleGoogleLogin(redirectTo)}
                loading={form.loading}
                variant="secondary"
              />
            </>
          )}

          {form.step === "phone" && (
            <p className="mt-4 text-center font-figtree text-[13px] text-neutral-secondary">
              {intent === "register" ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/auth"
                    className="font-semibold text-brand-primary hover:underline"
                  >
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  New here?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-brand-primary hover:underline"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
