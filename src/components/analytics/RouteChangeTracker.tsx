"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackVirtualPageView } from "@/lib/analytics";

// The first page load is already counted by GTM's own page view, so only
// later client-side navigations are pushed here.
export default function RouteChangeTracker() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (pathname?.startsWith("/dashboard")) return;
    trackVirtualPageView();
  }, [pathname, search]);

  return null;
}
