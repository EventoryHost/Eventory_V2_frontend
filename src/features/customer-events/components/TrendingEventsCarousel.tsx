"use client";

import { useRef, useState } from "react";
import TrendingEventCard, {
  type TrendingEventCardProps,
} from "./TrendingEventCard";

// Dates line up with the real festival calendar in
// src/lib/eventCalendarData.ts (Navratri leads into that file's "Dusshera"
// entry — 2026-10-20 — so the 9 nights before it fall 2026-10-11 to 10-20;
// "Corporate Event" uses that file's seasonal "Corporate Annual Day" /
// "Product Launch" window, April-Sep, rather than a single fixed date,
// since corporate events aren't tied to one calendar day).
const EVENTS: TrendingEventCardProps[] = [
  {
    image: "/images/customer/events/megaholibash.png",
    badge: "TRENDING",
    title: "Navratri Garba Nights",
    subtitle: "Decorators, DJs and dandiya setups for all 9 nights of celebration",
    date: "11 - 20 October 2026",
    ctaLabel: "Book Your Package",
  },
  {
    image: "/images/customer/events/winterfestive.png",
    badge: "TRENDING",
    title: "Corporate Events & Launches",
    subtitle: "Offsites, annual days and product launches — planned end to end",
    date: "April - September 2026",
    ctaLabel: "Book Your Package",
  },
  {
    image: "/images/customer/events/newyear.png",
    badge: "TRENDING",
    title: "New Year Bash 2027",
    subtitle: "Ring in the new year in style",
    date: "31 December 2026",
    ctaLabel: "Book Your Package",
  },
];

export default function TrendingEventsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const [isPointerDown, setIsPointerDown] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    setIsPointerDown(true);
    startX.current = e.clientX;
    startScrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const delta = e.clientX - startX.current;
    scrollRef.current.scrollLeft = startScrollLeft.current - delta;
  };

  const endDrag = () => {
    isDragging.current = false;
    setIsPointerDown(false);
  };

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      className={`flex gap-6 overflow-x-auto pb-2 pr-4 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:pr-6 lg:pr-16 ${
        isPointerDown ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {EVENTS.map((event, i) => (
        <TrendingEventCard key={i} {...event} />
      ))}
    </div>
  );
}
