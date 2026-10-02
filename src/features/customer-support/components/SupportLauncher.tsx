"use client";

import { usePathname } from "next/navigation";
import { Headphones, Zap } from "lucide-react";
import { LAUNCHER_HIDDEN_PREFIXES } from "../config";
import { useMyTickets, useSupport } from "../hooks/useSupport";

/**
 * The one global Help entry, bottom-right on every customer page except the
 * checkout steps (which carry inline entries instead). Safe-area aware, and
 * pages with a mobile sticky bar lift it via context.launcherOffset.
 */
export default function SupportLauncher() {
  const pathname = usePathname();
  const { panel, context, openSupport } = useSupport();
  const tickets = useMyTickets() ?? [];

  const hidden =
    panel.open || context.hideLauncher || LAUNCHER_HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  if (hidden) return null;

  const eventDay = context.phase === "event_day";
  const needsAttention = tickets.some((t) => t.status === "escalated" || (t.status === "assigned" && t.messages.at(-1)?.author === "em"));
  const offset = context.launcherOffset ?? 0;

  return (
    <button
      type="button"
      onClick={() => openSupport()}
      data-testid="support-launcher"
      aria-label={eventDay ? "Event-day help" : "Help and support"}
      style={{ bottom: `calc(16px + ${offset}px + env(safe-area-inset-bottom, 0px))` }}
      className={`fixed right-4 z-[60] flex h-12 items-center gap-2 rounded-full pr-4 pl-3.5 font-figtree text-[14.5px] font-bold text-white shadow-[0_8px_24px_rgba(4,34,45,0.28)] transition-transform hover:-translate-y-0.5 md:right-6 ${
        eventDay ? "bg-[#C81E0D]" : "bg-[#04222D]"
      }`}
    >
      {eventDay ? <Zap className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
      <span>{eventDay ? "Event-day help" : "Help"}</span>
      {needsAttention && (
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#F0596F]" aria-hidden />
      )}
    </button>
  );
}
