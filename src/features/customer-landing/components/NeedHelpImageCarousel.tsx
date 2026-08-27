"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const IMAGES = [
  "/images/customer/cr1.png",
  "/images/customer/cr2.png",
  "/images/customer/cr3.png",
  "/images/customer/cr4.png",
];

const SLIDE_DURATION_MS = 4000;

export default function NeedHelpImageCarousel({
  mirrored = false,
}: {
  mirrored?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % IMAGES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {IMAGES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          className={`object-cover transition-opacity duration-1000 ${
            mirrored ? "scale-x-[-1]" : ""
          } ${i === activeIndex ? "opacity-100" : "opacity-0"}`}
          priority={i === 0}
        />
      ))}
    </div>
  );
}
