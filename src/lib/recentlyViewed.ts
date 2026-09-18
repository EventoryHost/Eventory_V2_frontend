// Recently-viewed packages, kept in localStorage.
//
// There is no backend endpoint for this — /api/customer has no "viewed
// items" route (see src/routes/index.js in Eventory_V2_backend), so the
// account dashboard's "Viewed Items" count and "Recently Viewed" list are
// derived from what this browser has actually opened. Same module-store
// shape as customerSession.ts (useSyncExternalStore-friendly) so the
// dashboard re-renders when a view is recorded in another tab-lifetime.
//
// Deliberately NOT keyed by customer id: the entries are a browsing
// convenience, not account data, and a guest who later logs in should still
// see what they just looked at.

const STORAGE_KEY = "eventory_recently_viewed";
const MAX_ENTRIES = 20;

export interface RecentlyViewedPackage {
  packageId: string;
  title: string;
  /** Variant/tier label shown after the title, e.g. "Basic Package". */
  variantLabel?: string;
  image?: string;
  categoryLabel: string;
  /** Category id slug. Optional: entries saved before this field existed won't have it. */
  categorySlug?: string;
  categoryIcon?: string;
  categoryGradientFrom?: string;
  eventTags: string[];
  moreEventTagsCount: number;
  rating: number;
  reviewCount: number;
  /** Already-formatted price string ("₹15,999") — the PDP owns the formatting. */
  price: string;
  priceSuffix?: string;
  locationSummary: string;
  /** Epoch ms of the most recent view, used for ordering. */
  viewedAt: number;
}

function readStored(): RecentlyViewedPackage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop anything that predates a shape change rather than rendering a
    // half-empty card.
    return parsed.filter(
      (entry): entry is RecentlyViewedPackage =>
        Boolean(entry) && typeof entry.packageId === "string" && typeof entry.title === "string"
    );
  } catch {
    return [];
  }
}

let state: RecentlyViewedPackage[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  state = readStored();
  hydrated = true;
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or private-mode failure — the in-memory list still works for
    // this session.
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): RecentlyViewedPackage[] {
  ensureHydrated();
  return state;
}

const SERVER_SNAPSHOT: RecentlyViewedPackage[] = [];

export function getServerSnapshot(): RecentlyViewedPackage[] {
  return SERVER_SNAPSHOT;
}

/** Records a view, moving an already-seen package back to the front. */
export function recordView(entry: Omit<RecentlyViewedPackage, "viewedAt">) {
  ensureHydrated();
  const next = [
    { ...entry, viewedAt: Date.now() },
    ...state.filter((item) => item.packageId !== entry.packageId),
  ].slice(0, MAX_ENTRIES);

  // useSyncExternalStore compares snapshots by reference, so bail out only
  // when nothing actually moved — re-opening the package that's already at
  // the front still refreshes viewedAt, which is cheap and harmless.
  state = next;
  persist();
  notify();
}

export function clearRecentlyViewed() {
  ensureHydrated();
  state = [];
  persist();
  notify();
}
