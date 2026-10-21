"use client";

import { useEffect, useState } from "react";
import EventPackageCarousel from "./EventPackageCarousel";
import { type EventPackageCardProps } from "./EventPackageCard";
import { getPackageImage, getPopularPackages, type RawPackage } from "@/lib/customerDiscoveryApi";
import { VENDOR_TYPE_TO_CATEGORY } from "@/lib/vendorType";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import { PDF_EVENT_CATEGORIES, toPdfEventCategory, type PdfEventCategory } from "@/lib/eventCategoryPdfTaxonomy";

const FALLBACK_IMAGE = "/images/customer/events/upcoming.jpg";

/**
 * Simple "most sold service area" logic: tally how many real packages
 * (ranked by booking volume — the same GET /customer/packages/popular feed
 * the landing page's own carousel uses) fall into each of the 7 PDF
 * categories (eventCategoryPdfTaxonomy.ts), broken down by vendor type —
 * then for each category, the vendor type with the most packages is this
 * approximation's "most-booked service." No dedicated analytics endpoint
 * exists for this yet, so this derives it client-side from the same
 * popularity-ranked package list already fetched elsewhere, rather than
 * inventing fake per-category stats.
 */
type CategoryInsights = {
  topService: Map<PdfEventCategory, string>;
  /** First (i.e. most popular, since the feed is already popularity-ranked) package image seen for each category — used as that card's real cover photo instead of one shared fallback. */
  image: Map<PdfEventCategory, string>;
};

function computeCategoryInsights(packages: RawPackage[]): CategoryInsights {
  const counts = new Map<PdfEventCategory, Map<string, number>>();
  const image = new Map<PdfEventCategory, string>();

  for (const pkg of packages) {
    const eventCategories = pkg.step1_eventAndCrew?.eventCategories ?? [];
    // A package can carry more than one event-category tag — count it once
    // per PDF category it actually maps to, not once per raw tag, so a
    // package tagged ["Birthday", "Birthday Party"] (same PDF category)
    // doesn't get double-counted against a single other package elsewhere.
    const pdfCategories = new Set(eventCategories.map(toPdfEventCategory));
    for (const pdfCategory of pdfCategories) {
      const byVendorType = counts.get(pdfCategory) ?? new Map<string, number>();
      byVendorType.set(pkg.vendorType, (byVendorType.get(pkg.vendorType) ?? 0) + 1);
      counts.set(pdfCategory, byVendorType);

      if (!image.has(pdfCategory)) {
        const pkgImage = getPackageImage(pkg);
        if (pkgImage) image.set(pdfCategory, pkgImage);
      }
    }
  }

  const topService = new Map<PdfEventCategory, string>();
  for (const [pdfCategory, byVendorType] of counts) {
    let best: string | null = null;
    let bestCount = 0;
    for (const [vendorType, count] of byVendorType) {
      if (count > bestCount) {
        best = vendorType;
        bestCount = count;
      }
    }
    if (best) topService.set(pdfCategory, best);
  }
  return { topService, image };
}

function serviceLabelFor(vendorType: string): string {
  const categoryId = VENDOR_TYPE_TO_CATEGORY[vendorType];
  return VENDOR_CATEGORIES.find((c) => c.id === categoryId)?.label ?? vendorType;
}

function buildCards({ topService, image }: CategoryInsights): EventPackageCardProps[] {
  return PDF_EVENT_CATEGORIES.map((category) => {
    const topVendorType = topService.get(category);
    const serviceLabel = topVendorType ? serviceLabelFor(topVendorType) : null;
    return {
      image: image.get(category) ?? FALLBACK_IMAGE,
      // Figma node 148:584 — the same ribbon-shaped "Trending" tag
      // EventPackageCard already renders (TrendingTagIcon) when a `badge`
      // is passed; this section just wasn't passing one yet.
      badge: "Trending",
      title: category,
      // Relevant subtext replacing the old "127 booked this week" stat —
      // no bookedLabel/avatars passed here, so EventPackageCard hides that
      // overlay entirely rather than showing a number with nothing real
      // backing it.
      description: serviceLabel
        ? `${serviceLabel} is the most-booked service for ${category.toLowerCase()} right now.`
        : `Browse ${category.toLowerCase()} packages from verified vendors near you.`,
    };
  });
}

export default function FeaturedUpcomingEvents() {
  const [cards, setCards] = useState<EventPackageCardProps[]>(() =>
    buildCards({ topService: new Map(), image: new Map() })
  );

  useEffect(() => {
    let cancelled = false;
    // GET /customer/packages/popular caps `limit` at 30 server-side — passing
    // 50 fails Zod validation every time and silently falls through to the
    // generic fallback copy/image below (the catch swallows it).
    getPopularPackages({ limit: 30 })
      .then((response) => {
        if (!cancelled) setCards(buildCards(computeCategoryInsights(response.packages)));
      })
      .catch(() => {
        // Keep the generic fallback copy (no computed top service) on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <EventPackageCarousel
      heading="Featured Upcoming Events"
      subtitle="Don't miss these trending events happening soon"
      events={cards}
    />
  );
}
