"use client";

import { motion } from "framer-motion";

// Figma "Help / Floater" (node 2369:10014). Elevation/MD, taken from the
// edge-tab export's own SVG filter (stdDeviation 2/8/36 → blur 4/16/72,
// third layer eroded by 10px → spread -10px).
const ELEVATION_MD =
  "shadow-[0_4px_4px_0_rgba(3,3,3,0.1),0_6px_16px_0_rgba(3,3,3,0.05),0_14px_72px_-10px_rgba(3,3,3,0.05)]";

export type HelpFloaterVariant = "default" | "compact" | "edge-tab";

type HelpFloaterProps = {
  variant: HelpFloaterVariant;
  onClick: () => void;
};

export default function HelpFloater({ variant, onClick }: HelpFloaterProps) {
  if (variant === "edge-tab") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Show help"
        className="relative block h-[72px] w-[28px]"
      >
        {/* Exported tab already includes its shadow, so the 152×196 canvas
            overhangs the 28×72 tab by 62px left/right and 48px/76px top/
            bottom — kept at its own root size, offset so the tab lands in
            the button's box. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/customer/help/edge-tab.svg"
          alt=""
          width={152}
          height={196}
          className="pointer-events-none absolute left-[-62px] top-[-48px] block max-w-none"
        />
      </button>
    );
  }

  const isCompact = variant === "compact";

  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      aria-label="Need help?"
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      className={`flex items-center gap-2 overflow-hidden rounded-full bg-[#04222d] py-3.5 ${
        isCompact ? "px-3.5" : "px-4"
      } ${ELEVATION_MD}`}
    >
      <motion.img
        layout="position"
        src="/images/customer/help/headphones.svg"
        alt=""
        width={20}
        height={20}
        className="block shrink-0"
      />
      {!isCompact && (
        <motion.span
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="whitespace-nowrap font-figtree text-[14px] font-normal leading-[20px] text-[#e6e9ea]"
        >
          Need help?
        </motion.span>
      )}
    </motion.button>
  );
}
