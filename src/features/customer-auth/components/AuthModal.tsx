"use client";

import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { AuthSuccessPayload } from "../types";
import { useAuthForm } from "../hooks/useAuthForm";
import AuthLogo from "./AuthLogo";
import GoogleButton from "./GoogleButton";
import AuthForm from "./AuthForm";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthenticated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated?: (payload: AuthSuccessPayload) => void;
}) {
  const pathname = usePathname();
  const form = useAuthForm((payload) => {
    onAuthenticated?.(payload);
    onClose();
  });

  const heading =
    form.step === "phone-password"
      ? "Log In"
      : form.step === "otp"
        ? "Verify Your Number"
        : form.step === "set-password"
          ? "Set a Password"
          : "Log In or Sign Up";

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Log in or create an account"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-[440px] rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-neutral-secondary transition-colors hover:bg-black/10"
            >
              <X size={16} />
            </button>

            <div className="mb-6 flex flex-col items-center text-center">
              <AuthLogo size="sm" />
              <h2 className="mt-5 font-figtree text-[22px] font-bold text-brand-950">{heading}</h2>
            </div>

            <div className="flex flex-col gap-5">
              {(form.step === "phone" || form.step === "phone-password") && (
                <>
                  <GoogleButton onClick={() => form.handleGoogleLogin(pathname)} loading={form.loading} variant="primary" />

                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-black/10" />
                    <span className="font-figtree text-[12px] font-medium text-neutral-tertiary">or</span>
                    <span className="h-px flex-1 bg-black/10" />
                  </div>
                </>
              )}

              <AuthForm form={form} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
