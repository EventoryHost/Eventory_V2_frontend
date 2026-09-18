// src/app/register/page.tsx
import AuthPage from "@/features/customer-auth/components/AuthPage";

/**
 * Only same-origin paths are honoured — "//evil.example" is a
 * protocol-relative URL the browser would treat as another origin, so it's
 * rejected along with anything that isn't a plain absolute path.
 */
function safeRedirect(value: string | string[] | undefined) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return <AuthPage intent="register" redirectTo={safeRedirect(redirectTo)} />;
}
