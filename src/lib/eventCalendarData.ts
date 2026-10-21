// Source: the "Festival/vendor-service" and "School & corporate season" sheets
// the Events team supplied (table.tsv / table2.tsv) — see this file's git
// history for the raw rows. Hardcoded here rather than fetched since there's
// no backend model for "calendar festivals" (as opposed to real bookable
// packages) yet; this is the same kind of static reference data as
// eventCategoryPdfTaxonomy.ts.

export interface FixedDateEvent {
  name: string;
  /** 1-12, calendar month — matched against a selected day's month/day, year-agnostic so this keeps working every year. */
  month: number;
  day: number;
  /** Empty when the source sheet didn't list any (e.g. Eid, Bakrid) — never fabricated. */
  vendorServices: string[];
}

export interface SeasonalEvent {
  name: string;
  /** Original "Nov-Jan" style label from the source sheet, shown as-is. */
  rangeLabel: string;
  /** 1-12 months this range covers, inclusive, wrapping past December when the range crosses the year boundary. */
  months: number[];
}

// EVENT, DATE (MM/DD/2026), VENDOR SERVICES — table.tsv
export const FIXED_DATE_EVENTS: FixedDateEvent[] = [
  { name: "New Year", month: 1, day: 1, vendorServices: ["Decorator", "Audio Visuals", "SFX", "DJ", "Artist", "Venue"] },
  { name: "Makar Sankranti", month: 1, day: 14, vendorServices: ["Audio Visuals", "DJ"] },
  { name: "Lohri", month: 1, day: 13, vendorServices: ["Decorator", "Audio Visuals", "DJ"] },
  { name: "Republic Day", month: 1, day: 26, vendorServices: ["Decorator", "Audio Visuals", "DJ"] },
  { name: "Valentine's Day", month: 2, day: 14, vendorServices: ["Hotel", "Decoration"] },
  { name: "Holi", month: 3, day: 4, vendorServices: ["Venue", "Decoration", "Audio Visuals", "DJ", "SFX", "Colour", "Colour Booms"] },
  { name: "Eid", month: 3, day: 21, vendorServices: [] },
  { name: "Bakrid", month: 5, day: 28, vendorServices: [] },
  { name: "Yoga Day", month: 6, day: 21, vendorServices: ["Decoration", "Audio Visuals", "DJ"] },
  { name: "Independence Day", month: 8, day: 15, vendorServices: ["Audio Visual", "DJ"] },
  { name: "Haryali Teej", month: 8, day: 15, vendorServices: [] },
  { name: "Janmashtami", month: 9, day: 4, vendorServices: ["Decoration", "Audio Visual", "Small Artist", "DJ"] },
  { name: "Ganesh Chaturthi", month: 9, day: 14, vendorServices: ["Decoration", "Audio Visual", "Small Artist", "DJ"] },
  { name: "Dusshera", month: 10, day: 20, vendorServices: ["Decoration", "Audio Visual", "Small Artist", "DJ", "Crackers"] },
  { name: "Karwa Chauth", month: 10, day: 29, vendorServices: ["Mendhi Artist", "Decoration", "DJ"] },
  { name: "Halloween", month: 10, day: 31, vendorServices: ["Venue", "Theme Decoration", "Audio Visuals", "DJ", "Games"] },
  { name: "Diwali", month: 11, day: 8, vendorServices: ["Decorator", "Audio Visuals", "SFX", "DJ", "Artist", "Venue", "Games"] },
  { name: "Chhath Pooja", month: 11, day: 15, vendorServices: [] },
  { name: "Christmas", month: 12, day: 25, vendorServices: ["Decoration", "Audio Visual", "Small Artist", "DJ"] },
  { name: "New Year's Eve", month: 12, day: 31, vendorServices: ["Decorator", "Audio Visuals", "SFX", "DJ", "Artist", "Venue"] },
];

const MONTH_NAME_TO_NUM: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

function expandMonthRange(rangeLabel: string): number[] {
  const [startLabel, endLabel] = rangeLabel.split("-").map((s) => s.trim().toLowerCase());
  const start = MONTH_NAME_TO_NUM[startLabel];
  const end = MONTH_NAME_TO_NUM[endLabel];
  if (!start || !end) return [];

  const months: number[] = [];
  let m = start;
  while (true) {
    months.push(m);
    if (m === end) break;
    m = m === 12 ? 1 : m + 1;
  }
  return months;
}

// EVENT, DATE ("Nov-Jan" style season) — table2.tsv. Rows with no date at
// all (School MUN, School investiture ceremony) are skipped: there's no
// month to place them on the calendar with.
const SEASONAL_EVENT_SOURCE: { name: string; rangeLabel: string }[] = [
  { name: "School Annual Day", rangeLabel: "Nov-Jan" },
  { name: "School Sports Day", rangeLabel: "Oct-Dec" },
  { name: "School Farewell", rangeLabel: "Jan-Feb" },
  { name: "College Fests", rangeLabel: "Feb-April" },
  { name: "College Farewell", rangeLabel: "April-June" },
  { name: "College Fresher's Party", rangeLabel: "Aug-Oct" },
  { name: "Cultural Fest", rangeLabel: "Feb-April" },
  { name: "Annual Day", rangeLabel: "April-June" },
  { name: "Product Launch", rangeLabel: "April-Sep" },
  { name: "Corporate Annual Day", rangeLabel: "April-Sep" },
  { name: "Networking Ceremony", rangeLabel: "April-Sep" },
];

export const SEASONAL_EVENTS: SeasonalEvent[] = SEASONAL_EVENT_SOURCE.map((e) => ({
  ...e,
  months: expandMonthRange(e.rangeLabel),
}));

/** Year-agnostic — matches by month/day only, so a 2026-dated source sheet keeps applying every year. */
export function getFixedEventsOnDate(date: Date): FixedDateEvent[] {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return FIXED_DATE_EVENTS.filter((e) => e.month === month && e.day === day);
}

export function getFixedEventsInMonth(month: number): FixedDateEvent[] {
  return FIXED_DATE_EVENTS.filter((e) => e.month === month);
}

export function getSeasonalEventsInMonth(month: number): SeasonalEvent[] {
  return SEASONAL_EVENTS.filter((e) => e.months.includes(month));
}

const IMAGE_KEYWORD_RULES: { match: RegExp; image: string }[] = [
  { match: /new year/i, image: "/images/customer/events/newyear.png" },
  { match: /holi/i, image: "/images/customer/events/megaholibash.png" },
  { match: /christmas|winter|republic day|lohri|makar sankranti/i, image: "/images/customer/events/winterfestive.png" },
  { match: /corporate|product launch|networking|annual day|office party/i, image: "/images/customer/events/coporateevents.png" },
  { match: /birthday|fresher|farewell|college|cultural fest|school/i, image: "/images/customer/events/birthdayaesthetics.png" },
  { match: /diwali|festival|celebration|janmashtami|ganesh|dusshera|eid|bakrid|teej|karwa|chhath|yoga/i, image: "/images/customer/events/celebrationsmade.png" },
];

const FALLBACK_EVENT_IMAGE = "/images/customer/events/upcoming.jpg";

/** Best-effort keyword match against the images we actually have — there's no per-festival photography in the catalog yet, so this picks the closest thematic match rather than fabricating a dedicated asset per event. */
export function getEventImage(eventName: string): string {
  return IMAGE_KEYWORD_RULES.find((rule) => rule.match.test(eventName))?.image ?? FALLBACK_EVENT_IMAGE;
}
