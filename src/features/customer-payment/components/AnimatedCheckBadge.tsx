"use client";

import { motion } from "framer-motion";

export default function AnimatedCheckBadge() {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00A63E]"
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
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.25 }}
        />
      </motion.svg>
    </motion.span>
  );
}
