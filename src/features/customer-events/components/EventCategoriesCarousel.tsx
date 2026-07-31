"use client";

import { useRef, useState } from "react";
import EventCategoryCard, {
  type EventCategoryCardProps,
} from "./EventCategoryCard";

const CATEGORIES: EventCategoryCardProps[] = [
  {
    image: "/images/customer/events/explore-packages.png",
    title: "Birthday Aesthetics, Delivered Flawlessly.",
    subtitle: "Book Top-Tier Decorators & Curated Party Packages",
    ctaLabel: "Explore Packages",
    accentFrom: "#92400E",
    accentTo: "#B45309",
  },
  {
    image: "/images/customer/events/explore-packages.png",
    title: "Weddings Made Effortless, Every Detail.",
    subtitle: "Book Top-Tier Vendors & Curated Wedding Packages",
    ctaLabel: "Explore Packages",
    accentFrom: "#BE185D",
    accentTo: "#EC4899",
  },
  {
    image: "/images/customer/events/explore-packages.png",
    title: "Corporate Events, Handled End to End.",
    subtitle: "Book Top-Tier Vendors & Curated Corporate Packages",
    ctaLabel: "Explore Packages",
    accentFrom: "#1D4ED8",
    accentTo: "#3B82F6",
  },
];

export default function EventCategoriesCarousel() {
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
      className={`flex gap-6 overflow-x-auto pb-2 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        isPointerDown ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {CATEGORIES.map((category, i) => (
        <EventCategoryCard key={i} {...category} />
      ))}
    </div>
  );
}
