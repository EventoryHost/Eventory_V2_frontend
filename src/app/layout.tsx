import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import TrackingScripts from "@/components/analytics/TrackingScripts";
import RouteChangeTracker from "@/components/analytics/RouteChangeTracker";
import ContactClickTracker from "@/components/analytics/ContactClickTracker";
import HeicInputConverter from "@/components/HeicInputConverter";
import { INDEXING_ENABLED, SITE_NAME, SITE_URL } from "@/lib/siteConfig";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Eventory – Book Event Decorators & Party Packages in Delhi NCR",
    template: "%s | Eventory",
  },
  description:
    "Book verified event decorators and curated party, birthday and baby shower packages from trusted vendors across Delhi NCR, all in one place.",
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en_IN" },
  robots: INDEXING_ENABLED ? { index: true, follow: true } : { index: false, follow: false },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${figtree.variable} font-sans antialiased`}>
        {children}
        <TrackingScripts />
        <ContactClickTracker />
        <HeicInputConverter />
        <Suspense fallback={null}>
          <RouteChangeTracker />
        </Suspense>
      </body>
    </html>
  );
}
