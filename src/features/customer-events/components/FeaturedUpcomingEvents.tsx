"use client";

import { useEffect, useState } from "react";
import EventPackageCarousel from "./EventPackageCarousel";
import { type EventPackageCardProps } from "./EventPackageCard";
import { getPopularPackages } from "@/lib/customerDiscoveryApi";
import { buildRankedEventCards } from "../data/buildFeaturedEventCards";

const FEATURED_COUNT = 6;

export default function FeaturedUpcomingEvents() {
  const [cards, setCards] = useState<EventPackageCardProps[]>([]);

  useEffect(() => {
    let cancelled = false;
    // GET /customer/packages/popular caps `limit` at 30 server-side — passing
    // more fails Zod validation every time and silently falls through to the
    // catch below.
    getPopularPackages({ limit: 30 })
      .then((response) => {
        if (!cancelled) setCards(buildRankedEventCards(response.packages).slice(0, FEATURED_COUNT));
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
      heading="Featured Upcoming Events"
      subtitle="Don't miss these trending events happening soon"
      events={cards}
    />
  );
}
