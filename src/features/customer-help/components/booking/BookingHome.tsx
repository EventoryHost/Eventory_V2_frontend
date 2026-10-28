"use client";

import { useState } from "react";
import { formatPrice } from "@/features/customer-package-detail/utils/formatPrice";
import type { HelpConversationSummary } from "@/lib/customerHelpApi";
import { dayText, emFull } from "../../assistant/bookingAnswers";
import type { HelpBookingContext } from "../../helpContext";
import type { BookingHelpData } from "../../hooks/useBookingHelpData";
import HelpAskBox from "../HelpAskBox";
import { HelpTicketCard } from "../HelpChats";
import { Pill, Row, SectionHead } from "./ui";

// v6f9 "Help with your booking" home: the Event Manager first (AB-32),
// then the event with an ask box, the three doors, and recent chats.
export type BookingDoorKey = "mybooking" | "pay" | "vendor" | "other";

type Props = {
  ctx: HelpBookingContext;
  data: BookingHelpData | null;
  loadError: boolean;
  isAfterHours: boolean;
  recentChats: HelpConversationSummary[];
  onMessageEventManager: () => void;
  onCallBack: () => void;
  onWhatsApp: () => void;
  onAsk: (text: string) => void;
  onDoor: (door: BookingDoorKey) => void;
  onOpenChat: (conversationId: string) => void;
  onSeeAllChats: () => void;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function BookingHome({
  ctx,
  data,
  loadError,
  isAfterHours,
  recentChats,
  onMessageEventManager,
  onCallBack,
  onWhatsApp,
  onAsk,
  onDoor,
  onOpenChat,
  onSeeAllChats,
}: Props) {
  const [question, setQuestion] = useState("");
  const active = ctx.packages.filter((p) => p.statusTone !== "cancelled");
  const date = new Date(ctx.eventDate);
  const anyFree = data?.packages.some((p) => !p.cancelled && p.terms?.freeNow);
  const toReview = ctx.proposalsAwaitingReview.length;

  return (
    <div className="flex w-full flex-col gap-5 px-4 pb-6 pt-4 font-figtree">
      <section className="flex flex-col gap-2">
        <SectionHead>Your Event Manager</SectionHead>
        <Row
          onClick={onMessageEventManager}
          lead={
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#04222d] text-[14px] font-semibold text-[#fafafa]">
              {data?.emName ? (
                initials(data.emName)
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/images/customer/help/user-rounded.svg" alt="" width={18} height={18} className="block" />
              )}
            </span>
          }
          title={`Message ${emFull(data?.emName ?? null)}`}
          sub={isAfterHours ? "Offline now · replies from 9 AM" : "We usually reply within 30 min · 9 AM–9 PM"}
        />
        <p className="text-[12px] leading-[18px] text-[#71717b]">
          Need us faster?{" "}
          <button type="button" onClick={onCallBack} className="text-[#030303] underline underline-offset-2">
            Get a call back
          </button>{" "}
          or{" "}
          <button type="button" onClick={onWhatsApp} className="text-[#030303] underline underline-offset-2">
            WhatsApp the Eventory team
          </button>
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-[16px] bg-[#fafafa] px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="w-11 shrink-0 overflow-hidden rounded-[10px] border border-[#e4e4e7] bg-white text-center">
            <span className="block bg-[#b4112a] text-[10px] font-semibold leading-4 text-white">
              {date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}
            </span>
            <span className="block text-[16px] font-semibold leading-6 text-[#030303]">{date.getDate()}</span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[14px] font-semibold leading-[20px] text-[#030303]">{ctx.eventTitle}</span>
            <span className="truncate text-[12px] leading-[18px] text-[#71717b]">
              {active.length} service{active.length === 1 ? "" : "s"}
              {ctx.location ? ` · ${ctx.location}` : ""}
            </span>
          </span>
          {active.length ? <Pill tone="confirmed">{ctx.packages.some((p) => p.statusTone === "confirmed") ? "Confirmed" : "Booked"}</Pill> : <Pill tone="neutral">Cancelled</Pill>}
        </div>
        <HelpAskBox
          value={question}
          onChange={setQuestion}
          placeholder="Ask about this booking"
          onSend={() => {
            onAsk(question.trim());
            setQuestion("");
          }}
        />
      </section>

      <section className="flex flex-col gap-2">
        <SectionHead>What do you need help with?</SectionHead>
        {loadError && (
          <p className="text-[12px] leading-[18px] text-[#c81e0d]">We couldn’t load your booking’s details. Try again in a moment.</p>
        )}
        <Row
          onClick={() => onDoor("mybooking")}
          lead={<DoorIcon src="/images/customer/help/calendar.svg" />}
          title="My booking"
          sub={
            data && !anyFree
              ? "Changes need the vendor’s approval · cancelling is still open"
              : "Customise, guests, date, venue, cancel"
          }
          pill={toReview ? <Pill tone="pending">{toReview} to review</Pill> : undefined}
        />
        <Row
          onClick={() => onDoor("pay")}
          lead={<DoorIcon src="/images/customer/help/wallet.svg" />}
          title="Payments and invoices"
          sub={
            !data
              ? "Dues, payment modes, invoices"
              : data.remaining > 0
                ? `${formatPrice(data.remaining)} due${data.nextDueDate ? ` by ${dayText(data.nextDueDate)}` : ""} · invoices`
                : "Paid in full · invoices"
          }
        />
        <Row
          onClick={() => onDoor("vendor")}
          lead={<DoorIcon src="/images/customer/help/box.svg" />}
          title="A vendor or package question"
          sub="What’s included, timings, asking a vendor"
        />
      </section>

      {recentChats.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionHead
            action={
              <button type="button" onClick={onSeeAllChats} className="text-[14px] font-medium text-[#030303] underline underline-offset-[3px]">
                See all
              </button>
            }
          >
            Recent chats
          </SectionHead>
          {recentChats.slice(0, 2).map((c) => (
            <HelpTicketCard key={c.conversationId} chat={c} onOpen={() => onOpenChat(c.conversationId)} />
          ))}
        </section>
      )}
    </div>
  );
}

function DoorIcon({ src }: { src: string }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f4f4f5]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={20} height={20} className="block" />
    </span>
  );
}
