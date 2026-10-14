// Keyword families for MERGING near-duplicate event-category strings into
// one filterable option — e.g. "Birthday", "Birthday Party" and "Birthday
// Party Decoration" (three separate raw values vendors actually typed)
// collapse into a single "Birthday" option. Selecting it must still match
// every real variant, so each merged option's `id` carries ALL of its raw
// values, comma-joined — the package/vendor listing's eventCategory param
// already treats a comma-joined value as an OR match (see
// browsePackages/browseVendors), so no backend change is needed to support
// this: a multi-raw id just looks like a multi-select to the API.
//
// Deliberately the SAME keyword families customer-landing's
// eventSearchTaxonomy.ts already uses for subtitle/icon display — reusing
// them here (rather than a second, divergent taxonomy) keeps "what counts
// as a Birthday-family event" consistent everywhere it's judged. That file
// only needed per-row styling before; this adds the actual merge step.
export interface EventCategoryGroup {
  label: string;
  match: RegExp;
}

// Order matters — first match wins, so more specific patterns are checked
// before more generic ones.
export const EVENT_CATEGORY_GROUPS: EventCategoryGroup[] = [
  { label: "Birthday", match: /birthday|kids party/i },
  { label: "Corporate", match: /corporate|office party|workshop|conference|launch|annual day/i },
  { label: "Anniversary", match: /anniversary/i },
  { label: "Baby Shower", match: /baby|shower|annaprashan|rice ceremony/i },
  { label: "Haldi & Puja", match: /haldi|puja|ganesh|chaturthi|griha|housewarming|mehndi|mehendi|sangeet/i },
  { label: "Engagement", match: /engagement|ring ceremony|roka|proposal/i },
  { label: "House Party", match: /house party|welcome gate|home/i },
];

export interface GroupedEventCategoryOption {
  /** Comma-joined raw category values this option represents — what actually gets sent as the eventCategory filter param. */
  id: string;
  label: string;
}

/**
 * Buckets raw, live event-category strings into fewer canonical options. A
 * raw value matching no known family keeps its own standalone option
 * (id === label === the raw value itself) rather than being dropped.
 */
export function groupEventCategories(rawCategories: string[]): GroupedEventCategoryOption[] {
  const buckets = new Map<string, string[]>(); // canonical label -> raw values

  for (const raw of rawCategories) {
    const group = EVENT_CATEGORY_GROUPS.find((g) => g.match.test(raw));
    const label = group?.label ?? raw;
    const existing = buckets.get(label);
    if (existing) existing.push(raw);
    else buckets.set(label, [raw]);
  }

  return [...buckets.entries()]
    .map(([label, rawValues]) => ({ id: rawValues.join(","), label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
