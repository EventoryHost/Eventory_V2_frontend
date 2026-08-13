const DEFAULT_DEV_API_URL = "http://localhost:4000/api";
const DEFAULT_PROD_API_URL = "https://api-dev.eventory.in/api";

export function getApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (typeof window !== "undefined" && window.location.hostname) {
    const currentHost = window.location.hostname;

    // 1. If running on local LAN IP (e.g. 192.168.x.x, 10.x.x.x) or .local for mobile dev testing
    const isLocalIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(currentHost) || currentHost.endsWith('.local');
    if (isLocalIp) {
      return `http://${currentHost}:4000/api`;
    }

    // 2. If running on localhost / 127.0.0.1
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      return envUrl ? envUrl.replace(/\/$/, "") : DEFAULT_DEV_API_URL;
    }

    // 3. If running on deployed host (e.g. AWS Amplify, eventory.in domain)
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1") && !/^http:\/\/(\d{1,3}\.){3}\d{1,3}/.test(envUrl)) {
      return envUrl.replace(/\/$/, "");
    }
    
    return DEFAULT_PROD_API_URL;
  }

  // Server-side execution — trust whatever NEXT_PUBLIC_API_BASE_URL was set
  // to when this process started (that's what it's for). The "avoid
  // localhost" heuristic above only makes sense for guessing what a
  // *browser* can reach when it isn't itself on localhost; the Next.js
  // server process runs wherever it was started, so a "localhost" value is
  // exactly right in local dev (same machine as the backend) and should
  // never be silently swapped for the deployed default.
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  return DEFAULT_PROD_API_URL;
}

export const API_BASE_URL = getApiBaseUrl();

export function apiUrl(path = "") {
  const base = getApiBaseUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
