"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Drives the `.thin-scroll` hairline scrollbar (customer-theme.css): spread the
 * result onto the scrolling element and the bar shows only while it scrolls,
 * then fades out ~0.7s after the last scroll event.
 */
export function useScrollingFlag() {
  const [scrolling, setScrolling] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return {
    "data-scrolling": scrolling,
    onScroll: () => {
      setScrolling(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setScrolling(false), 700);
    },
  };
}
