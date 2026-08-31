"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "eventory_selected_city";

export const SUPPORTED_CITIES = [
  "Mumbai",
  "Pune",
  "Bangalore",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
] as const;

type Listener = () => void;

// Module-scoped so every CitySelect instance (desktop + mobile) shares one
// value and only one geolocation/reverse-geocode request ever fires, even
// though both are mounted in the DOM at once (one just CSS-hidden).
let city: string | null = null;
let hasHydrated = false;
let hasRequestedLocation = false;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

function hydrateFromStorage() {
  if (hasHydrated) return;
  hasHydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) city = stored;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall back to no stored city.
  }
}

function persist(next: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore — nothing to persist to
  }
}

/** Matches a free-form locality/city string from reverse geocoding against our supported list. */
function matchSupportedCity(candidate: string): string | null {
  const normalized = candidate.trim().toLowerCase();
  return SUPPORTED_CITIES.find((c) => c.toLowerCase() === normalized) ?? null;
}

function detectCityFromGeolocation() {
  if (hasRequestedLocation || !navigator.geolocation) return;
  hasRequestedLocation = true;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Free, no-API-key reverse geocoding endpoint — good enough for a
        // best-effort "detect my city" default. Swap for a backend-proxied
        // provider later if rate limits become an issue.
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        if (!response.ok) return;
        const data = await response.json();
        const candidate: string | undefined = data.city || data.locality || data.principalSubdivision;
        if (!candidate) return;
        city = matchSupportedCity(candidate) ?? candidate;
        persist(city);
        emit();
      } catch {
        // Silently fall back to "Select City" — this is a convenience default, not critical.
      }
    },
    () => {
      // Permission denied or unavailable — user can still pick manually.
    },
    { timeout: 8000 }
  );
}

export function setSelectedCity(next: string) {
  city = next;
  persist(next);
  emit();
}

/** Detected/selected city for the navbar's city picker, with browser-geolocation autodetect on first load. */
export function useSelectedCity() {
  const [selectedCity, setSelectedCityState] = useState<string | null>(null);

  useEffect(() => {
    hydrateFromStorage();
    setSelectedCityState(city);

    const listener = () => setSelectedCityState(city);
    listeners.add(listener);
    if (!city) detectCityFromGeolocation();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { city: selectedCity, setCity: setSelectedCity };
}
