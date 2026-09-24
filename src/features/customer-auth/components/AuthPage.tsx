"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AuthSuccessPayload } from "../types";
import { useAuthForm } from "../hooks/useAuthForm";
import AuthForm from "./AuthForm";
import GoogleButton from "./GoogleButton";

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
      ? "Sign In"
      : form.step === "otp"
        ? "Enter OTP"
        : form.step === "set-password"
          ? "Set Password"
          : intent === "register"
            ? "Create Your Account"
            : "Log In or Sign Up";
  const subheading =
    form.step === "phone-password"
      ? "Sign In to your account"
      : form.step === "otp"
        ? `We have sent you an OTP at your number +91${form.phone}`
        : form.step === "set-password"
          ? "optional - can be done later"
          : intent === "register"
            ? "Join Eventory in seconds — verify your number to get started"
            : "Enter your mobile number to continue planning your event";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-customer-bg">
      {/* Left branding panel — hidden on mobile per spec */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex">
        <Image
          src="/images/customer/auth.png"
          alt="Celebrations planned with Eventory"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

        <div className="relative z-10 p-10 xl:p-14">
          <Image src="/images/customer/auth-logo.svg" alt="Eventory" width={40} height={40} />
        </div>

        <div className="relative z-10 flex flex-col gap-3 p-10 xl:p-14">
          <h2
            className="text-[36px] leading-[1.15] font-semibold tracking-[-0.03em] text-white italic"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Less chasing vendors,
            <br />
            more making memories
          </h2>
          <p className="font-figtree text-[16px] leading-[1.45] font-normal text-[#E4E4E7]">
            Discover and book trusted local vendors for any occasion. No calls, no follow-ups, no stress
          </p>
        </div>
      </div>

      {/* Right form panel — fixed to viewport height, scrolls internally
          without a visible scrollbar if content ever exceeds a short
          viewport, instead of pushing the whole page taller. */}
      <div
        className={`flex h-full w-full flex-1 items-center justify-center overflow-y-auto bg-white px-4 sm:px-6 lg:w-1/2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          form.step === "phone-password" ? "py-6" : "py-12"
        }`}
      >
        <div className={`flex w-full max-w-[416px] flex-col ${form.step === "phone-password" ? "lg:pt-6" : "lg:pt-16"}`}>
          <Image src="/images/customer/auth-logo.svg" alt="Eventory" width={48} height={48} />

          {form.step === "otp" && (
            <button
              type="button"
              onClick={form.switchToPhoneEntry}
              className="mt-6 flex items-center gap-1 self-start font-figtree text-[16px] tracking-[-0.01em] text-[#3F3F47]"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          )}

          <div className={form.step === "phone-password" ? "mt-4" : "mt-[26px]"}>
            <h1 className="font-figtree text-[28px] leading-none font-semibold tracking-[-0.01em] text-black">
              {heading}
            </h1>
            <p className="mt-1 font-figtree text-[14px] leading-[20px] font-medium tracking-[-0.02em] text-[#9F9FA9]">
              {subheading}
            </p>
          </div>

          <div className={form.step === "phone-password" ? "mt-6" : "mt-12"}>
            <AuthForm form={form} intent={intent} />
          </div>

          {(form.step === "phone" || form.step === "phone-password") && (
            <>
              <div className={`flex items-center gap-3 ${form.step === "phone-password" ? "mt-5" : "mt-8"}`}>
                <span className="h-px flex-1 bg-black/10" />
                <span className="font-figtree text-[12px] font-medium text-neutral-tertiary">
                  or
                </span>
                <span className="h-px flex-1 bg-black/10" />
              </div>

              <div className={form.step === "phone-password" ? "mt-5" : "mt-8"}>
                <GoogleButton
                  onClick={() => form.handleGoogleLogin(redirectTo)}
                  loading={form.loading}
                  variant="secondary"
                />
              </div>
            </>
          )}

          {(form.step === "phone" || form.step === "phone-password") && (
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
                  Don&apos;t have an account ?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-brand-primary hover:underline"
                  >
                    Sign Up
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
