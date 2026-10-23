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
// PM reversal (2026-10-14): every real category is now shown here,
// including "Wedding" and its variants, which used to be excluded via
// filterHiddenEventCategories before this ever saw them.
export interface EventTypeDisplay {
  id: string;
  label: string;
  subtitle: string;
  IconComponent: LucideIcon;
  /** Unique pastel icon-tile background per event-type family, so the dropdown's rows aren't all the same flat grey tile. */
  iconBg: string;
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

// Icon-tile background color, assigned PER ROW (not per keyword family) —
// there are only 7 families but ~15+ distinct real event types once
// standalone ones (First Night, Garden Theme, Surprise, Wedding, etc.) are
// counted, so family-based coloring left most rows sharing one of 7 colors.
// PM-reported, 2026-10-23: "some event types like First Night, Garden Theme
// still have same bg color." This palette has more entries than the real
// catalog currently has, and assignment below resolves collisions by
// stepping to the next free slot, so every row in one render is genuinely
// unique as long as the list doesn't outgrow the palette.
const ICON_BG_PALETTE = [
  "#FFE5B4", "#C2E3FF", "#FFD6E0", "#D8F3DC", "#FFF3B0", "#E0CCFF", "#FFCCD3",
  "#B5EAD7", "#C7CEEA", "#FFDAC1", "#E2F0CB", "#F7D6E0", "#CDE7F0", "#F6E2B3",
  "#D7CFE3", "#F9E0D9", "#CFE8E0", "#E8D5B7", "#FBCFE8", "#BAE6FD", "#FDE68A",
  "#C7D2FE", "#A7F3D0", "#FECACA",
];

function hashLabel(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Picks a color per label, stable across renders (same label -> same
 * preferred slot), but resolves collisions within THIS render's full list
 * by stepping to the next unused palette slot — so two labels that happen
 * to hash to the same index still end up visually distinct.
 */
function assignIconColors(labels: string[]): Map<string, string> {
  const used = new Set<number>();
  const assigned = new Map<string, string>();
  for (const label of labels) {
    if (assigned.has(label)) continue; // duplicate label in the list — reuse its color
    let index = hashLabel(label) % ICON_BG_PALETTE.length;
    while (used.has(index) && used.size < ICON_BG_PALETTE.length) {
      index = (index + 1) % ICON_BG_PALETTE.length;
    }
    used.add(index);
    assigned.set(label, ICON_BG_PALETTE[index]);
  }
  return assigned;
}

/**
 * Grouped event-category options (lib/eventCategoryGroups.ts's merged
 * "Birthday"/"Corporate"/etc. buckets) -> the dropdown row shape, deriving
 * subtitle/icon by keyword family off each option's canonical LABEL, and a
 * per-row unique color via assignIconColors above — `id` is passed through
 * unchanged (it's the comma-joined raw values the backend actually filters
 * on, not something to re-derive styling from).
 */
export function toEventTypeDisplay(options: { id: string; label: string }[]): EventTypeDisplay[] {
  const colors = assignIconColors(options.map((o) => o.label));
  return options.map(({ id, label }) => {
    const family = familyFor(label);
    return {
      id,
      label,
      subtitle: family.subtitle,
      IconComponent: family.icon,
      iconBg: colors.get(label) ?? "#F4F4F5",
    };
  });
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
