"use client";

import { useState } from "react";
import Image from "next/image";
import SectionHeading from "./SectionHeading";

const INITIAL_VISIBLE = 12;

/**
 * "Gallery" — the vendor's businessPhotos.
 *
 * The design shows category filter chips above the grid. They are not
 * rendered: businessPhotos is a flat string[] of URLs with no category,
 * caption or any other field to group by, so the chips would have nothing
 * to filter. Add them once photos carry a category.
 */
export default function VendorGallerySection({
  images,
  vendorName,
}: {
  images: string[];
  vendorName: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (images.length === 0) return null;

  const visible = isExpanded ? images : images.slice(0, INITIAL_VISIBLE);

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading>Gallery</SectionHeading>

      <div className="rounded-[20px] border border-[#e4e4e7] bg-white p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative aspect-square overflow-hidden rounded-[12px] bg-neutral-subtle"
            >
              <Image
                src={src}
                alt={`${vendorName} work sample ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>

        {images.length > INITIAL_VISIBLE && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setIsExpanded((open) => !open)}
              className="rounded-xl border border-[#e4e4e7] bg-white px-8 py-2.5 font-figtree text-[14px] font-bold text-neutral-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              {isExpanded ? "Show less" : `Show all ${images.length} photos`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
