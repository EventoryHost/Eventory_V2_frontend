"use client";

import { useRef, useState } from "react";
import ProductCard, {
  type ProductCardProps,
} from "@/features/customer-landing/components/ProductCard";

const PACKAGES: ProductCardProps[] = Array.from({ length: 6 }, () => ({
  image: "/images/customer/events/buffet.jpg",
  categoryLabel: "Caterer",
  categoryIcon: "/images/customer/caterers.png",
  tags: ["Wedding", "Anniversary", "Social Gathering"],
  title: "Holi Special package for Holi",
  rating: 4.5,
  reviewCount: 13,
  duration: "Key Highlight",
  guestCapacity: "Key Highlight",
  price: "₹800",
  priceSuffix: "/person",
  locations: ["Delhi NCR", "New Delhi", "Gururgram"],
  categoryGradientFrom: "#FFEDD6",
  categoryGradientTo: "#ffffff",
}));

export default function CateringPackagesCarousel() {
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
      {PACKAGES.map((pkg, i) => (
        <div key={i} className="shrink-0">
          <ProductCard {...pkg} />
        </div>
      ))}
    </div>
  );
}
