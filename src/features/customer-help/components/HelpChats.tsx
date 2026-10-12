import type { HelpConversationSummary } from "@/lib/customerHelpApi";
import HelpButton from "./HelpButton";

// "Your chats" tab: saved help panel conversations, newest first. Rows
// follow the person-row card (Figma "Help / Person row"); the empty state
// is the v6 prototype's. Tapping a row resumes that chat.
type HelpChatsProps = {
  /** null while loading. */
  conversations: HelpConversationSummary[] | null;
  currentId: string | null;
  onOpen: (conversationId: string) => void;
  onNewChat: () => void;
};

/** "5:42 PM" today, else "12 Oct". */
function when(iso: string) {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function HelpChats({ conversations, currentId, onOpen, onNewChat }: HelpChatsProps) {
  if (conversations === null) {
    return (
      <div className="flex w-full flex-col gap-2 px-4 py-4" aria-busy="true">
        {[0, 1].map((i) => (
          <div key={i} className="h-[66px] w-full animate-pulse rounded-[12px] bg-[#f4f4f5]" />
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex w-full flex-col items-center gap-2 px-4 py-12 text-center font-figtree">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#fdeef0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/customer/help/chat-round-line.svg" alt="" width={20} height={20} className="block" />
        </span>
        <p className="text-[16px] font-medium leading-[24px] text-[#030303]">No chats yet</p>
        <p className="max-w-[300px] text-[14px] font-normal leading-[20px] text-[#71717b]">
          When you ask something, the conversation stays here so you can pick it up later.
        </p>
        <HelpButton variant="secondary" className="mt-2" onClick={onNewChat}>
          Ask a question
        </HelpButton>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 px-4 py-4 font-figtree">
      {conversations.map((c) => (
        <button
          key={c.conversationId}
          type="button"
          onClick={() => onOpen(c.conversationId)}
          className="flex w-full items-center gap-3 rounded-[12px] border border-[#e4e4e7] bg-white p-3 text-left"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fdeef0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/customer/help/chat-round-line.svg" alt="" width={20} height={20} className="block" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 font-normal">
            <span className="flex items-baseline gap-2">
              <span className="min-w-0 flex-1 truncate text-[14px] leading-[20px] text-[#030303]">
                {c.title ?? "Chat"}
              </span>
              <span className="shrink-0 text-[12px] leading-[18px] text-[#71717b]">{when(c.lastMessageAt)}</span>
            </span>
            <span className="truncate text-[12px] leading-[18px] text-[#71717b]">
              {[c.conversationId === currentId ? "Open now" : null, c.ticket, c.preview].filter(Boolean).join(" · ")}
            </span>
          </span>
        </button>
      ))}
      <HelpButton variant="secondary" className="mt-2 self-center" onClick={onNewChat}>
        Start a new chat
      </HelpButton>
    </div>
  );
}
