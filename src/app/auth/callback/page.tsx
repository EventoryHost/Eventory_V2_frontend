// src/app/auth/callback/page.tsx
//
// Landing page for the Google/Facebook OAuth redirect. The backend only
// redirects here with `?success=true|false` and sets accessToken/refreshToken
// as httpOnly cookies — it never hands the token to the frontend directly.
// So we bootstrap a JS-usable session by calling refresh-token (which reads
// the httpOnly refreshToken cookie server-side and returns a fresh
// accessToken in the JSON body), decoding it for the customer's id, then
// fetching their profile.
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { apiFetch, refreshAccessToken, ApiError } from "@/lib/apiClient";
import { decodeJwtPayload } from "@/lib/jwt";
import { setSession, type Customer } from "@/lib/customerSession";
import { mergeGuestCartIfAny } from "@/lib/customerCartApi";

const REDIRECT_STORAGE_KEY = "post_login_redirect";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      if (searchParams.get("success") !== "true") {
        if (!cancelled) setError("Sign-in failed. Please try again.");
        return;
      }

      try {
        const accessToken = await refreshAccessToken();
        const payload = decodeJwtPayload(accessToken);
        if (!payload?.id) throw new Error("Could not read account details from session.");

        const response = await apiFetch<{ success: true; data: Customer }>(`/customers/${payload.id}`);
        if (cancelled) return;

        setSession(response.data, accessToken);
        void mergeGuestCartIfAny();
        const redirectTo = window.sessionStorage.getItem(REDIRECT_STORAGE_KEY) ?? "/";
        window.sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
        router.replace(redirectTo);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Something went wrong finishing sign-in.");
      }
    }

    bootstrapSession();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-customer-bg px-4 text-center">
        <p className="font-figtree text-[15px] font-medium text-brand-950">{error}</p>
        <Link href="/auth" className="font-figtree text-[14px] font-semibold text-brand-primary hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-customer-bg">
      <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
      <p className="font-figtree text-[14px] text-neutral-secondary">Finishing sign-in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
