"use client";

import { useEffect, useState } from "react";
import { detectCurrentLocation } from "@/lib/geocoding";

const STORAGE_KEY = "eventory_selected_city";

// Not a validation allowlist — just left in place in case some other UI
// still wants a short, curated list of major cities to offer. Auto-detect
// and manual picks both now show precise, free-form district/locality
// labels instead of normalizing onto this list.
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

async function detectCityFromGeolocation() {
  if (hasRequestedLocation) return;
  hasRequestedLocation = true;

  // Passive, best-effort default — an imprecise/denied/unsupported outcome
  // just leaves the picker on "Select City" so the user picks manually (or
  // uses the picker's own "Auto-detect my location" button, which surfaces
  // these same outcomes as visible feedback instead of failing silently).
  const outcome = await detectCurrentLocation();
  if (outcome.status !== "success") return;
  city = outcome.label;
  persist(city);
  emit();
}

/** Overwrites the auto-detected city — a manual pick from LocationPickerModal always wins. */
export function setSelectedCity(next: string) {
  city = next;
  persist(next);
  emit();
}

/** Detected/selected city for the navbar's location picker, with browser-geolocation autodetect on first load. */
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
