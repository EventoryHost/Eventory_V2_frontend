// Shared by the Booking Details header and the Add a review sidebar.

export function formatBookedOn(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** "6hrs" — only when both ends of the event window were captured. */
export function durationLabel(start?: string, end?: string) {
  if (!start || !end) return null;
  const toMinutes = (value: string) => {
    const match = value.match(/(\d{1,2})\s*:?\s*(\d{2})?\s*(am|pm)?/i);
    if (!match) return null;
    let hours = Number(match[1]);
    const minutes = Number(match[2] ?? 0);
    const meridiem = match[3]?.toLowerCase();
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from == null || to == null) return null;
  const span = (to - from + 24 * 60) % (24 * 60);
  if (!span) return null;
  const hours = Math.floor(span / 60);
  const minutes = span % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}hrs`;
}
