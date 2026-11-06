import type { Metadata } from "next";

// Private route: never indexable, in any environment. (page.tsx is a client component, so metadata lives here.)
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
