"use client";

import { useState } from "react";
import { CalendarDays, Download, FileText, Headphones, MapPin, Users } from "lucide-react";
import { downloadBookingInvoice } from "@/lib/customerBookingApi";
import { openSupport } from "@/features/customer-support/store";
import type { BookingDetailView } from "../types";
import { durationLabel, formatBookedOn } from "../utils/eventTiming";

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
}

function dayNumber(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric" });
}

function weekdayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short" });
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

        {/* Opens the Help panel on this booking: what it shows depends on the
            phase (before / on the day / after) registered by BookingDetailContent. */}
        <button
          type="button"
          onClick={() => openSupport()}
          data-testid="booking-help-button"
          className="flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[14px] font-medium leading-5 text-[#3F3F47] transition-colors hover:bg-[#F4F4F5]"
        >
          <Headphones className="h-4 w-4" />
          Help &amp; Support
        </button>

        {invoiceError && <p className="text-[12px] leading-4 text-[#C81E0D]">{invoiceError}</p>}
      </div>
    </div>
  );
}
