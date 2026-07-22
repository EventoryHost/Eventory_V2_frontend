const DEFAULT_API_BASE_URL = "http://localhost:4000/api";

export function getApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
  let baseUrl = envUrl.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location.hostname) {
    const currentHost = window.location.hostname;
    if (currentHost && currentHost !== "localhost" && currentHost !== "127.0.0.1") {
      try {
        const parsed = new URL(baseUrl);
        parsed.hostname = currentHost;
        return parsed.toString().replace(/\/$/, "");
      } catch (e) {
        return `http://${currentHost}:4000/api`;
      }
    }
  }
  return baseUrl;
}

export const API_BASE_URL = getApiBaseUrl();

export function apiUrl(path = "") {
  const base = getApiBaseUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
