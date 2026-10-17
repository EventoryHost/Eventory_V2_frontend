// Maps raw event-category strings (whatever a vendor typed into
// step1_eventAndCrew.eventCategories) onto the 7 top-level categories from
// "Vendors and categories - Updated (Common events).pdf" (184 named events,
// 7 categories: Weddings, Parties, Family Events, Formal Events, Corporate
// Events, Social Events, Informal Events). Used by the Events page's
// "Featured Upcoming Events" section to group real packages by that
// taxonomy instead of the narrower keyword families customer-landing's
// eventSearchTaxonomy.ts / lib/eventCategoryGroups.ts use for the search
// dropdown — this is deliberately a second, coarser taxonomy matching the
// PDF's own grouping, not a reuse of those.

export type PdfEventCategory =
  | "Weddings"
  | "Parties"
  | "Family Events"
  | "Corporate Events"
  | "Formal Events"
  | "Social Events"
  | "Informal Events";

// Display order on the Events page.
export const PDF_EVENT_CATEGORIES: PdfEventCategory[] = [
  "Weddings",
  "Parties",
  "Family Events",
  "Corporate Events",
  "Formal Events",
  "Social Events",
  "Informal Events",
];

interface CategoryFamily {
  category: PdfEventCategory;
  match: RegExp;
}

// Order matters — first match wins, so more specific families (Weddings,
// Parties, Family Events) are checked before the broad Social Events
// catch-all, which the PDF itself uses for the majority of its 184 rows.
const CATEGORY_FAMILIES: CategoryFamily[] = [
  {
    category: "Weddings",
    match: /wedding|baraat|bridal|mehndi|mehendi|sangeet|haldi|engagement|ring ceremony|roka|nikah|tilak|sagan/i,
  },
  {
    category: "Parties",
    match:
      /birthday|bachelorette|\bparty\b|club night|cocktail|costume party|diwali party|edm|rave|farewell|house party|iftar|neon|new year|office party|pool party|prom|rooftop party|terrace party|themed party/i,
  },
  {
    category: "Family Events",
    match:
      /baby shower|annaprashan|anniversary|cradle ceremony|ear piercing|family reunion|first birthday|first day of school|gender reveal|griha pravesh|housewarming|mundan|namkaran|raksha bandhan|seemantham|srimantham|upanayana|vastu puja/i,
  },
  {
    category: "Corporate Events",
    match:
      /agm|brand activation|brand launch|business conference|client appreciation|corporate|employee onboarding|trade fair|networking event|press conference|product launch|seminar|workshop|startup demo|team outing|technology.{0,4}innovation|town hall/i,
  },
  {
    category: "Formal Events",
    match:
      /art exhibition|award ceremony|beauty pageant|book launch|charity gala|college annual day|cultural exhibition|dance competition|dance performance|fashion show|felicitation|film premiere|film.{0,4}tv award|good friday|government banquet|graduation|convocation|inauguration|independence day|republic day|makeup competition|movie premiere|oath taking|political convention|ramp walk|remembrance|memorial|school annual day|tedx/i,
  },
  {
    category: "Informal Events",
    match: /game night|get-together|karaoke|kitty party|movie night|paint.{0,3}sip|picnic|potluck|pub crawl|sleepover/i,
  },
];

const DEFAULT_CATEGORY: PdfEventCategory = "Social Events";

export function toPdfEventCategory(label: string): PdfEventCategory {
  return CATEGORY_FAMILIES.find((family) => family.match.test(label))?.category ?? DEFAULT_CATEGORY;
}
