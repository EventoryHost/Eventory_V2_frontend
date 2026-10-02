"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import type { TicketStatus } from "../types";

/** Small uppercase section label ("WHAT IS THIS ABOUT?"), as in the ideation flow. */
export function SectionLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <p className="mb-2.5 font-figtree text-[11.5px] font-bold tracking-[0.1em] text-[#71717B] uppercase">
      {children}
      {hint && <span className="ml-1 font-medium tracking-normal normal-case text-[#9F9FA9]">({hint})</span>}
    </p>
  );
}

export function Chip({
  selected,
  onClick,
  children,
  tone = "ink",
}: {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  tone?: "ink" | "brand";
}) {
  const on = tone === "brand" ? "border-[#F0596F] bg-[#FDEEF0] text-[#C81E0D]" : "border-[#04222D] bg-[#04222D] text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 font-figtree text-[13.5px] font-medium transition-colors ${
        selected ? on : "border-[#E4E4E7] bg-white text-[#3F3F47] hover:border-[#D4D4D8]"
      }`}
    >
      {children}
    </button>
  );
}

/** A big tappable row ("Chat with your Event Manager"). */
export function DoorButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
  tone = "neutral",
  badge,
  testId,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClick: () => void;
  tone?: "neutral" | "urgent" | "suggested" | "whatsapp";
  badge?: string;
  testId?: string;
}) {
  const box =
    tone === "urgent"
      ? "border-[#FFCAC5] bg-[#FFF2F1] hover:border-[#F0596F]"
      : tone === "suggested"
        ? "border-[#F0596F] bg-white ring-4 ring-[#FDEEF0]"
        : "border-[#E4E4E7] bg-white hover:border-[#D4D4D8]";
  const iconBox =
    tone === "urgent"
      ? "bg-[#C81E0D] text-white"
      : tone === "suggested"
        ? "bg-[#FDEEF0] text-[#F0596F]"
        : tone === "whatsapp"
          ? "bg-[#E6F7F2] text-[#00AB82]"
          : "bg-[#F4F4F5] text-[#3F3F47]";
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors ${box}`}
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBox}`}>
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`font-figtree text-[15.5px] font-bold leading-5 ${tone === "urgent" ? "text-[#C81E0D]" : "text-[#09090B]"}`}
          >
            {title}
          </span>
          {badge && (
            <span className="rounded-full bg-[#FDEEF0] px-2 py-0.5 font-figtree text-[10.5px] font-bold tracking-wide text-[#C81E0D] uppercase">
              {badge}
            </span>
          )}
        </span>
        {subtitle && <span className="mt-0.5 block font-figtree text-[13px] leading-[18px] text-[#71717B]">{subtitle}</span>}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#9F9FA9]" />
    </button>
  );
}

const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  waiting_for_em: { label: "Waiting for EM", className: "bg-[#FFFBEB] text-[#BB4D00]" },
  assigned: { label: "Open", className: "bg-[#FFFBEB] text-[#BB4D00]" },
  escalated: { label: "Call us", className: "bg-[#FFF2F1] text-[#C81E0D]" },
  resolved: { label: "Resolved", className: "bg-[#F0FDF4] text-[#008236]" },
};

export function StatusPill({ status }: { status: TicketStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-figtree text-[11.5px] font-bold ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
      <path d="M12.05 2c-5.523 0-10 4.477-10 10 0 1.76.457 3.464 1.323 4.965L2 22l5.16-1.354A9.96 9.96 0 0 0 12.05 22c5.523 0 10-4.477 10-10s-4.477-10-10-10Zm0 18.2c-1.6 0-3.166-.43-4.535-1.243l-.325-.194-3.06.803.817-2.983-.212-.306A8.19 8.19 0 0 1 3.85 12c0-4.528 3.673-8.2 8.2-8.2s8.2 3.672 8.2 8.2-3.672 8.2-8.2 8.2Z" />
    </svg>
  );
}
