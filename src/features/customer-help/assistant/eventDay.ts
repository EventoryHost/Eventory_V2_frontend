import type { HelpBookingContext } from "../helpContext";
import type { BookingHelpPackage } from "../hooks/useBookingHelpData";

// v6f9 event day: the booking page on the day of the event. Vendor status
// comes from the vendor's own event-day steps (check-in, setup done,
// teardown); problem reports go to the Event Manager as GRV tickets.

/** Eventory's common number (the site footer's): Event Manager calls and the duty line. */
export const EVENTORY_PHONE = "+91 88007 25840";
export const EVENTORY_TEL = "tel:+918800725840";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const istDay = (d: Date) => new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/** The event's IST calendar day is today. */
export function isEventDay(ctx: HelpBookingContext | null, now = new Date()) {
  return Boolean(ctx?.eventDate) && istDay(new Date(ctx!.eventDate)) === istDay(now);
}

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

/** "Arrived 12:40 PM · setting up", from the vendor's event-day steps. */
export function vendorStatus(p: BookingHelpPackage, ctx: HelpBookingContext) {
  const b = p.booking;
  if (b.teardownCompletedAt) return { arrived: true, text: `All done · cleared up ${clock(b.teardownCompletedAt)}` };
  if (b.setupCompletedAt) return { arrived: true, text: `Setup done ${clock(b.setupCompletedAt)}` };
  if (b.checkedInAt) return { arrived: true, text: `Arrived ${clock(b.checkedInAt)} · setting up` };
  return { arrived: false, text: `Not checked in yet${ctx.startTime ? ` · event at ${ctx.startTime}` : ""}` };
}

export type IssueKey = "noshow" | "late" | "behav" | "extra" | "missing" | "wrong" | "quality" | "safety" | "other";
type Fit = "waiting" | "arrived" | "any";
export type Issue = {
  key: IssueKey;
  label: string;
  sub: string;
  group: "vendor" | "setup" | "other";
  fit: Fit;
  /** The duty manager is alerted too. */
  urgent?: boolean;
  /** The Event Manager calls rather than messages. */
  call?: boolean;
  /** Pick the missing items. */
  pick?: boolean;
  /** A photo is the main evidence. */
  photo?: boolean;
  /** Can be about the venue / no package. */
  venue?: boolean;
};

export const ISSUES: Issue[] = [
  { key: "noshow", label: "Hasn’t arrived", sub: "No sign of them yet", group: "vendor", fit: "waiting", urgent: true },
  { key: "late", label: "Running late", sub: "They’re delayed or not answering", group: "vendor", fit: "waiting" },
  { key: "behav", label: "Behaving badly", sub: "Rude, careless or unprofessional", group: "vendor", fit: "arrived", call: true },
  { key: "extra", label: "Asking for extra money", sub: "More than the booked price", group: "vendor", fit: "any" },
  { key: "missing", label: "Something’s missing", sub: "Pick what isn’t there", group: "setup", fit: "arrived", pick: true },
  { key: "wrong", label: "Wrong item or setup", sub: "Here, but not what was agreed", group: "setup", fit: "arrived" },
  { key: "quality", label: "Quality isn’t what I booked", sub: "Looks below what was promised", group: "setup", fit: "arrived", photo: true },
  { key: "safety", label: "Damage or a safety concern", sub: "Something broke or feels unsafe", group: "setup", fit: "any", urgent: true, venue: true },
  { key: "other", label: "Something else", sub: "Describe it in your own words", group: "other", fit: "any", venue: true },
];

export const GROUP_TITLE = {
  vendor: "A problem with a vendor",
  setup: "A problem with the setup or items",
} as const;

/** The issues that fit a package (arrived or not), or the venue ones for "not sure". */
export function issuesFor(arrived: boolean | null) {
  if (arrived === null) return ISSUES.filter((i) => i.venue);
  return ISSUES.filter((i) => i.fit === "any" || (i.fit === "arrived") === arrived);
}

/** The items booked with a package, for "Something's missing". */
export function bookedItems(p: BookingHelpPackage) {
  return ((p.booking as unknown as { selectedItems?: { itemName?: string }[] }).selectedItems ?? [])
    .map((i) => i.itemName)
    .filter((n): n is string => Boolean(n));
}
