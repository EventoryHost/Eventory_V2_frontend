// Free, no-API-key geocoding via OpenStreetMap Nominatim — shared by the
// navbar's manual location search (LocationPickerModal) and its
// browser-geolocation auto-detect (useSelectedCity). See the note at the
// bottom of this file re: rate limits / when to graduate to a paid provider.

export interface LocationSuggestion {
  id: string;
  label: string;
}

interface NominatimAddress {
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  town?: string;
  village?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
}

const SIX_DIGIT_PINCODE = /^\d{6}$/;

/**
 * Nominatim's `display_name` is comma-separated, most-specific first, with
 * the country last for a country-scoped search — dropping it keeps rows
 * compact ("110001, New Delhi, Delhi" instead of "...Delhi, India").
 * Only used as a last-resort fallback when the structured address object
 * doesn't have enough fields to build the "District, City - Pincode" format.
 */
function simplifyDisplayName(displayName: string): string {
  const parts = displayName.split(",").map((part) => part.trim());
  if (parts[parts.length - 1] === "India") parts.pop();
  return parts.join(", ");
}

/**
 * Formats a Nominatim address into the app-wide "District, City - Pincode"
 * shape (country is always India here, so it's dropped rather than shown).
 * `state_district` is Nominatim's actual administrative-district field for
 * India (e.g. "Udupi"); city_district/suburb are sub-city localities used
 * as a district stand-in for places (mostly big metros) that don't carry
 * one. The pincode segment is only appended when it's a genuine 6-digit
 * Indian PIN — anything else (missing, or a malformed OSM entry) is
 * dropped rather than shown as if valid.
 */
function formatIndianAddress(address: NominatimAddress): string | null {
  const district = address.state_district || address.county || address.city_district;
  const city = address.city || address.town || address.village || address.suburb || address.neighbourhood;

  const parts = [district, city !== district ? city : null].filter(
    (part): part is string => Boolean(part)
  );
  if (parts.length === 0) return null;

  const base = parts.join(", ");
  return address.postcode && SIX_DIGIT_PINCODE.test(address.postcode)
    ? `${base} - ${address.postcode}`
    : base;
}

export async function searchIndianLocations(
  query: string,
  signal: AbortSignal
): Promise<LocationSuggestion[]> {
  // addressdetails=1 costs nothing extra request-wise (same single call)
  // but is what makes the structured District/City/Pincode formatting
  // possible for every one of the returned results.
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&addressdetails=1&limit=7&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) return [];
  const data: Array<{ place_id: number; display_name: string; address?: NominatimAddress }> =
    await response.json();
  return data.map((item) => ({
    id: String(item.place_id),
    label: (item.address && formatIndianAddress(item.address)) || simplifyDisplayName(item.display_name),
  }));
}

/**
 * Reverse-geocodes coordinates to the same "District, City - Pincode" shape
 * as searchIndianLocations, reading Nominatim's structured address
 * breakdown instead of its generic "name of the nearest point" result.
 * zoom=14 asks Nominatim to resolve at suburb precision; the address object
 * it returns still carries every administrative level regardless.
 */
async function reverseGeocodeToDistrict(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=14`;
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data: { address?: NominatimAddress; display_name?: string } = await response.json();
  const address = data.address ?? {};
  return formatIndianAddress(address) ?? (data.display_name ? simplifyDisplayName(data.display_name) : null);
}

// A district/locality-precision label is only honest if the underlying fix
// is actually that precise. Nominatim resolves whatever coordinates it's
// handed with equal confidence whether they're right or wrong — a "shows
// the wrong district" miss isn't a reverse-geocoding bug, it's the browser
// only having a coarse fix (no GPS chip on most desktops, or a weak lock on
// mobile data), which commonly falls back to IP-based positioning that
// resolves to an ISP's regional hub city rather than the device's real
// location. `coords.accuracy` is the radius (in meters) of the browser's
// own confidence circle — anything coarser than this is rejected rather
// than confidently shown.
export const MAX_TRUSTED_ACCURACY_METERS = 50_000;

export type GeolocationOutcome =
  | { status: "success"; label: string }
  | { status: "imprecise" }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "error" };

/**
 * One-shot "use my current location" flow: gets a fresh browser fix,
 * rejects it if too coarse to trust, and reverse-geocodes the rest to a
 * district-precision label. Shared by the navbar's passive auto-detect on
 * load and the location picker's explicit "Auto-detect my location" button.
 */
export function detectCurrentLocation(): Promise<GeolocationOutcome> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ status: "unsupported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          if (accuracy > MAX_TRUSTED_ACCURACY_METERS) {
            resolve({ status: "imprecise" });
            return;
          }
          const label = await reverseGeocodeToDistrict(latitude, longitude);
          resolve(label ? { status: "success", label } : { status: "error" });
        } catch {
          resolve({ status: "error" });
        }
      },
      (error) => {
        resolve({ status: error.code === error.PERMISSION_DENIED ? "denied" : "error" });
      },
      // enableHighAccuracy asks the browser to prefer GPS where available;
      // the longer timeout gives it room to acquire one instead of settling
      // for a fast, coarse network estimate.
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}

// --- On API keys ---
// Nominatim needs none — it's the free public OSM instance. Tradeoffs to
// know about: a soft ~1 request/second rate limit, no uptime SLA, and their
// usage policy asks heavy/production traffic to self-host or proxy through
// your own backend rather than hitting nominatim.openstreetmap.org directly
// from the browser. Fine for this "best-effort default location" feature at
// current scale. If it ever needs to be more reliable or higher-volume,
// swap in a paid provider such as Google's Geocoding API, LocationIQ, or
// OpenCage — each needs an API key issued from that provider's own console,
// billed to whichever account owns it (not something I can generate), which
// would then live in a `NEXT_PUBLIC_...` (or a backend-proxied, unexposed)
// env var and get read here in place of the nominatim.openstreetmap.org URLs.
