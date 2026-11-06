import type { MetadataRoute } from "next";
import { INDEXING_ENABLED, SITE_URL } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  // Every non-production deployment is closed to crawlers entirely.
  if (!INDEXING_ENABLED) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / transactional routes. "/contact" is the CHECKOUT contact step, not a public page.
      disallow: [
        "/dashboard",
        "/account",
        "/bookings",
        "/cart",
        "/compare",
        "/booking-summary",
        "/contact",
        "/payment",
        "/booking-success",
        "/auth",
        "/login",
        "/register",
        "/signup",
        "/packages/demo",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
