import { LockKeyhole } from "lucide-react";
import type { RawBookingMilestone } from "@/lib/customerBookingApi";
import { formatAmount } from "@/features/customer-account/utils/groupBookings";
import type { BookingDetailView } from "../types";

function formatDue(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const MILESTONE_TONE: Record<RawBookingMilestone["status"], string> = {
  Received: "text-[#008236]",
  PaymentDue: "text-[#BB4D00]",
  Pending: "text-[#9F9FA9]",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold leading-5 tracking-[0.04em] text-[#71717B]">{children}</p>
  );
}

/** Price summary + payment timeline + cancellation policy (node 1629:6476). */
export default function BookingSidebar({ view }: { view: BookingDetailView }) {
  const { cancellationPolicy: policy } = view;
  const hasPolicyText = Boolean(policy.title || policy.text || policy.fileUrl);

  return (
    <div className="flex w-full flex-col gap-[22px] lg:w-[360px]">
      <section className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white">
        <div className="flex flex-col gap-[13px] border-b border-[#E4E4E7] p-4">
          <SectionTitle>PRICE SUMMARY</SectionTitle>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium leading-5 text-[#3F3F47]">Order total</span>
              <span className="text-[14px] font-bold leading-5 text-[#09090B]">
                {formatAmount(view.orderTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium leading-5 text-[#3F3F47]">Token paid</span>
              <span className="text-[14px] font-semibold leading-5 text-[#008236]">
                -{formatAmount(view.tokenPaid)}
              </span>
            </div>

            <span aria-hidden className="h-px w-full bg-[#E4E4E7]" />

            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium leading-5 text-[#3F3F47]">Remaining amount</span>
              <span className="text-[14px] font-bold leading-5 text-[#09090B]">
                {formatAmount(view.remaining)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-[18px] pb-[18px] pt-[17px]">
          <SectionTitle>PAYMENT TIMELINE</SectionTitle>

          {view.paymentTimeline.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {view.paymentTimeline.map((milestone) => {
                const due = formatDue(milestone.dueDate);
                return (
                  <li key={milestone._id} className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[14px] font-semibold leading-5 text-[#3F3F47]">
                        {milestone.title}
                      </span>
                      <span className={`text-[12px] leading-[18px] ${MILESTONE_TONE[milestone.status]}`}>
                        {milestone.status === "Received" ? "Paid" : due ? `Due ${due}` : "Not scheduled yet"}
                      </span>
                    </div>
                    <span className="shrink-0 text-[14px] font-semibold leading-5 text-[#09090B]">
                      {formatAmount(milestone.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            // The design's only payment-timeline state: nothing to pay yet.
            <div className="flex items-center gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[14px] font-semibold leading-5 text-[#71717B]">Locked</span>
                <span className="text-[14px] leading-[17px] text-[#9F9FA9]">
                  Unlocks when all packages are ready for the event
                </span>
              </div>
              <LockKeyhole className="h-6 w-6 shrink-0 text-[#9F9FA9]" />
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-[25px]">
        <SectionTitle>CANCELLATION POLICIES</SectionTitle>

        {hasPolicyText ? (
          <div className="flex flex-col gap-3">
            {policy.title && (
              <p className="text-[14px] font-semibold leading-5 text-[#030303]">{policy.title}</p>
            )}
            {policy.text && <p className="text-[14px] leading-5 text-[#3F3F47]">{policy.text}</p>}
            {policy.fileUrl && (
              <a
                href={policy.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[14px] font-medium leading-5 text-brand-primary hover:underline"
              >
                Read the full policy
              </a>
            )}
          </div>
        ) : (
          <p className="text-[14px] leading-5 text-[#71717B]">
            This vendor hasn&apos;t published a cancellation policy yet.
          </p>
        )}

        {policy.note && <p className="text-[12px] leading-[18px] text-[#9F9FA9]">{policy.note}</p>}
      </section>
    </div>
  );
}
