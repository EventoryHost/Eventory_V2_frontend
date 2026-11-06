// Production: https://www.eventory.in. Set NEXT_PUBLIC_SITE_URL per Amplify branch (baked in at build time).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

// Only the production deployment sets this to "true"; every other environment stays noindex.
export const INDEXING_ENABLED = process.env.NEXT_PUBLIC_ENABLE_INDEXING === "true";

export const SITE_NAME = "Eventory";
