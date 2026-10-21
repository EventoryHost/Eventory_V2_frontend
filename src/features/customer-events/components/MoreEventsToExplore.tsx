"use client";

import { useEffect, useState } from "react";
import EventPackageCarousel from "./EventPackageCarousel";
import { type EventPackageCardProps } from "./EventPackageCard";
import { getPopularPackages } from "@/lib/customerDiscoveryApi";
import { buildRankedEventCards } from "../data/buildFeaturedEventCards";

// Same ranked list Featured Upcoming Events builds (real event types, by
// real booking volume, each paired with its real most-booked service area)
// — this section picks up right where that one's top 6 leave off, rather
// than repeating them or showing unrelated static placeholder cards.
const FEATURED_COUNT = 6;
const MORE_COUNT = 6;

export default function MoreEventsToExplore() {
  const [cards, setCards] = useState<EventPackageCardProps[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPopularPackages({ limit: 30 })
      .then((response) => {
        if (!cancelled) {
          const ranked = buildRankedEventCards(response.packages);
          setCards(ranked.slice(FEATURED_COUNT, FEATURED_COUNT + MORE_COUNT));
        }
      })
      .catch(() => {
        // Best-effort — the carousel just stays empty on failure rather than
        // showing fabricated placeholder cards.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <EventPackageCarousel
      heading="More Events to Explore"
      subtitle="Discover more events happening around you"
      events={cards}
    />
  );
}
