import type { LucideIcon } from "lucide-react";
import { Baby, Briefcase, Cake, Flower2, Gem, Home, PartyPopper, HeartHandshake } from "lucide-react";
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
// "Wedding" and its variants are excluded via filterHiddenEventCategories
// (lib/eventCategories.ts) before this ever sees them — same sitewide rule
// as every other wedding-category dropdown, decided 2026-10-02/03.
export interface EventTypeDisplay {
  id: string;
  label: string;
  subtitle: string;
  IconComponent: LucideIcon;
}

interface EventTypeFamily {
  match: RegExp;
  subtitle: string;
  icon: LucideIcon;
  /** Allowed vendor-category ids for "Choose vendor service" when this family's event type is picked. `null` = show all 6, unfiltered. */
  services: string[] | null;
}

const BIRTHDAY_SERVICES = ["venue-provider", "decorator", "caterer", "dj-artist", "photographer"];
const CORPORATE_SERVICES = ["venue-provider", "caterer", "decorator", "photographer", "dj-artist"];
const BABY_SERVICES = ["venue-provider", "decorator", "caterer", "photographer"];

// Order matters — first match wins, so more specific patterns (birthday,
// corporate) are checked before generic ones (the final catch-all).
const EVENT_TYPE_FAMILIES: EventTypeFamily[] = [
  { match: /birthday|kids party/i, subtitle: "Kids and adult parties", icon: Cake, services: BIRTHDAY_SERVICES },
  {
    match: /corporate|office party|workshop|conference|launch|annual day/i,
    subtitle: "Offsites, launches, conferences",
    icon: Briefcase,
    services: CORPORATE_SERVICES,
  },
  { match: /anniversary/i, subtitle: "Milestone celebrations", icon: HeartHandshake, services: null },
  {
    match: /baby|shower|annaprashan|rice ceremony/i,
    subtitle: "Welcoming the little one",
    icon: Baby,
    services: BABY_SERVICES,
  },
  {
    match: /haldi|puja|ganesh|chaturthi|griha|housewarming|mehndi|mehendi|sangeet/i,
    subtitle: "Religious and traditional ceremonies",
    icon: Flower2,
    services: null,
  },
  { match: /engagement|ring ceremony|roka|proposal/i, subtitle: "Ring ceremony, roka", icon: Gem, services: null },
  { match: /house party|welcome gate|home/i, subtitle: "Celebrations at home", icon: Home, services: null },
];

const DEFAULT_FAMILY: EventTypeFamily = {
  match: /.*/,
  subtitle: "Celebrations and events",
  icon: PartyPopper,
  services: null,
};

function familyFor(label: string): EventTypeFamily {
  return EVENT_TYPE_FAMILIES.find((family) => family.match.test(label)) ?? DEFAULT_FAMILY;
}

/** Real backend category strings -> the dropdown row shape, deriving subtitle/icon by keyword family. */
export function toEventTypeDisplay(categories: string[]): EventTypeDisplay[] {
  return categories.map((label) => {
    const family = familyFor(label);
    return { id: label, label, subtitle: family.subtitle, IconComponent: family.icon };
  });
}

/** `null` = don't filter, show every service. */
export function allowedServicesFor(eventTypeLabel: string): string[] | null {
  return familyFor(eventTypeLabel).services;
}

// All 6 real vendor categories, in the same fixed order the Figma dropdown
// rows use — reuses the codebase's own existing category icons
// (CATEGORY_META) rather than Figma-exported ones, since these are
// exact-match real icons already used for these same 6 categories
// elsewhere (PDP header, landing carousel badges).
export const ALL_SERVICE_OPTIONS = [
  { id: "venue-provider", label: "Venue provider", icon: CATEGORY_META["venue-provider"].icon },
  { id: "caterer", label: "Caterer", icon: CATEGORY_META.caterer.icon },
  { id: "decorator", label: "Decorator", icon: CATEGORY_META.decorator.icon },
  { id: "makeup-artist", label: "Makeup artist", icon: CATEGORY_META["makeup-artist"].icon },
  { id: "dj-artist", label: "DJ artist", icon: CATEGORY_META["dj-artist"].icon },
  { id: "photographer", label: "Photographer & videographer", icon: CATEGORY_META.photographer.icon },
];
