"use client";

import { useRef, useState } from "react";
import TrendingEventCard, {
  type TrendingEventCardProps,
} from "./TrendingEventCard";

const EVENTS: TrendingEventCardProps[] = [
  {
    badge: "TRENDING",
    title: "Mega Holi Bash 2026",
    subtitle: "Its time to book your holi party",
    date: "14 March 2026",
    peopleBooked: "2K+ People booked",
    ctaLabel: "Book Your Package",
  },
  {
    badge: "TRENDING",
    title: "Winter Wedding Fair",
    subtitle: "Book your dream winter wedding",
    date: "20 December 2026",
    peopleBooked: "1.5K+ People booked",
    ctaLabel: "Book Your Package",
  },
  {
    badge: "TRENDING",
    title: "New Year Bash 2027",
    subtitle: "Ring in the new year in style",
    date: "31 December 2026",
    peopleBooked: "3K+ People booked",
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
