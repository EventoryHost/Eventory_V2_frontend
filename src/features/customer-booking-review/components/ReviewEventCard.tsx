import Image from "next/image";
import { CalendarDays, FileText, MapPin, Users } from "lucide-react";
import type { BookingDetailView } from "@/features/customer-booking-detail/types";
import { durationLabel, formatBookedOn } from "@/features/customer-booking-detail/utils/eventTiming";

/** "Thursday, 12 March 2026" */
function formatEventDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const weekday = date.toLocaleDateString("en-IN", { weekday: "long" });
  const rest = date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return `${weekday}, ${rest}`;
}

function MetaItem({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return (
    <span className="flex min-w-0 max-w-full items-center gap-1.5 text-[14px] font-medium leading-5 text-[#71717B]">
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

/** The event summary card at the top of the sidebar (node 2023:8270). */
export default function ReviewEventCard({ view, completed }: { view: BookingDetailView; completed: boolean }) {
  const eventDate = formatEventDate(view.eventDate);
  const bookedOn = formatBookedOn(view.bookedOn);
  const duration = durationLabel(view.startTime, view.endTime);

  return (
    <section className="flex flex-col gap-3.5 rounded-2xl border border-[#E4E4E7] bg-white p-4">
      {completed && (
        <span className="self-start rounded-full bg-[#F0FDF4] px-3 py-1.5 text-[12px] font-semibold uppercase leading-[16.8px] tracking-[0.04em] text-[#008236]">
          Completed
        </span>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-[20px] font-semibold leading-7 text-[#3F3F47]">{view.eventTitle}</h2>
          {eventDate && <p className="text-[14px] font-medium leading-5 text-[#9F9FA9]">{eventDate}</p>}
        </div>

        {(view.startTime || view.endTime) && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-[#FAFAFA] p-3">
            <div className="flex flex-col gap-1">
              <p className="text-[12px] font-medium leading-[18px] text-[#9F9FA9]">TIMING</p>
              <div className="flex items-center gap-3">
                {view.startTime && (
                  <span className="whitespace-nowrap text-[16px] font-semibold leading-6 text-[#3F3F47]">
                    {view.startTime}
                  </span>
                )}
                {view.startTime && view.endTime && (
                  <Image src="/images/customer/review/timing-arrow.svg" alt="" width={23} height={11} className="shrink-0" />
                )}
                {view.endTime && (
                  <span className="whitespace-nowrap text-[16px] font-semibold leading-6 text-[#3F3F47]">
                    {view.endTime}
                  </span>
                )}
              </div>
            </div>
            {duration && (
              <span className="shrink-0 rounded-full border border-[#E4E4E7] bg-white px-2.5 py-[3px] text-[12px] font-medium leading-[18px] tracking-[0.02em] text-[#3F3F47]">
                {duration}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-x-[34px] gap-y-3">
        {view.guestsLabel && <MetaItem icon={Users}>{view.guestsLabel}</MetaItem>}
        {bookedOn && <MetaItem icon={CalendarDays}>Booked on {bookedOn}</MetaItem>}
        <MetaItem icon={FileText}>{view.reference}</MetaItem>
        {view.location && <MetaItem icon={MapPin}>{view.location}</MetaItem>}
      </div>
    </section>
  );
}
