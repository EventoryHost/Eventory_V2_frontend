import { getPackageImage, type RawPackage } from "@/lib/customerDiscoveryApi";
import { EVENT_CATEGORY_GROUPS } from "@/lib/eventCategoryGroups";
import type { EventPackageCardProps } from "../components/EventPackageCard";

/** Same keyword families the Event Type search/filters use (lib/eventCategoryGroups.ts) — merges near-duplicate raw tags ("Birthday", "Birthday Party Decoration") into one real event type, rather than inventing a second taxonomy. */
function canonicalEventLabel(raw: string): string {
  return EVENT_CATEGORY_GROUPS.find((group) => group.match.test(raw))?.label ?? raw;
}

type EventBucket = {
  label: string;
  /** How many real popular packages are tagged for this event type — the "top events booked" ranking signal. */
  count: number;
  /** Per-vendor-city tally, to find the real "most booked service area" for this event type. */
  cityCounts: Map<string, number>;
  /** First real package photo seen for this event type. */
  image?: string;
};

/**
 * "Top events booked" + "most booked service area" derived from real data:
 * GET /customer/packages/popular (ranked by actual booking volume) is
 * grouped by event type (merging near-duplicate raw tags), tallying how
 * many packages fall into each and which vendor city shows up most often
 * among them — no fabricated stats, no dedicated analytics endpoint exists
 * for this yet so it's computed client-side off the same popularity feed
 * the landing page's own carousel already uses.
 *
 * Wedding is explicitly excluded — PM request: wedding packages aren't
 * ready to feature here yet.
 *
 * Returns the FULL ranked list (not sliced) — callers decide which slice
 * they want (FeaturedUpcomingEvents shows the top 6, MoreEventsToExplore
 * shows the rest), so both sections rank off the exact same real data
 * instead of duplicating or overlapping entries.
 */
export function buildRankedEventCards(packages: RawPackage[]): EventPackageCardProps[] {
  const buckets = new Map<string, EventBucket>();

  for (const pkg of packages) {
    const rawCategories = pkg.step1_eventAndCrew?.eventCategories ?? [];
    const city = pkg.vendorId?.city?.trim();
    const image = getPackageImage(pkg);

    // A package can carry more than one event-category tag — count it once
    // per canonical label it actually maps to, not once per raw tag.
    const labels = new Set(rawCategories.map(canonicalEventLabel));
    for (const label of labels) {
      if (/wedding/i.test(label)) continue;

      const bucket = buckets.get(label) ?? { label, count: 0, cityCounts: new Map<string, number>() };
      bucket.count += 1;
      if (city) bucket.cityCounts.set(city, (bucket.cityCounts.get(city) ?? 0) + 1);
      if (!bucket.image && image) bucket.image = image;
      buckets.set(label, bucket);
    }
  }

  return [...buckets.values()]
    .map((bucket) => {
      let topCity: string | null = null;
      let topCityCount = 0;
      for (const [city, count] of bucket.cityCounts) {
        if (count > topCityCount) {
          topCity = city;
          topCityCount = count;
        }
      }
      return { ...bucket, topCity };
    })
    // A card titled "<event> in <area>" needs a real area to name — an
    // event type with no vendor-city data at all is dropped rather than
    // shown with a made-up or blank location.
    .filter((bucket): bucket is typeof bucket & { topCity: string } => bucket.topCity !== null)
    .sort((a, b) => b.count - a.count)
    .map((bucket) => ({
      image: bucket.image ?? "/images/customer/events/upcoming.jpg",
      // Figma node 148:584 — the same ribbon-shaped "Trending" tag
      // EventPackageCard already renders (TrendingTagIcon) when a `badge`
      // is passed.
      badge: "Trending",
      title: `${bucket.label} in ${bucket.topCity}`,
      description: `${bucket.count} real package${bucket.count === 1 ? "" : "s"} booked for ${bucket.label.toLowerCase()} events in ${bucket.topCity} — explore top vendors near you.`,
    }));
}
