"use client";

import { useState } from "react";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import type { GalleryImage } from "../types";
import PlaceholderMedia from "./PlaceholderMedia";
import GalleryModal from "./GalleryModal";

export default function HeroGallery({
  images,
  categoryLabel,
  vendorUnitName,
}: {
  images: GalleryImage[];
  /** Figma node 2565:27852 — mobile-only breadcrumb above the gallery ("Decorator › Sharma Decorators"). Undefined on vendor types with no storefront name hides the "›" entirely rather than showing a dangling separator. */
  categoryLabel?: string;
  vendorUnitName?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Some real package photos are stale CloudFront URLs that now 404 — track
  // which ones failed to load and fall back to the same PlaceholderMedia a
  // missing `image` already uses, rather than showing a broken-image icon.
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const markFailed = (id: string) => setFailedIds((prev) => new Set(prev).add(id));

  const active = images[activeIndex];
  const sideImages = images.filter((_, i) => i !== activeIndex).slice(0, 2);

  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl">
      {/* Desktop/tablet layout — unchanged. */}
      <div className="hidden gap-4 md:grid md:grid-cols-3">
        <div className="relative h-[450px] md:col-span-2">
          {active?.image && !failedIds.has(active.id) ? (
            <Image
              src={active.image}
              alt={active.alt}
              fill
              priority
              sizes="66vw"
              className="object-cover"
              onError={() => markFailed(active.id)}
            />
          ) : (
            <PlaceholderMedia seed={activeIndex} className="absolute inset-0" />
          )}
        </div>

        <div className="flex h-[450px] flex-col gap-4">
          {sideImages.map((image) => {
            const realIndex = images.findIndex((img) => img.id === image.id);
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(realIndex)}
                className="relative h-[calc(50%-8px)] w-full overflow-hidden rounded-xl"
              >
                {image.image && !failedIds.has(image.id) ? (
                  <Image
                    src={image.image}
                    alt={image.alt}
                    fill
                    sizes="33vw"
                    className="object-cover"
                    onError={() => markFailed(image.id)}
                  />
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
      </div>

      {/* Mobile layout (Figma node 2565:27852) — breadcrumb, rounded hero
          image with the "View All Media" pill inside it, and a thumbnail
          strip of every gallery image (clicking one makes it the hero,
          matching the desktop side-image behavior). */}
      <div className="flex flex-col gap-[10px] md:hidden">
        {(categoryLabel || vendorUnitName) && (
          <p className="font-figtree text-[12px] text-[#71717b]">
            {categoryLabel}
            {categoryLabel && vendorUnitName && "  ›  "}
            {vendorUnitName}
          </p>
        )}

        <div className="relative h-[240px] w-full overflow-hidden rounded-[20px] bg-[#f4f4f5]">
          {active?.image && !failedIds.has(active.id) ? (
            <Image
              src={active.image}
              alt={active.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              onError={() => markFailed(active.id)}
            />
          ) : (
            <PlaceholderMedia seed={activeIndex} className="absolute inset-0" />
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="absolute right-3 bottom-3 flex items-center gap-1 rounded-[18px] bg-white/95 py-2 pr-[14px] pl-3 font-figtree text-[12px] font-semibold text-[#222] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04),0px_6px_16px_0px_rgba(0,0,0,0.06)]"
          >
            <Image src="/images/customer/package-detail/gallery-wide.svg" alt="" width={14} height={14} />
            View All Media
          </button>
        </div>

        <div className="flex items-start gap-2">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative size-14 shrink-0 overflow-hidden rounded-[10px] ${
                i === activeIndex ? "border-2 border-[#f0596f]" : ""
              }`}
            >
              {image.image && !failedIds.has(image.id) ? (
                <Image
                  src={image.image}
                  alt={image.alt}
                  fill
                  sizes="56px"
                  className="object-cover"
                  onError={() => markFailed(image.id)}
                />
              ) : (
                <PlaceholderMedia seed={i} className="absolute inset-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      <GalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={images}
      />
    </section>
  );
}
