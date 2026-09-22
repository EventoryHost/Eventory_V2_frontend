"use client";

import { motion } from "framer-motion";

export default function AnimatedCheckBadge() {
  return (
    <span className="relative flex h-16 w-16 items-center justify-center">
      {/* Ripple that expands outward and fades once the badge pops in — gives
          the checkmark a bit of "success" weight instead of a flat scale-in. */}
      <motion.span
        initial={{ scale: 0.6, opacity: 0.5 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-[#00A63E]"
      />

      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 14, mass: 0.6 }}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#00A63E]"
      >
        <motion.svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M6 12.5l4 4L18 8"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.3 }}
          />
        </motion.svg>
      </motion.span>
    </span>
  );
}
