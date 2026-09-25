// Shared hours -> human duration formatter for package durations.
//
// Package durations (step1_eventAndCrew.duration.minHours/maxHours,
// durationOfSetup, durationPerPerson) are stored as RAW HOURS everywhere,
// decimals allowed (1h30m = 1.5, 12h = 12). No minutes conversion is stored.
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
