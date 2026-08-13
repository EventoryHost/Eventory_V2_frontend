"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import type { GalleryImage } from "../types";
import PlaceholderMedia from "./PlaceholderMedia";

export default function GalleryModal({
  isOpen,
  onClose,
  images,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  onSelect: (index: number) => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
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
            aria-label="All media"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[85vh] w-full max-w-[900px] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-figtree text-[18px] font-bold text-brand-950">All media</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-neutral-secondary transition-colors hover:bg-black/10"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => {
                    onSelect(index);
                    onClose();
                  }}
                  className="relative aspect-square overflow-hidden rounded-xl"
                >
                  {image.image ? (
                    <Image src={image.image} alt={image.alt} fill sizes="300px" className="object-cover" />
                  ) : (
                    <PlaceholderMedia seed={index} className="absolute inset-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
