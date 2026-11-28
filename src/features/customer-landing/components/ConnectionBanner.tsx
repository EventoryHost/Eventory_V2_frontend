"use client";

import { useState, useSyncExternalStore } from "react";

// Amber notice shown when the visitor is offline or on a very weak
// connection — same look as the "Editing is paused…" notice (Figma node
// 3641:82479): #FFFBEB surface, #BB4D00 text, info icon, 12px radius.

type ConnectionState = "ok" | "slow" | "offline";

interface NetworkInformationLike extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

function getConnection(): NetworkInformationLike | undefined {
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

// A string snapshot so useSyncExternalStore sees a stable value between renders.
function readState(): ConnectionState {
  if (!navigator.onLine) return "offline";
  const connection = getConnection();
  if (!connection) return "ok";
  const slowType = connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
  // rtt/downlink are 0 when the browser has no estimate yet — ignore those.
  const slowRtt = (connection.rtt ?? 0) > 1500;
  const slowDownlink = (connection.downlink ?? 0) > 0 && (connection.downlink ?? 0) < 0.4;
  return slowType || slowRtt || slowDownlink ? "slow" : "ok";
}

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  const connection = getConnection();
  connection?.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
    connection?.removeEventListener("change", onChange);
  };
}

const MESSAGES: Record<Exclude<ConnectionState, "ok">, string> = {
  offline: "You're offline. Check your internet connection — changes won't be saved until you're back online.",
  slow: "Your connection looks slow, so pages and photos may take longer to load. Hang tight.",
};

export default function ConnectionBanner() {
  const state = useSyncExternalStore(subscribe, readState, () => "ok" as ConnectionState);
  // The slow notice can be dismissed for the rest of the visit; going offline always shows it.
  const [dismissedSlow, setDismissedSlow] = useState(false);

  if (state === "ok" || (state === "slow" && dismissedSlow)) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[84px] z-[60] flex justify-center px-4"
    >
      <div className="pointer-events-auto flex max-w-[480px] items-center gap-1.5 rounded-xl bg-[#FFFBEB] px-3 py-2.5 shadow-[0px_4px_12px_rgba(3,3,3,0.08)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local icon */}
        <img src="/images/customer/common/info-circle.svg" alt="" className="h-[18px] w-[18px] shrink-0" />
        <p className="font-figtree text-[14px] leading-5 text-[#BB4D00]">{MESSAGES[state]}</p>
        {state === "slow" && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setDismissedSlow(true)}
            className="ml-1 shrink-0 rounded-full px-1.5 font-figtree text-[18px] leading-5 text-[#BB4D00] hover:bg-[#BB4D00]/10"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
