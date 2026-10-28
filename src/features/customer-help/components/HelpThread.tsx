import Link from "next/link";
import type { ReactNode } from "react";
import type { BookingAction } from "../assistant/bookingAnswers";
import type { FollowUpField, ThreadItem } from "../assistant/useHelpConversation";
import HelpBriefSentCard from "./HelpBriefSentCard";
import HelpButton from "./HelpButton";
import HelpChip from "./HelpChip";
import HelpMessage from "./HelpMessage";
import HelpOutOfAreaCard from "./HelpOutOfAreaCard";
import HelpPackageCard from "./HelpPackageCard";
import HelpPhotoActions from "./HelpPhotoActions";
import HelpStatusCard from "./HelpStatusCard";
import HelpUnderstoodTag from "./HelpUnderstoodTag";

// The help thread (Figma "04 — Explorer" onwards, v6f9): a ticket's
// summary on top, a date chip whenever the day changes, then the lines.
// Follow-up chips and package cards sit inside the assistant's bubble,
// under a read-only line of what it understood.
type HelpThreadProps = {
  items: ThreadItem[];
  /** Once the brief is sent: the ticket's summary block, pinned on top. */
  summary?: { title: string; ticket: string; raisedAt: string; resolved: boolean };
  onAnswerFollowUp: (questionId: string, field: FollowUpField, option: string) => void;
  onClose: (itemId: string) => void;
  onChatWithEventManager: () => void;
  onWhatsApp: () => void;
  onPackageOpen: () => void;
  /** "Open customise editor" on customisation answers (Figma 5.3). */
  onOpenCustomise: () => void;
  /** The inline brief card, rendered by the widget (it owns submit state). */
  renderBrief: (item: Extract<ThreadItem, { kind: "brief" }>) => ReactNode;
  /** The requirements card (one per chat). */
  renderRequirements: (item: Extract<ThreadItem, { kind: "requirements" }>) => ReactNode;
  /** The WhatsApp card, when the thread asks for it. */
  renderWhatsApp: () => ReactNode;
  /** Figma 9.1–9.3 out-of-area card. */
  accountPhone?: string;
  onNotifyArea: (itemId: string, phone: string) => void;
  onPickArea: (itemId: string, choice: { label: string; city: string }) => void;
  /** Figma 8.1 photo actions. */
  onFindSimilar: (itemId: string) => void;
  onSendPhoto: (itemId: string) => void;
  /** Status card "Get a call back" / "Call me after 9 AM". */
  onRequestCallBack: () => void;
  /** Booking help: the request card for the Event Manager. */
  renderBookingRequest?: (item: Extract<ThreadItem, { kind: "booking-request" }>) => ReactNode;
  onBookingAction?: (itemId: string, action: BookingAction) => void;
  /** "Chat with Event Manager", or "Ask Priya" on a booking page. */
  chatLabel?: string;
  /** Who the status card speaks for, on a booking page. */
  statusWho?: string;
  /** Event-day report (GRV): its tracker replaces the summary and status card. */
  reportStatus?: ReactNode;
};

const ACTION_LABEL: Record<BookingAction, string> = {
  cancel: "Cancel package(s)",
  payments: "Pay on booking page",
  "pay-taken": "Yes, money was taken",
  "pay-not": "No, it just failed",
};

function Understood({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex w-full flex-wrap gap-1.5">
      {tags.map((t) => (
        <HelpUnderstoodTag key={t} label={t} />
      ))}
    </div>
  );
}

function UnderstoodLine({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-1.5 font-figtree text-[12px] font-normal leading-[18px] text-[#3f3f47]">{text}</p>;
}

function Feedback({
  onDone,
  onChat,
  secondary = "Done",
  chatLabel = "Chat with Event Manager",
}: {
  onDone: () => void;
  onChat: () => void;
  secondary?: string;
  chatLabel?: string;
}) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      <HelpButton variant={secondary === "Done" ? "tertiary" : "secondary"} onClick={onDone}>
        {secondary}
      </HelpButton>
      <HelpButton variant="secondary" onClick={onChat}>
        {chatLabel}
      </HelpButton>
    </div>
  );
}

/** "Today", "Yesterday", or "Mon, 12 Oct". */
function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 864e5);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

