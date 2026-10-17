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
  const visible = categories.filter((category) => !isHiddenEventCategory(category));
  // Real bug found live (package 6ac4a35b9b8e10a54484f660): a package whose
  // ONLY category is "Birthday" — itself on the hidden list as a dup of
  // another term — filtered down to an empty array, leaving the PDP's
  // Event Type picker with nothing to choose and the booking form
  // permanently incomplete. Hiding a term is only safe when the package has
  // OTHER categories left to show; if filtering would zero it out entirely,
  // fall back to the unfiltered list rather than breaking booking.
  return visible.length > 0 ? visible : categories;
}
