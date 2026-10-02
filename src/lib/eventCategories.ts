// Shared across every customer surface that lists real, vendor-entered
// event categories (search dropdowns, listing-page filters, PDP) —
// PM-requested 2026-10-02: the word "wedding" must not appear anywhere on
// the site. These are REAL category strings vendors have actually set on
// live packages (confirmed against prod — Package.step1_eventAndCrew.eventCategories),
// not static frontend copy, so this hides them from customer-facing
// pickers/filters entirely rather than rewriting backend data or vendor
// package content. Exact match only, case/whitespace-insensitive — same
// convention as the pre-existing "birthday" dup hide this set absorbed.
export const HIDDEN_EVENT_CATEGORIES = new Set([
  "birthday",
  "bridal show / wedding expo",
  "destination wedding decoration",
  "destination weddings",
  "pre-wedding shoots",
  "pre-wedding shoot",
  "wedding",
  "wedding ceremonies",
  "wedding ceremony",
  "wedding cocktail party",
  "wedding reception",
]);

export function isHiddenEventCategory(category: string): boolean {
  return HIDDEN_EVENT_CATEGORIES.has(category.trim().toLowerCase());
}

export function filterHiddenEventCategories(categories: string[]): string[] {
  return categories.filter((category) => !isHiddenEventCategory(category));
}
