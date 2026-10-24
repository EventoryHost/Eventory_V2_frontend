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
  /** Every distinct raw eventCategories value seen for this bucket (same multi-raw-id pattern as groupEventCategories) — comma-joined, this becomes the real `eventCategory` filter value the "Explore Packages" link sends. */
  rawCategories: Set<string>;
  /** Every distinct real package photo seen for this event type (not just the first) — lets the final assignment below pick a different one per card instead of every bucket defaulting to the same first-seen photo. */
  images: string[];
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
    const packageRawCategories = pkg.step1_eventAndCrew?.eventCategories ?? [];
    const city = pkg.vendorId?.city?.trim();
    const image = getPackageImage(pkg);

    // A package can carry more than one event-category tag — count it once
    // per canonical label it actually maps to, not once per raw tag.
    const labels = new Set(packageRawCategories.map(canonicalEventLabel));
    for (const label of labels) {
      if (/wedding/i.test(label)) continue;

      const bucket =
        buckets.get(label) ??
        { label, count: 0, cityCounts: new Map<string, number>(), rawCategories: new Set<string>(), images: [] };
      bucket.count += 1;
      if (city) bucket.cityCounts.set(city, (bucket.cityCounts.get(city) ?? 0) + 1);
      for (const raw of packageRawCategories) {
        if (canonicalEventLabel(raw) === label) bucket.rawCategories.add(raw);
      }
      if (image && !bucket.images.includes(image)) bucket.images.push(image);
      buckets.set(label, bucket);
    }
  }

  const usedImages = new Set<string>();

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
    .map((bucket) => {
      // Greedy, order-dependent pick: each card prefers an image none of the
      // earlier cards in this same ranked list has used yet, falling back to
      // its own first image only when every candidate it has is already
      // taken — "as far as possible" distinct photos per card rather than
      // every bucket defaulting to its first-seen (often repeated) photo.
      const image = bucket.images.find((img) => !usedImages.has(img)) ?? bucket.images[0] ?? "/images/customer/events/upcoming.jpg";
      usedImages.add(image);

      return {
        image,
        // Figma node 148:584 — the same ribbon-shaped "Trending" tag
        // EventPackageCard already renders (TrendingTagIcon) when a `badge`
        // is passed.
        badge: "Trending",
        title: `${bucket.label} in ${bucket.topCity}`,
        description: `${bucket.count} real package${bucket.count === 1 ? "" : "s"} booked for ${bucket.label.toLowerCase()} events in ${bucket.topCity} — explore top vendors near you.`,
        // "Explore Packages" — event type AND the real top service-area city
        // this bucket was built from. PackageListingContent.tsx cascades:
        // eventType+city -> eventType only -> all packages, if each step
        // finds nothing, so this is never a dead end even for a
        // city/event-type combo with zero live packages.
        href: `/packages/browse?eventType=${encodeURIComponent([...bucket.rawCategories].join(","))}&city=${encodeURIComponent(bucket.topCity)}`,
      };
    });
}
