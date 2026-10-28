import { CATEGORY_META } from "@/lib/categoryMeta";

// The Event Type dropdown shows every REAL, live event category the
// backend actually has (GET /customer/packages/filters, same source the
// pre-redesign dropdown used) — NOT a small hand-picked list. A first pass
// at this file wrongly hardcoded just 4 curated entries (Birthday/
// Corporate/Anniversary/Baby shower), which hid the other ~18 real live
// categories (Haldi, Workshop, Engagement Ceremony, House Party, etc.) —
// real bug, reported 2026-10-03. Fixed by deriving the new design's
// icon+subtitle treatment from KEYWORD FAMILIES matched against whatever
// label the backend returns, instead of requiring each one to be curated
// by hand — so a new category a vendor adds tomorrow still gets a sensible
// icon/subtitle/service-filter rather than rendering blank.
//
// PM reversal (2026-10-14): every real category is now shown here,
// including "Wedding" and its variants, which used to be excluded via
// filterHiddenEventCategories before this ever saw them.
// Figma node 2240:10126 — every row's icon tile is the SAME pink
// (#FDE7EB background, #F0596F/brand-primary text) with a 2-letter monogram
// of the label instead of a per-family/per-row Lucide icon or color. This
// supersedes the earlier per-row color-palette work (ICON_BG_PALETTE,
// 2026-10-23) — that was fixing a problem (rows sharing one of only 7
// colors) that a uniform single-color monogram design doesn't have.
const MONOGRAM_BG = "#FDE7EB";

export interface EventTypeDisplay {
  id: string;
  label: string;
  subtitle: string;
  monogram: string;
  iconBg: string;
}

interface EventTypeFamily {
  match: RegExp;
  subtitle: string;
  /** Allowed vendor-category ids for "Choose vendor service" when this family's event type is picked. `null` = show all 6, unfiltered. */
  services: string[] | null;
}

const BIRTHDAY_SERVICES = ["venue-provider", "decorator", "caterer", "dj-artist", "photographer"];
const CORPORATE_SERVICES = ["venue-provider", "caterer", "decorator", "photographer", "dj-artist"];
const BABY_SERVICES = ["venue-provider", "decorator", "caterer", "photographer"];

// Order matters — first match wins, so more specific patterns (birthday,
// corporate) are checked before generic ones (the final catch-all).
const EVENT_TYPE_FAMILIES: EventTypeFamily[] = [
  { match: /birthday|kids party/i, subtitle: "Kids and adult parties", services: BIRTHDAY_SERVICES },
  {
    match: /corporate|office party|workshop|conference|launch|annual day/i,
    subtitle: "Offsites, launches, conferences",
    services: CORPORATE_SERVICES,
  },
  { match: /anniversary/i, subtitle: "Milestone celebrations", services: null },
  {
    match: /baby|shower|annaprashan|rice ceremony/i,
    subtitle: "Welcoming the little one",
    services: BABY_SERVICES,
  },
  {
    match: /haldi|puja|ganesh|chaturthi|griha|housewarming|mehndi|mehendi|sangeet/i,
    subtitle: "Religious and traditional ceremonies",
    services: null,
  },
  { match: /engagement|ring ceremony|roka|proposal/i, subtitle: "Ring ceremony, roka", services: null },
  { match: /house party|welcome gate|home/i, subtitle: "Celebrations at home", services: null },
];

const DEFAULT_FAMILY: EventTypeFamily = {
  match: /.*/,
  subtitle: "Celebrations and events",
  services: null,
};

function familyFor(label: string): EventTypeFamily {
  return EVENT_TYPE_FAMILIES.find((family) => family.match.test(label)) ?? DEFAULT_FAMILY;
}

/** "Birthday" -> "Bi", "Puja / Griha Pravesh" -> "Pu" — first two characters of the label, same casing the backend/grouped label already has. */
function monogramFor(label: string): string {
  return label.trim().slice(0, 2);
}

/**
 * Grouped event-category options (lib/eventCategoryGroups.ts's merged
 * "Birthday"/"Corporate"/etc. buckets) -> the dropdown row shape, deriving
 * the subtitle by keyword family off each option's canonical LABEL — `id` is
 * passed through unchanged (it's the comma-joined raw values the backend
 * actually filters on, not something to re-derive styling from).
 */
export function toEventTypeDisplay(options: { id: string; label: string }[]): EventTypeDisplay[] {
  return options.map(({ id, label }) => ({
    id,
    label,
    subtitle: familyFor(label).subtitle,
    monogram: monogramFor(label),
    iconBg: MONOGRAM_BG,
  }));
}

/** `null` = don't filter, show every service. */
export function allowedServicesFor(eventTypeLabel: string): string[] | null {
  return familyFor(eventTypeLabel).services;
}

// All 6 real vendor categories. Decorator is listed FIRST (2026-10-14,
// deliberate deviation from the Figma order) since it's the only vendor
// type with real Live packages behind it right now — every other service
// gets the "Coming soon" badge rather than quietly looking identical to a
// fully-working option. Icons reuse the codebase's own existing category
// icons (CATEGORY_META) rather than Figma-exported ones, since these are
// exact-match real icons already used for these same 6 categories
// elsewhere (PDP header, landing carousel badges).
export const ALL_SERVICE_OPTIONS = [
  { id: "decorator", label: "Decorator", icon: CATEGORY_META.decorator.icon },
  { id: "venue-provider", label: "Venue provider", icon: CATEGORY_META["venue-provider"].icon, comingSoon: true },
  { id: "caterer", label: "Caterer", icon: CATEGORY_META.caterer.icon, comingSoon: true },
  { id: "dj-artist", label: "DJ artist", icon: CATEGORY_META["dj-artist"].icon, comingSoon: true },
  { id: "makeup-artist", label: "Makeup artist", icon: CATEGORY_META["makeup-artist"].icon, comingSoon: true },
  {
    id: "photographer",
    label: "Photographer & videographer",
    icon: CATEGORY_META.photographer.icon,
    comingSoon: true,
  },
];
