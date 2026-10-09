// A vendor's `city` field is meant to hold just a city name ("Ghaziabad"),
// but nothing in the vendor-onboarding form or admin verification review
// stops someone from typing a full street address into it instead (real
// bug found live: a vendor's city field held
// "D305 gali no 40 Akhbarpur Baharampur sandeep garden ghaziabad" and it
// passed admin review, then rendered as a location chip on their public
// profile). The real fix for a given vendor is correcting their data, but
// every place that composes `[city, ...serviceAreas]` into a location
// display should also have this safety net so a future bad entry doesn't
// surface the same way before someone catches it.
//
// Heuristic, not exhaustive: a real city/area name ("Ghaziabad", "Greater
// Noida", "Sector 62") is short, a handful of words, and rarely contains a
// digit (serviceAreas CAN legitimately contain a sector number, but this
// guard is only ever applied to `city`, which should never need one).
const MAX_CITY_LENGTH = 30;
const MAX_CITY_WORDS = 4;

export function looksLikeAddress(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const wordCount = trimmed.split(/\s+/).length;
  return trimmed.length > MAX_CITY_LENGTH || wordCount > MAX_CITY_WORDS || /\d/.test(trimmed);
}

/** Returns `city` unchanged, or null when it looks like an address rather than a city name. */
export function sanitizeCityName(city: string | null | undefined): string | null {
  if (!city) return null;
  return looksLikeAddress(city) ? null : city;
}
