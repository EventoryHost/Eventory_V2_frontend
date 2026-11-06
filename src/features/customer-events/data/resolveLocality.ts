import { SERVICE_AREAS } from "@/features/customer-become-vendor/data/serviceAreas";

/**
 * Lowercased locality name -> its curated area ("indirapuram" -> "Ghaziabad"),
 * built once from the same "We are live in 200+ Localities" list the
 * become-a-vendor page and the vendor listing's locality filter use — so a
 * vendor's own declared locality can be traced back to the area it belongs
 * to instead of guessing from free text.
 */
const LOCALITY_TO_AREA = new Map<string, { area: string; locality: string }>();
for (const { area, localities } of SERVICE_AREAS) {
  for (const locality of localities) {
    LOCALITY_TO_AREA.set(locality.toLowerCase(), { area, locality });
  }
}

/**
 * Vendor `city` is free text (could be a literal address, a sector number, or
 * just the bare district name, e.g. "Ghaziabad"). Event cards should show the
 * named locality from the "We are live in 200+ Localities" list instead of
 * that literal string — so match it against the real locality/area names and
 * surface whichever one the text actually names. Returns `null` when `city`
 * doesn't name any curated area/locality at all (nothing to show).
 */
function resolveFromCityText(
  cityText: string
): { area: string; locality: string; specific: boolean } | null {
  const haystack = cityText.toLowerCase();

  for (const { area, localities } of SERVICE_AREAS) {
    const match = localities.find((locality) => haystack.includes(locality.toLowerCase()));
    if (match) return { area, locality: match, specific: true };
  }

  const areaMatch = SERVICE_AREAS.find(({ area }) => haystack.includes(area.toLowerCase()));
  if (areaMatch) return { area: areaMatch.area, locality: areaMatch.area, specific: false };

  return null;
}

/**
 * A vendor's own declared `serviceAreas` — either the legacy flat
 * `string[]` of locality names, or the newer `[{ area, sublocalities }]`
 * shape (see src/lib/vendorLocation.ts's getServiceAreaNames, which only
 * pulls the `area` and drops sublocalities; here we want the sublocalities
 * too, since THOSE are the real localities). Flattened to one list of
 * candidate strings to test against the curated locality list.
 */
function flattenServiceAreaCandidates(
  serviceAreas: Array<string | { area?: string; sublocalities?: string[] }> | null | undefined
): string[] {
  if (!Array.isArray(serviceAreas)) return [];
  const out: string[] = [];
  for (const entry of serviceAreas) {
    if (typeof entry === "string") {
      out.push(entry);
    } else if (entry) {
      if (entry.area) out.push(entry.area);
      if (Array.isArray(entry.sublocalities)) out.push(...entry.sublocalities);
    }
  }
  return out;
}

/**
 * Real mapping bug fixed (reported 2026-10-30: "most of the cards show
 * Ghaziabad, check if the logic ... is correct"): the event cards used to
 * resolve a locality from `vendor.city` ALONE. Many vendors only ever filled
 * in the bare city/district name there ("Ghaziabad") with no locality detail
 * at all — resolving against city text correctly identifies the AREA but has
 * nothing more specific to offer, so every such vendor's card showed the
 * area name itself, over and over.
 *
 * The vendor's `serviceAreas` field (picked during onboarding, see
 * utils/serviceAreas.js backend-side) DOES carry real, specific localities
 * ("Indirapuram", "Vaishali", "Raj Nagar", ...) even when `city` is bare —
 * this was simply never consulted. A `city` value that already names a
 * SPECIFIC known locality (not just the bare area, e.g. "Noida sector 62 a")
 * is trusted as-is — it's a direct, unambiguous match. Only when `city` is
 * bare (just an area name, e.g. "Ghaziabad") or unrecognised at all do we
 * fall back to serviceAreas, preferring a declared locality that belongs to
 * the same area `city` names (so a Ghaziabad vendor whose serviceAreas also
 * lists Delhi/Noida localities from the old uncurated picker doesn't get
 * mis-labelled into one of those instead), then any known locality at all,
 * then the bare area/city text itself.
 */
export function resolveVendorLocality(
  cityText: string | null | undefined,
  serviceAreas?: Array<string | { area?: string; sublocalities?: string[] }> | null
): string {
  const city = (cityText ?? "").trim();
  const cityResolved = city ? resolveFromCityText(city) : null;

  if (cityResolved?.specific) return cityResolved.locality;

  const candidates = flattenServiceAreaCandidates(serviceAreas);
  const knownCandidates = candidates
    .map((candidate) => LOCALITY_TO_AREA.get(candidate.trim().toLowerCase()))
    .filter((entry): entry is { area: string; locality: string } => Boolean(entry));

  if (knownCandidates.length > 0) {
    const sameArea = cityResolved
      ? knownCandidates.find((entry) => entry.area === cityResolved.area)
      : undefined;
    return (sameArea ?? knownCandidates[0]).locality;
  }

  if (cityResolved) return cityResolved.locality;
  return city;
}

/** @deprecated use resolveVendorLocality, which also consults the vendor's real serviceAreas instead of city text alone. */
export function resolveLocality(cityText: string): string {
  return resolveVendorLocality(cityText, null);
}
