"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { AuthSuccessPayload } from "../types";
import { useAuthForm } from "../hooks/useAuthForm";
import AuthLogo from "./AuthLogo";
import GoogleButton from "./GoogleButton";
import AuthForm from "./AuthForm";

export default function AuthPage({
  onAuthenticated,
  redirectTo = "/",
}: {
  onAuthenticated?: (payload: AuthSuccessPayload) => void;
  redirectTo?: string;
}) {
  const router = useRouter();

  const form = useAuthForm((payload) => {
    onAuthenticated?.(payload);
    router.push(redirectTo);
  });

  const heading = form.step === "login" ? "Welcome Back" : form.step === "signup" ? "Create Account" : "Verify Your Number";
  const subheading =
    form.step === "login"
      ? "Log in to continue planning your event"
      : form.step === "signup"
        ? "Join Eventory in 30 seconds"
        : "Add and verify your mobile number";

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

          <AuthForm form={form} />

          {(form.step === "signup" || form.step === "login") && (
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
