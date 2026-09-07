// Shared minutes -> compact duration formatter. Used wherever a duration
// value is being treated as minutes for display (see callers for the
// specific field/backend-unit caveats behind each usage).
//
// Format: under 60 -> "Xm" (e.g. "30m"). 60+ -> decimal hours, trailing
// ".0" dropped -> "X.Y hr" (e.g. 90 -> "1.5 hr", 480 -> "8 hr").
function toDurationParts(minutes: number): { display: string; unit: "m" | "hr" } {
  if (minutes < 60) {
    return { display: `${minutes}`, unit: "m" };
  }
  const hours = Math.round((minutes / 60) * 10) / 10; // 1 decimal place, "8.0" -> 8
  return { display: `${hours}`, unit: "hr" };
}

export function formatMinutesLabel(minutes: number): string {
  const { display, unit } = toDurationParts(minutes);
  return unit === "m" ? `${display}m` : `${display} hr`;
}

// Range variant — unit is only repeated when the two ends actually differ
// (e.g. "30m - 2 hr"); same-unit ranges state it once at the end
// (e.g. "1.5 - 8 hr"), matching how this reads naturally.
export function formatMinutesRangeLabel(minMinutes: number, maxMinutes: number): string {
  const low = toDurationParts(minMinutes);
  const high = toDurationParts(maxMinutes);
  if (low.unit === high.unit) {
    return low.unit === "m" ? `${low.display}m - ${high.display}m` : `${low.display} - ${high.display} hr`;
  }
  return `${low.display}${low.unit === "m" ? "m" : " hr"} - ${high.display}${high.unit === "m" ? "m" : " hr"}`;
}
