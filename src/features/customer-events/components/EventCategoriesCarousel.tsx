"use client";

import { useRef, useState } from "react";
import EventCategoryCard, {
  type EventCategoryCardProps,
} from "./EventCategoryCard";

const CATEGORIES: EventCategoryCardProps[] = [
  {
    image: "/images/customer/events/birthdayaesthetics.png",
    title: "Birthday aesthetics, delivered flawlessly.",
    subtitle: "Book top-tier decorators & curated party packages",
    ctaLabel: "Explore Packages",
  },
  {
    image: "/images/customer/events/celebrationsmade.png",
    title: "Celebrations made effortless, every detail.",
    subtitle: "Book top-tier vendors & curated celebration packages",
    ctaLabel: "Explore Packages",
  },
  {
    image: "/images/customer/events/coporateevents.png",
    title: "Corporate events, handled end to end.",
    subtitle: "Book top-tier vendors & curated corporate packages",
    ctaLabel: "Explore Packages",
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
