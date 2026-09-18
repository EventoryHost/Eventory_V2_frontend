"use client";

import { useState } from "react";
import { CalendarDays, Download, FileText, MapPin, Users } from "lucide-react";
import { downloadBookingInvoice } from "@/lib/customerBookingApi";
import type { BookingDetailView } from "../types";

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
}

function dayNumber(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric" });
}

function weekdayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short" });
}

function formatBookedOn(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** "6hrs" — only when both ends of the event window were captured. */
function durationLabel(start?: string, end?: string) {
  if (!start || !end) return null;
  const toMinutes = (value: string) => {
    const match = value.match(/(\d{1,2})\s*:?\s*(\d{2})?\s*(am|pm)?/i);
    if (!match) return null;
    let hours = Number(match[1]);
    const minutes = Number(match[2] ?? 0);
    const meridiem = match[3]?.toLowerCase();
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from == null || to == null) return null;
  const span = (to - from + 24 * 60) % (24 * 60);
  if (!span) return null;
  const hours = Math.floor(span / 60);
  const minutes = span % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}hrs`;
}

function MetaItem({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[14px] font-medium leading-5 text-[#71717B]">
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {children}
    </span>
  );
}

/** The event summary under the page title (node 1629:6623). */
export default function EventSummaryHeader({ view }: { view: BookingDetailView }) {
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const duration = durationLabel(view.startTime, view.endTime);
  const bookedOn = formatBookedOn(view.bookedOn);

  async function handleInvoice() {
    setIsDownloading(true);
    setInvoiceError(null);
    try {
      const blob = await downloadBookingInvoice(view.reference);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${view.reference}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setInvoiceError(err instanceof Error ? err.message : "Could not download that invoice");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        {/* Date chip */}
        <div className="flex h-[105px] w-[75px] shrink-0 flex-col items-center overflow-hidden rounded-xl border-[0.8px] border-[#E4E4E7] bg-white">
          <div className="flex w-full items-center justify-center bg-[#790B1A] px-6 py-[5px]">
            <span className="text-[12px] font-bold leading-[18px] tracking-[0.05em] text-[#FAFAFA]">
              {monthLabel(view.eventDate)}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-[7px]">
            <span className="text-[28px] font-bold leading-9 text-[#030303]">{dayNumber(view.eventDate)}</span>
            <span className="text-[12px] leading-[18px] text-[#71717B]">{weekdayLabel(view.eventDate)}</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-semibold leading-7 text-[#3F3F47]">{view.eventTitle}</h2>

            {(view.startTime || view.endTime) && (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-3">
                  {view.startTime && (
                    <span className="text-[16px] font-semibold leading-6 text-[#3F3F47]">{view.startTime}</span>
                  )}
                  {view.startTime && view.endTime && (
                    <span aria-hidden className="h-px w-[22px] bg-[#3F3F47]" />
                  )}
                  {view.endTime && (
                    <span className="text-[16px] font-semibold leading-6 text-[#3F3F47]">{view.endTime}</span>
                  )}
                </div>
                {duration && (
                  <span className="rounded-full bg-[#F4F4F5] px-2.5 py-[3px] text-[12px] font-medium leading-[18px] tracking-[0.02em] text-[#3F3F47]">
                    {duration}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2">
            {view.guestsLabel && <MetaItem icon={Users}>{view.guestsLabel}</MetaItem>}
            {bookedOn && <MetaItem icon={CalendarDays}>Booked on {bookedOn}</MetaItem>}
            {view.location && <MetaItem icon={MapPin}>{view.location}</MetaItem>}
            <MetaItem icon={FileText}>{view.reference}</MetaItem>
          </div>
        </div>
      </div>

      <div className="flex w-[180px] shrink-0 flex-col gap-2">
        <button
          type="button"
          onClick={handleInvoice}
          disabled={isDownloading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F4F4F5] px-3 py-2 text-[14px] font-medium leading-5 text-[#3F3F47] transition-colors hover:bg-[#EBEBEC] disabled:opacity-60"
        >
          {isDownloading ? "Preparing…" : "Download invoice"}
          <Download className="h-4 w-4" />
        </button>

        {/* The backend has no EM/support contact to route this to — it says so
            in the booking payload — so the row stays inert for now. */}
        <span
          title="Support contact isn't wired up yet"
          className="flex w-full cursor-default items-center justify-center rounded-full px-3 py-2 text-[14px] font-medium leading-5 text-[#3F3F47]"
        >
          Help &amp; Support
        </span>

        {invoiceError && <p className="text-[12px] leading-4 text-[#C81E0D]">{invoiceError}</p>}
      </div>
    </div>
  );
}
