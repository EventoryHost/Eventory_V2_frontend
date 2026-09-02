// Shared minutes -> "X minutes" / "X hours Y minutes" formatter. Used
// wherever a duration value is being treated as minutes for display (see
// callers for the specific field/backend-unit caveats behind each usage).
export function formatMinutesLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const hoursPart = `${hours} hour${hours !== 1 ? "s" : ""}`;
  const minutesPart = remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}` : "";
  return `${hoursPart}${minutesPart}`;
}
