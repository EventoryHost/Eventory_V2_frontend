// Shared hours -> human duration formatter for package durations.
//
// Package durations (step1_eventAndCrew.duration.minHours/maxHours,
// durationOfSetup, durationPerPerson) are stored as RAW HOURS everywhere,
// decimals allowed (1h30m = 1.5, 12h = 12). Packages saved by older vendor
// app builds may still hold minutes: customer pages pass a package's values
// through packageDurationsInHours (below) before formatting them.
//
// Format: 1.5 -> "1 hr 30 min", 12 -> "12 hrs", 1 -> "1 hr", 0.5 -> "30 min".
export function formatHoursLabel(hours: number): string {
  const value = Number(hours);
  if (!Number.isFinite(value) || value < 0) return "—";
  const totalMinutes = Math.round(value * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourPart = `${wholeHours} ${wholeHours === 1 ? "hr" : "hrs"}`;
  if (minutes === 0) return hourPart;
  if (wholeHours === 0) return `${minutes} min`;
  return `${hourPart} ${minutes} min`;
}

// Range variant, e.g. (1.5, 12) -> "1 hr 30 min - 12 hrs". Collapses to a
// single label when only one end is set or both ends are equal. Returns ""
// when neither end is a positive number, so callers pick their own fallback.
export function formatHoursRangeLabel(minHours?: number | null, maxHours?: number | null): string {
  const low = Number(minHours) || 0;
  const high = Number(maxHours) || 0;
  if (low > 0 && high > 0 && low !== high) {
    return `${formatHoursLabel(low)} - ${formatHoursLabel(high)}`;
  }
  if (low > 0 || high > 0) return formatHoursLabel(low || high);
  return "";
}

// ---------------------------------------------------------------------------
// Legacy minute values
//
// Before eventory_business_app_v2 #70 the vendor app saved these fields in
// MINUTES (90 for "1 hr 30 min", 720 for "12 hrs"), always picked from one
// fixed dropdown. Until every such package is migrated, customer pages
// normalise a package's durations to hours before formatting them.
//
// The rule matches Eventory_V2_backend's migrate_package_durations_to_hours.mjs
// so the page and the migration always agree: take the package's non-zero
// duration values together; if EVERY value is in the old app's minute list
// and at least one is above 24 (no hours-based writer goes above 24), they
// are all minutes. Anything else is hours, including the ambiguous case (a
// lone 15) and a mix of list and non-list values.
//
// Known false positive: web DJ/PAV/Venue/Makeup forms accept any whole
// number, so a genuine 30- or 60-hour package would be read as minutes.

/** Every value the vendor app's minute-keyed duration dropdowns could save. */
export const LEGACY_APP_MINUTE_VALUES: ReadonlySet<number> = new Set([
  15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 480, 600, 720,
  840, 960, 1080, 1200, 1320, 1440,
]);

/** Largest value any hours-based writer (web dashboard, current app) saves. */
export const MAX_PLAUSIBLE_HOURS = 24;

type DurationValue = number | null | undefined;

/** The Step 1 duration fields a customer page may have for one package. */
export interface PackageDurations {
  duration?: { minHours?: DurationValue; maxHours?: DurationValue } | null;
  durationOfSetup?: DurationValue;
  durationPerPerson?: DurationValue;
}

/** True when a package's durations, taken together, were saved as minutes. */
export function isLegacyMinuteValued(values: DurationValue[]): boolean {
  const present = values.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0);
  if (!present.length) return false;
  return (
    present.every((v) => LEGACY_APP_MINUTE_VALUES.has(v)) &&
    present.some((v) => v > MAX_PLAUSIBLE_HOURS)
  );
}

const minutesToHours = (minutes: number) => Math.round((minutes / 60) * 100) / 100;

/**
 * A package's durations in hours, whichever unit they were stored in. Pass
 * every duration field the page has for the package so the unit is decided
 * on all of them together, as the migration does.
 */
export function packageDurationsInHours(pkg: PackageDurations | null | undefined): {
  minHours?: number;
  maxHours?: number;
  durationOfSetup?: number;
  durationPerPerson?: number;
} {
  const raw = {
    minHours: pkg?.duration?.minHours,
    maxHours: pkg?.duration?.maxHours,
    durationOfSetup: pkg?.durationOfSetup,
    durationPerPerson: pkg?.durationPerPerson,
  };
  const minutes = isLegacyMinuteValued(Object.values(raw));
  const toHours = (v: DurationValue) => {
    if (v === null || v === undefined) return undefined;
    const n = Number(v);
    return minutes && Number.isFinite(n) ? minutesToHours(n) : n;
  };
  return {
    minHours: toHours(raw.minHours),
    maxHours: toHours(raw.maxHours),
    durationOfSetup: toHours(raw.durationOfSetup),
    durationPerPerson: toHours(raw.durationPerPerson),
  };
}