function DayChip({ label }: { label: string }) {
  return (
    <span className="self-center rounded-full bg-[#f4f4f5] px-2.5 py-0.5 font-figtree text-[11px] font-normal leading-[16px] text-[#71717b]">
      {label}
    </span>
  );
}

export default function HelpThread({
  items,
  summary,
  onAnswerFollowUp,
  onClose,
  onChatWithEventManager,
  onWhatsApp,
  onPackageOpen,
  onOpenCustomise,
  renderBrief,
  renderRequirements,
  renderWhatsApp,
  onRequestCallBack,
  onFindSimilar,
  onSendPhoto,
  accountPhone,
  onNotifyArea,
  onPickArea,
  renderBookingRequest,
  onBookingAction,
  chatLabel,
  statusWho,
  reportStatus,
}: HelpThreadProps) {
  // Date chips from each line's posting time; chats saved before lines
  // had one get a single "Today" chip, as before.
  const hasDates = items.some((i) => "at" in i && i.at);
  const dayChips = new Map<string, string>();
  items.reduce((last, i) => {
    const at = "at" in i ? i.at : undefined;
    if (!at) return last;
    const label = dayLabel(at);
    if (label !== last) dayChips.set(i.id, label);
    return label;
  }, "");

  return (
    <div className="flex w-full flex-col items-stretch pb-6">
      {reportStatus && <div className="px-4 pt-4">{reportStatus}</div>}
      {summary && !reportStatus && (
        <div className="sticky top-0 z-[2] flex flex-col gap-1 border-b border-[#e4e4e7] bg-[#fafafa] px-4 py-3 font-figtree text-[12px] font-normal leading-[18px] text-[#71717b]">
          <div className="flex items-center justify-between gap-2 text-[14px] font-semibold leading-[20px] text-[#030303]">
            <span className="min-w-0 truncate">{summary.title}</span>
            <span
              className={`shrink-0 rounded-full px-2 text-[12px] font-normal leading-[18px] ${
                summary.resolved ? "bg-[#f0fdf4] text-[#008236]" : "bg-[#fffbeb] text-[#bb4d00]"
              }`}
            >
              {summary.resolved ? "Resolved" : "Open"}
            </span>
          </div>
          <span className="text-[#3f3f47]">
            <span className="tabular-nums">{summary.ticket}</span> · raised {dayLabel(summary.raisedAt)},{" "}
            {timeOf(summary.raisedAt)}
          </span>
        </div>
      )}
      <div className="flex w-full flex-col gap-4 px-4 pt-4">
        {!hasDates && <DayChip label="Today" />}
        {items.map((item) => {
          const day = dayChips.get(item.id);
          const chip = day ? <DayChip label={day} /> : null;
          const node = (() => {
            switch (item.kind) {
              case "me":
                return <HelpMessage from="me" text={item.text} time={item.time} photoUrl={item.photoUrl} />;
              case "assistant":
                return <HelpMessage from="assistant" text={item.text} time={item.time} />;
              case "event-manager":
                return <HelpMessage from="event-manager" text={item.text} time={item.time} senderName={item.senderName} />;
              case "typing":
                return <HelpMessage from="typing" />;
              case "system":
                return <HelpMessage from="system" text={item.text} time={item.time} tone={item.tone} />;
              case "question": {
                const chips = item.answered ? null : (
                  <div className="mt-3 flex w-full flex-wrap gap-1.5">
                    {item.options.map((o) => (
                      <HelpChip key={o} label={o} selected={false} onClick={() => onAnswerFollowUp(item.id, item.field, o)} />
                    ))}
                  </div>
                );
                // Chats saved before v6f4: chips under a separate message.
                if (!item.text)
                  return item.answered ? null : (
                    <div className="flex w-full flex-col gap-2.5">
                      <Understood tags={item.understood} />
                      {chips}
                    </div>
                  );
                return (
                  <HelpMessage from="assistant" text={item.text} time={item.time}>
                    <UnderstoodLine text={item.understoodLine} />
                    {chips}
                  </HelpMessage>
                );
              }
              case "results": {
                const cards = (
                  <>
                    <div className="-mx-3.5 mt-3 flex snap-x snap-mandatory scroll-px-3.5 gap-2.5 overflow-x-auto px-3.5 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {item.cards.map((c) =>
                        // Chats saved before v6f4 have the old card shape.
                        typeof c.price === "number" ? (
                          <HelpPackageCard key={c.id} card={c} budgetMax={item.budgetMax} onOpen={onPackageOpen} />
                        ) : null,
                      )}
                    </div>
                    {item.seeAll && (
                      <Link
                        href={item.seeAll.href}
                        onClick={onPackageOpen}
                        className="mt-2.5 inline-block font-figtree text-[14px] font-medium leading-[20px] text-[#030303] underline underline-offset-[3px]"
                      >
                        See all {item.seeAll.count} like this
                      </Link>
                    )}
                  </>
                );
                return (
                  <div className="flex w-full flex-col gap-4">
                    {item.text ? (
                      <HelpMessage from="assistant" text={item.text} time={item.time}>
                        <UnderstoodLine text={item.understoodLine} />
                        {cards}
                      </HelpMessage>
                    ) : (
                      <div className="flex w-full flex-col gap-2.5">
                        <Understood tags={item.understood} />
                        {cards}
                      </div>
                    )}
                    {!item.closed && <Feedback onDone={() => onClose(item.id)} onChat={onChatWithEventManager} chatLabel={chatLabel} />}
                  </div>
                );
              }
              case "requirements":
                return renderRequirements(item);
              case "brief-sent":
                return <HelpBriefSentCard item={item} />;
              case "whatsapp":
                return renderWhatsApp();
              case "booking-request":
                return item.state === "open" ? (renderBookingRequest?.(item) ?? null) : null;
              case "booking-actions":
                return item.closed ? null : (
                  <div className="flex w-full flex-wrap gap-2">
                    {item.actions.map((a) => (
                      <HelpButton key={a} variant="secondary" onClick={() => onBookingAction?.(item.id, a)}>
                        {ACTION_LABEL[a]}
                      </HelpButton>
                    ))}
                  </div>
                );
              case "feedback":
                return item.closed ? null : item.action === "customise" ? (
                  <Feedback
                    secondary="Open customise editor"
                    onDone={() => {
                      onClose(item.id);
                      onOpenCustomise();
                    }}
                    onChat={onChatWithEventManager}
                    chatLabel={chatLabel}
                  />
                ) : (
                  <Feedback onDone={() => onClose(item.id)} onChat={onChatWithEventManager} chatLabel={chatLabel} />
                );
              case "out-of-area":
                return item.state === "dismissed" ? null : (
                  <div className="flex w-full flex-col gap-4">
                    {item.state === "open" && item.closest.length > 0 && (
                      <div className="flex w-full flex-col gap-2.5">
                        <p className="font-figtree text-[11px] font-normal uppercase leading-[16px] text-[#71717b]">
                          Closest areas we cover
                        </p>
                        <div className="flex w-full flex-wrap gap-1.5">
                          {item.closest.map((c) => (
                            <HelpChip key={c.label} label={c.label} selected={false} onClick={() => onPickArea(item.id, c)} />
                          ))}
                        </div>
                      </div>
                    )}
                    <HelpOutOfAreaCard
                      area={item.area}
                      accountPhone={accountPhone}
                      saved={item.state === "saved"}
                      onNotify={(phone) => onNotifyArea(item.id, phone)}
                      onChatWithEventManager={onChatWithEventManager}
                    />
                  </div>
                );
              case "photo-actions":
                return item.closed ? null : (
                  <HelpPhotoActions
                    onFindSimilar={() => onFindSimilar(item.id)}
                    onSendToEventManager={() => onSendPhoto(item.id)}
                    onWhatsApp={onWhatsApp}
                  />
                );
              case "brief":
                return item.state === "open" ? renderBrief(item) : null;
              case "status":
                return reportStatus ? null : (
                  <HelpStatusCard
                    who={statusWho}
                    state={item.state}
                    callBackWhen={item.callBackWhen}
                    onRequestCallBack={onRequestCallBack}
                    onWhatsApp={onWhatsApp}
                  />
                );
              default:
                // Kinds from older saved chats (e.g. the inline call back form).
                return null;
            }
          })();
          if (!node && !chip) return null;
          return (
            <div key={item.id} className="contents">
              {chip}
              {node}
            </div>
          );
        })}
      </div>
    </div>
  );
}
