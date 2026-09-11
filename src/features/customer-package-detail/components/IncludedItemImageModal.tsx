"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function IncludedItemImageModal({
  isOpen,
  onClose,
  image,
  alt,
}: {
  isOpen: boolean;
  onClose: () => void;
  image: string | null;
  alt: string;
}) {
  if (typeof document === "undefined" || !image) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-[85vh] w-full max-w-[720px]"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-secondary shadow-lg transition-colors hover:bg-black/5"
            >
              <X size={18} />
            </button>
            {/* overflow-hidden on this wrapper (not just rounded-* on the
                img itself) is what actually clips the corners — object-contain
                can letterbox the img's own box short of its visible photo
                edges depending on aspect ratio, which left rounded-2xl on
                the img alone not visibly doing anything. */}
            <div className="max-h-[85vh] w-full overflow-hidden rounded-xl">
              {/* Plain img (not next/image) — the modal only needs to show
                  whatever image was already loaded as a thumbnail, at its
                  own natural size capped to the viewport, not a second fetch. */}
              <img src={image} alt={alt} className="max-h-[85vh] w-full object-contain" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
