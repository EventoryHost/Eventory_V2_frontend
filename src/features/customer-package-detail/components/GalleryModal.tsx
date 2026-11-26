"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { GalleryImage } from "../types";
import { useScrollingFlag } from "../hooks/useScrollingFlag";
import PlaceholderMedia from "./PlaceholderMedia";
import IncludedItemImageModal from "./IncludedItemImageModal";

type SourceTab = "all" | "vendor" | "customer";
type KindFilter = "all" | "image" | "video";

const TABS: { id: SourceTab; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "vendor", label: "From the vendor" },
  { id: "customer", label: "From customers" },
];

const isVideo = (item: GalleryImage) => item.type === "video";
// Media without a recorded uploader is the vendor's own package media.
const sourceOf = (item: GalleryImage) => item.source ?? "vendor";

/**
 * "Sample Media" modal (Figma node 3641:85787): every photo and video on the
 * package, split by who uploaded it (tabs) and by kind (chips). All counts
 * come from the media itself, so they stay right as vendors or customers add
 * more.
 */
export default function GalleryModal({
  isOpen,
  onClose,
  images,
  vendorName,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  /** The vendor's storefront name for the "uploaded by …" line. */
  vendorName?: string;
}) {
  const [tab, setTab] = useState<SourceTab>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  const scrollFlag = useScrollingFlag();
  // Clicking a thumbnail here only enlarges it — it must never change which
  // photo shows as the PDP's main hero image, so this is local state, not
  // routed through the hero's activeIndex. Tracked by index (not just the
  // image) so the zoomed view's prev/next arrows have something to step.
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  // Some real package photos are stale CloudFront URLs that now 404 — fall
  // back to PlaceholderMedia (the same branch a missing `image` already
  // uses) rather than showing a broken-image icon.
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const markFailed = (id: string) => setFailedIds((prev) => new Set(prev).add(id));

  const inTab = images.filter((item) => tab === "all" || sourceOf(item) === tab);
  const photoCount = inTab.filter((item) => !isVideo(item)).length;
  const videoCount = inTab.filter(isVideo).length;
  const visible = inTab.filter((item) => kind === "all" || (kind === "video") === isVideo(item));
  // Only photos open in the zoom viewer; videos play in their tile.
  const zoomable = visible.filter((item) => !isVideo(item) && item.image);
  const zoomedImage = zoomedIndex != null ? zoomable[zoomedIndex] : null;

  const hasCustomerMedia = images.some((item) => sourceOf(item) === "customer");
  const uploader = vendorName?.trim() || "the vendor";
  const fileCount = images.length;
  const subtitle = `${fileCount} ${fileCount === 1 ? "file" : "files"} uploaded by ${uploader}${hasCustomerMedia ? " and past customers" : ""}`;

  const changeTab = (next: SourceTab) => {
    setTab(next);
    setKind("all");
  };

  if (typeof document === "undefined") return null;

  const chips: { id: KindFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: inTab.length },
    { id: "image", label: "Photos", count: photoCount },
    { id: "video", label: "Videos", count: videoCount },
  ];

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={onClose}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Sample media"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              {...scrollFlag}
              className="thin-scroll relative max-h-[90vh] w-full max-w-[964px] overflow-y-auto rounded-3xl bg-white px-4 py-6 shadow-xl sm:px-6 sm:py-8"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-2">
                      <h3 className="font-figtree text-[20px] font-semibold text-[#030303]">Sample Media</h3>
                      <p className="font-figtree text-[16px] font-medium text-[#3F3F47]">{subtitle}</p>
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={onClose}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- static local icon */}
                      <img src="/images/customer/package-detail/close.svg" alt="" className="h-5 w-5" />
                    </button>
                  </div>

                  <div role="tablist" className="flex items-center overflow-x-auto overflow-y-hidden border-b-2 border-[#E4E4E7] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {TABS.map((item) => {
                      const selected = item.id === tab;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          onClick={() => changeTab(item.id)}
                          className={`relative -mb-0.5 min-h-12 shrink-0 px-4 py-3 font-figtree text-[14px] leading-5 whitespace-nowrap transition-colors ${
                            selected ? "font-semibold text-[#09090B]" : "text-[#71717B] hover:text-[#09090B]"
                          }`}
                        >
                          {item.label}
                          {selected && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#09090B]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 px-1">
                  {chips.map((chip) => {
                    const selected = chip.id === kind;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setKind(chip.id)}
                        className={`flex min-h-8 items-center justify-center rounded-full px-3 py-1 font-figtree text-[12px] leading-[18px] whitespace-nowrap transition-colors ${
                          selected
                            ? "border-[1.5px] border-[#030303] font-medium text-[#030303]"
                            : "border border-[#71717B] text-[#71717B] hover:border-[#030303] hover:text-[#030303]"
                        }`}
                      >
                        {chip.label}({chip.count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {visible.length === 0 ? (
                <p className="py-16 text-center font-figtree text-[14px] text-[#71717B]">
                  {tab === "customer"
                    ? "No photos or videos from customers yet."
                    : "Nothing to show here yet."}
                </p>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {visible.map((item, index) => {
                    const failed = failedIds.has(item.id);
                    const tileClass = "relative aspect-[450/273] w-full self-start overflow-hidden rounded-lg bg-[#F4F4F5]";
                    if (isVideo(item) && item.image && !failed) {
                      return (
                        <div key={item.id} className={tileClass}>
                          <video
                            src={item.image}
                            controls
                            playsInline
                            preload="metadata"
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={() => markFailed(item.id)}
                          />
                        </div>
                      );
                    }
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setZoomedIndex(zoomable.findIndex((z) => z.id === item.id))}
                        disabled={!item.image || failed}
                        className={`${tileClass} cursor-zoom-in disabled:cursor-default`}
                      >
                        {item.image && !failed ? (
                          <Image
                            src={item.image}
                            alt={item.alt}
                            fill
                            sizes="(min-width: 640px) 450px, 100vw"
                            className="object-cover"
                            onError={() => markFailed(item.id)}
                          />
                        ) : (
                          <PlaceholderMedia seed={index} className="absolute inset-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <IncludedItemImageModal
        isOpen={zoomedImage !== null && zoomedImage !== undefined}
        onClose={() => setZoomedIndex(null)}
        image={zoomedImage?.image ?? null}
        alt={zoomedImage?.alt ?? ""}
        onPrev={
          zoomable.length > 1 ? () => setZoomedIndex((i) => (i! - 1 + zoomable.length) % zoomable.length) : undefined
        }
        onNext={zoomable.length > 1 ? () => setZoomedIndex((i) => (i! + 1) % zoomable.length) : undefined}
      />
    </>,
    document.body
  );
}
