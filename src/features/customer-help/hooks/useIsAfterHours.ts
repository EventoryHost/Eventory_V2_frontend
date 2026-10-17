"use client";

import { useSyncExternalStore } from "react";

// Event Managers work 9 AM–9 PM India time, whatever the visitor's own
// timezone. Re-checked every minute so an open panel flips at 9 PM.
function isAfterHoursNow() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  );
  return hour < 9 || hour >= 21;
}

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 60_000);
  return () => window.clearInterval(id);
}

export function useIsAfterHours() {
  return useSyncExternalStore(subscribe, isAfterHoursNow, () => false);
}
