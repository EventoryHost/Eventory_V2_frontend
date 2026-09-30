"use client";

import { useState } from "react";
import Image from "next/image";

const SIZES = {
  // Event questions (nodes 2023:8342 / 2023:8931) and package rows (2023:8407 / 2023:9015).
  lg: {
    px: 32,
    empty: "/images/customer/review/star-32.svg",
    filled: "/images/customer/review/star-filled-32.svg",
  },
  md: {
    px: 24,
    empty: "/images/customer/review/star-24.svg",
    filled: "/images/customer/review/star-filled-24.svg",
  },
} as const;

/**
 * Five-star picker: outline stars when empty, the design's gold stars when
 * picked or hovered (filled state, node 2023:8768). With no onChange it
 * renders read-only — an already-saved review.
 */
export default function StarRating({
  value,
  onChange,
  size = "lg",
  label,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: keyof typeof SIZES;
  label: string;
}) {
  const [hovered, setHovered] = useState(0);
  const { px, empty, filled: filledSrc } = SIZES[size];
  const shown = hovered || value;
  const readOnly = !onChange;

  return (
    <div
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `${label}: ${value} out of 5` : label}
      className="flex items-start gap-1.5"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= shown;
        const icon = (
          <Image src={filled ? filledSrc : empty} alt="" width={px} height={px} style={{ width: px, height: px }} />
        );

        if (readOnly) return <span key={star}>{icon}</span>;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
            onClick={() => onChange(value === star ? 0 : star)}
            onMouseEnter={() => setHovered(star)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            className="cursor-pointer rounded-sm transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
