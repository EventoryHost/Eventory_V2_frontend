import Link from "next/link";
import type { ReactNode } from "react";
import type { FollowUpField, ThreadItem } from "../assistant/useHelpConversation";
import HelpButton from "./HelpButton";
import HelpChip from "./HelpChip";
import HelpMessage from "./HelpMessage";
import HelpOutOfAreaCard from "./HelpOutOfAreaCard";
import HelpPackageCard from "./HelpPackageCard";
import HelpPhotoActions from "./HelpPhotoActions";
import HelpStatusCard from "./HelpStatusCard";
import HelpUnderstoodTag from "./HelpUnderstoodTag";

// Assistant thread body (Figma "04 — Explorer", node 2369:11135): date chip,
// messages, then the answer's attachments — understood tags, follow-up
// chips or package cards — and the Done / Chat with Event Manager row.
type HelpThreadProps = {
  items: ThreadItem[];
  onAnswerFollowUp: (questionId: string, field: FollowUpField, option: string) => void;
  onClose: (itemId: string) => void;
  onChatWithEventManager: () => void;
  onWhatsApp: () => void;
  onPackageOpen: () => void;
  /** "Open customise editor" on customisation answers (Figma 5.3). */
  onOpenCustomise: () => void;
  /** The inline brief card, rendered by the widget (it owns submit state). */
  renderBrief: (item: Extract<ThreadItem, { kind: "brief" }>) => ReactNode;
  /** Figma 9.1–9.3 out-of-area card. */
  accountPhone?: string;
  onNotifyArea: (itemId: string, phone: string) => void;
  onPickArea: (itemId: string, choice: { label: string; city: string }) => void;
  /** Figma 8.1 photo actions. */
  onFindSimilar: (itemId: string) => void;
  onSendPhoto: (itemId: string) => void;
  /** Status card "Get a call back" / "Call me after 9 AM". */
  onRequestCallBack: () => void;
  /** Guest phone form for a call back (Figma 6.6). */
  renderCallBackForm: () => ReactNode;
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

function Feedback({
  onDone,
  onChat,
  secondary = "Done",
}: {
  onDone: () => void;
  onChat: () => void;
  secondary?: string;
}) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      <HelpButton variant="secondary" onClick={onDone}>
        {secondary}
      </HelpButton>
      <HelpButton onClick={onChat}>Chat with Event Manager</HelpButton>
    </div>
  );
}

export default function HelpThread({
  items,
  onAnswerFollowUp,
  onClose,
  onChatWithEventManager,
  onWhatsApp,
  onPackageOpen,
  onOpenCustomise,
  renderBrief,
  onRequestCallBack,
  renderCallBackForm,
  onFindSimilar,
  onSendPhoto,
  accountPhone,
  onNotifyArea,
  onPickArea,
}: HelpThreadProps) {
  return (
    <div className="flex w-full flex-col items-center gap-5 px-4 pb-6 pt-4">
      <span className="rounded-full bg-[#f4f4f5] px-2.5 py-0.5 font-figtree text-[11px] font-normal leading-[16px] text-[#71717b]">
        Today
      </span>
      <div className="flex w-full flex-col gap-4">
        {items.map((item) => {
          switch (item.kind) {
            case "me":
              return <HelpMessage key={item.id} from="me" text={item.text} time={item.time} photoUrl={item.photoUrl} />;
            case "assistant":
              return <HelpMessage key={item.id} from="assistant" text={item.text} time={item.time} />;
            case "event-manager":
              return (
                <HelpMessage
                  key={item.id}
                  from="event-manager"
                  text={item.text}
                  time={item.time}
                  senderName={item.senderName}
                />
              );
            case "typing":
              return <HelpMessage key={item.id} from="typing" />;
            case "system":
              return <HelpMessage key={item.id} from="system" text={item.text} time={item.time} tone={item.tone} />;
            case "question":
              // Answered questions drop their chips; the tapped answer
              // appears as the customer's own message (Figma 4.3).
              return item.answered ? null : (
                <div key={item.id} className="flex w-full flex-col gap-2.5">
                  <Understood tags={item.understood} />
                  <div className="flex w-full flex-wrap gap-1.5">
                    {item.options.map((o) => (
                      <HelpChip
                        key={o}
                        label={o}
                        selected={false}
                        onClick={() => onAnswerFollowUp(item.id, item.field, o)}
                      />
                    ))}
                  </div>
                </div>
              );
            case "results":
              return (
                <div key={item.id} className="flex w-full flex-col gap-4">
                  <div className="flex w-full flex-col gap-2.5">
                    <Understood tags={item.understood} />
                    <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {item.cards.map((c) => (
                        <div key={c.id} onClickCapture={onPackageOpen} className="flex">
                          <HelpPackageCard
                            href={`/packages/${c.id}`}
                            name={c.name}
                            vendor={c.vendor}
                            price={c.price}
                            fits={c.fits}
                            imageUrl={c.imageUrl}
                          />
                        </div>
                      ))}
                    </div>
                    {item.seeAll && (
                      <Link
                        href={item.seeAll.href}
                        onClick={onPackageOpen}
                        className="self-start font-figtree text-[12px] font-semibold leading-[18px] text-[#030303] underline decoration-[8%] underline-offset-auto"
                      >
                        See all {item.seeAll.count} like this
                      </Link>
                    )}
                  </div>
                  {!item.closed && (
                    <Feedback onDone={() => onClose(item.id)} onChat={onChatWithEventManager} />
                  )}
                </div>
              );
            case "feedback":
              return item.closed ? null : item.action === "customise" ? (
                <Feedback
                  key={item.id}
                  secondary="Open customise editor"
                  onDone={() => {
                    onClose(item.id);
                    onOpenCustomise();
                  }}
                  onChat={onChatWithEventManager}
                />
              ) : (
                <Feedback key={item.id} onDone={() => onClose(item.id)} onChat={onChatWithEventManager} />
              );
            case "out-of-area":
              return item.state === "dismissed" ? null : (
                <div key={item.id} className="flex w-full flex-col gap-4">
                  {item.state === "open" && item.closest.length > 0 && (
                    <div className="flex w-full flex-col gap-2.5">
                      <p className="font-figtree text-[11px] font-normal uppercase leading-[16px] text-[#71717b]">
                        Closest areas we cover
                      </p>
                      <div className="flex w-full flex-wrap gap-1.5">
                        {item.closest.map((c) => (
                          <HelpChip
                            key={c.label}
                            label={c.label}
                            selected={false}
                            onClick={() => onPickArea(item.id, c)}
                          />
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
                  key={item.id}
                  onFindSimilar={() => onFindSimilar(item.id)}
                  onSendToEventManager={() => onSendPhoto(item.id)}
                  onWhatsApp={onWhatsApp}
                />
              );
            case "call-back-form":
              return item.state === "open" ? <div key={item.id}>{renderCallBackForm()}</div> : null;
            case "brief":
              return item.state === "open" ? <div key={item.id}>{renderBrief(item)}</div> : null;
            case "status":
              return (
                <HelpStatusCard
                  key={item.id}
                  state={item.state}
                  callBackWhen={item.callBackWhen}
                  onRequestCallBack={onRequestCallBack}
                  onWhatsApp={onWhatsApp}
                />
              );
          }
        })}
      </div>
    </div>
  );
}
