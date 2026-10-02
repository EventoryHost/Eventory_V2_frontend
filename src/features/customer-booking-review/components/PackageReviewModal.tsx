"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { CATEGORY_META } from "@/lib/categoryMeta";
import { resolveVendorCategory } from "@/lib/vendorType";
import { uploadImage } from "@/lib/uploadImage";
import type { BookingPackageRow } from "@/features/customer-booking-detail/types";
import StarRating from "./StarRating";

export interface PackageReviewDraft {
  rating: number;
  comment: string;
  /** Already-uploaded image URLs. */
  photos: string[];
}

/** Matches the backend's per-package cap. */
const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/**
 * "Share your thoughts" popup for one package (node 2023:9089; with photos,
 * node 2023:9135; placement over the page, node 2023:8450). Edits stay local
 * until Save rating hands them back — Cancel, Escape or the backdrop discard
 * them. With no onSave it shows an already-submitted review, read-only.
 */
export default function PackageReviewModal({
  row,
  initial,
  onSave,
  onClose,
}: {
  row: BookingPackageRow | null;
  initial: PackageReviewDraft;
  onSave?: (draft: PackageReviewDraft) => void;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {row && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Review ${row.name}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative max-h-full w-full max-w-[695px] overflow-y-auto rounded-[20px] bg-white p-5"
          >
            {/* Keyed so reopening for another package starts from its own draft. */}
            <ReviewForm key={row.id} row={row} initial={initial} onSave={onSave} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ReviewForm({
  row,
  initial,
  onSave,
  onClose,
}: {
  row: BookingPackageRow;
  initial: PackageReviewDraft;
  onSave?: (draft: PackageReviewDraft) => void;
  onClose: () => void;
}) {
  const readOnly = !onSave;
  const [rating, setRating] = useState(initial.rating);
  const [comment, setComment] = useState(initial.comment);
  const [photos, setPhotos] = useState(initial.photos);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const category = resolveVendorCategory(row.vendorType);
  const meta = category ? CATEGORY_META[category.category] : undefined;

  // Escape closes, and the page behind shouldn't scroll while this is open.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(null);

    const room = MAX_PHOTOS - photos.length - uploading;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    if (files.length > picked.length) setUploadError(`You can add up to ${MAX_PHOTOS} photos.`);

    const valid = picked.filter((file) => file.type.startsWith("image/") && file.size <= MAX_PHOTO_BYTES);
    if (valid.length < picked.length) setUploadError("Photos must be images under 10 MB.");

    setUploading((count) => count + valid.length);
    await Promise.all(
      valid.map(async (file) => {
        try {
          const url = await uploadImage(file);
          setPhotos((prev) => [...prev, url]);
        } catch {
          setUploadError("Couldn't upload a photo. Please try again.");
        } finally {
          setUploading((count) => count - 1);
        }
      })
    );
  }

  const canSave = rating > 0 && uploading === 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {category && (
            <span
              className="flex h-6 items-center gap-2 self-start rounded-[52px] py-1 pl-1 pr-3"
              style={{ background: `linear-gradient(to right, #ffffff, ${meta?.gradientFrom ?? "#FFE5E9"} 80%)` }}
            >
              {meta?.icon && <Image src={meta.icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />}
              <span className="whitespace-nowrap text-[12px] font-semibold uppercase leading-[18px] tracking-[-0.01em] text-[#3C060D]">
                {category.label}
              </span>
            </span>
          )}
          <div className="flex min-w-0 items-center gap-[3px]">
            <p className="truncate text-[18px] font-semibold leading-6 text-[#030303]">{row.name}</p>
            {row.variantLabel && (
              <>
                <Image src="/images/customer/review/title-dot.svg" alt="" width={2.28} height={5.28} className="shrink-0" />
                <p className="truncate text-[18px] font-medium leading-6 text-[#71717B]">{row.variantLabel}</p>
              </>
            )}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="shrink-0 cursor-pointer">
          <Image src="/images/customer/review/close-24.svg" alt="" width={24} height={24} />
        </button>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative h-[157px] w-[161px] shrink-0 overflow-hidden rounded-[14px] bg-[#F4F4F5]">
          {row.image && <Image src={row.image} alt={row.name} fill sizes="161px" className="object-cover" />}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-end gap-[25px]">
          <div className="flex w-full flex-col gap-4">
            {readOnly ? (
              <StarRating value={rating} label={`Your rating for ${row.name}`} />
            ) : (
              <StarRating value={rating} onChange={setRating} label={`Rate ${row.name}`} />
            )}

            {readOnly ? (
              comment && (
                <p className="whitespace-pre-line rounded-2xl border border-[#E4E4E7] p-3 text-[14px] leading-5 text-[#3F3F47]">
                  {comment}
                </p>
              )
            ) : (
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={2000}
                placeholder="Share your thoughts (optional)"
                aria-label="Share your thoughts"
                className="h-[109px] w-full resize-none rounded-2xl border border-[#E4E4E7] p-3 text-[14px] leading-5 text-[#030303] outline-none placeholder:text-[#9F9FA9] focus:border-[#D4D4D8]"
              />
            )}

            {(!readOnly || photos.length > 0) && (
              <div className="flex flex-wrap items-end gap-4">
                {photos.map((url) => (
                  <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg bg-[#D9D9D9]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- freshly uploaded S3 URL; its host isn't guaranteed to be in next.config's image domains */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((item) => item !== url))}
                        aria-label="Remove photo"
                        className="absolute left-[60px] top-1.5 cursor-pointer"
                      >
                        <Image src="/images/customer/review/photo-remove.svg" alt="" width={14} height={14} />
                      </button>
                    )}
                  </div>
                ))}
                {Array.from({ length: uploading }, (_, index) => (
                  <div key={`uploading-${index}`} className="flex h-20 w-20 items-center justify-center rounded-lg bg-[#D9D9D9]">
                    <Loader2 className="h-5 w-5 animate-spin text-[#71717B]" />
                  </div>
                ))}

                {!readOnly && photos.length + uploading < MAX_PHOTOS && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-[#E4E4E7] p-3 text-[14px] leading-5 text-black transition-colors hover:bg-[#FAFAFA]"
                    >
                      <Image src="/images/customer/review/camera.svg" alt="" width={20} height={20} />
                      Add photos
                    </button>
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(event) => {
                        handleFiles(event.target.files);
                        event.target.value = "";
                      }}
                    />
                  </>
                )}
              </div>
            )}
            {uploadError && <p className="text-[12px] leading-4 text-[#C81E0D]">{uploadError}</p>}
          </div>

          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-2.5 text-[16px] leading-6 text-[#030303] transition-colors hover:bg-[#F4F4F5]"
            >
              {readOnly ? "Close" : "Cancel"}
            </button>
            {!readOnly && (
              <button
                type="button"
                disabled={!canSave}
                onClick={() => onSave({ rating, comment: comment.trim(), photos })}
                className="rounded-full bg-brand-primary px-6 py-2.5 text-[16px] leading-6 text-white transition-colors hover:bg-[#E14E64] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Save rating"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
