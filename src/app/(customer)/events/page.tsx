// src/app/(customer)/events/page.tsx
import type { Metadata } from "next";
import EventsPage from "@/features/customer-events/components/EventsPage";

export const metadata: Metadata = {
  title: "Trending Events & Celebration Ideas in Delhi NCR",
  description: "Discover featured and upcoming events and the celebrations people book most on Eventory, then jump straight to matching packages and vendors.",
  alternates: { canonical: "/events" },
};

export default function Events() {
  return <EventsPage />;
}
