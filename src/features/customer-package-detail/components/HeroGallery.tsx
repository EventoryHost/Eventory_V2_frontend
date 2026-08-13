"use client";

import { useState } from "react";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import type { GalleryImage } from "../types";
import PlaceholderMedia from "./PlaceholderMedia";
import GalleryModal from "./GalleryModal";

export default function HeroGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const active = images[activeIndex];
  const sideImages = images.filter((_, i) => i !== activeIndex).slice(0, 2);

  return (
    <section className="relative mb-8 grid grid-cols-1 gap-4 overflow-hidden rounded-2xl md:grid-cols-3">
      <div className="relative h-[300px] md:col-span-2 md:h-[450px]">
        {active?.image ? (
          <Image
            src={active.image}
            alt={active.alt}
            fill
            priority
            sizes="(min-width: 768px) 66vw, 100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderMedia seed={activeIndex} className="absolute inset-0" />
        )}
      </div>

      <div className="hidden h-[450px] flex-col gap-4 md:flex">
        {sideImages.map((image) => {
          const realIndex = images.findIndex((img) => img.id === image.id);
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(realIndex)}
              className="relative h-[calc(50%-8px)] w-full overflow-hidden rounded-xl"
            >
              {image.image ? (
                <Image src={image.image} alt={image.alt} fill sizes="33vw" className="object-cover" />
              ) : (
                <PlaceholderMedia seed={realIndex} className="absolute inset-0" />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-[13px] font-medium text-brand-950 shadow-sm backdrop-blur-sm transition hover:bg-white"
      >
        <LayoutGrid className="h-4 w-4" />
        View All Media
      </button>

      <GalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={images}
        onSelect={setActiveIndex}
      />
    </section>
  );
}
