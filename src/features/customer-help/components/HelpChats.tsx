import HelpButton from "./HelpButton";

// "Your chats" tab. Conversations aren't stored yet, so this is the empty
// state from the v6 prototype until the chats list design lands.
export default function HelpChats({ onAskQuestion }: { onAskQuestion: () => void }) {
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
      <HelpButton variant="secondary" className="mt-2" onClick={onAskQuestion}>
        Ask a question
      </HelpButton>
    </div>
  );
}
