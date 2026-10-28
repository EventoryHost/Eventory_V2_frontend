import type { HelpConversationSummary } from "@/lib/customerHelpApi";
import HelpButton from "./HelpButton";

// v6f9 "Your chats": Open / Resolved, newest first. Open = a ticket the team
// hasn't resolved; assistant-only chats and resolved tickets are Resolved.
// Each card: title + status, last line, then "New reply" (an Event Manager
// wrote since you last looked), the ticket ref and when. Home shows the
// two latest open ones with the same card.
export type ChatsFilter = "open" | "resolved";

type HelpChatsProps = {
  /** null while loading. */
  conversations: HelpConversationSummary[] | null;
  filter: ChatsFilter;
  onFilter: (filter: ChatsFilter) => void;
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

export const chatStatus = (c: HelpConversationSummary): ChatsFilter =>
  c.status ?? (c.ticket ? "open" : "resolved");

export function HelpTicketCard({ chat, onOpen }: { chat: HelpConversationSummary; onOpen: () => void }) {
  const open = chatStatus(chat) === "open";
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-1 rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-3 text-left font-figtree transition-colors hover:border-[#9f9fa9]"
    >
      <span className="flex items-start justify-between gap-2.5">
        <span
          className={`min-w-0 text-[14px] leading-[20px] text-[#030303] ${chat.unread ? "font-semibold" : "font-medium"}`}
        >
          {chat.title ?? "Chat"}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 text-[12px] leading-[18px] ${
            open ? "bg-[#fffbeb] text-[#bb4d00]" : "bg-[#f0fdf4] text-[#008236]"
          }`}
        >
          {open ? "Open" : "Resolved"}
        </span>
      </span>
      {chat.preview && <span className="truncate text-[14px] font-normal leading-[20px] text-[#71717b]">{chat.preview}</span>}
      <span className="flex items-center gap-2 text-[12px] font-normal leading-[18px] text-[#9f9fa9]">
        {chat.unread && (
          <>
            <span className="size-2 shrink-0 rounded-full bg-[#f0596f]" />
            <span className="text-[#b4112a]">New reply</span>·
          </>
        )}
        {chat.ticket && <span className="tabular-nums">{chat.ticket} ·</span>}
        <span>{when(chat.lastMessageAt)}</span>
      </span>
    </button>
  );
}

export default function HelpChats({ conversations, filter, onFilter, onOpen, onNewChat }: HelpChatsProps) {
  if (conversations === null) {
    return (
      <div className="flex w-full flex-col gap-2 px-4 py-4" aria-busy="true">
        {[0, 1].map((i) => (
          <div key={i} className="h-[76px] w-full animate-pulse rounded-[12px] bg-[#f4f4f5]" />
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex w-full flex-col items-center gap-2 px-4 py-12 text-center font-figtree">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#f4f4f5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/customer/help/chat-round-line.svg" alt="" width={20} height={20} className="block" />
        </span>
        <p className="text-[16px] font-semibold leading-[24px] text-[#030303]">No chats yet</p>
        <p className="max-w-[300px] text-[14px] font-normal leading-[20px] text-[#71717b]">
          When you ask us something, the conversation stays here so you can pick it up later.
        </p>
        <HelpButton variant="secondary" className="mt-2" onClick={onNewChat}>
          Ask a question
        </HelpButton>
      </div>
    );
  }

  const shown = conversations.filter((c) => chatStatus(c) === filter);
  return (
    <div className="flex w-full flex-col gap-4 px-4 py-4 font-figtree">
      <div role="group" aria-label="Filter chats" className="inline-flex self-start rounded-full bg-[#f4f4f5] p-[3px]">
        {(["open", "resolved"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => onFilter(f)}
            className={`rounded-full px-4 py-[5px] text-[14px] leading-[20px] ${
              filter === f ? "bg-white text-[#030303] shadow-[0_1px_3px_rgba(3,3,3,0.08)]" : "text-[#71717b]"
            }`}
          >
            {f === "open" ? "Open" : "Resolved"}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {shown.length ? (
          shown.map((c) => <HelpTicketCard key={c.conversationId} chat={c} onOpen={() => onOpen(c.conversationId)} />)
        ) : (
          <p className="py-12 text-center text-[14px] font-normal leading-[20px] text-[#71717b]">Nothing here.</p>
        )}
      </div>
      <HelpButton variant="secondary" className="self-center" onClick={onNewChat}>
        Start a new chat
      </HelpButton>
    </div>
  );
}
