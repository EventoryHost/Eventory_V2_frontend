// Figma "Help / Person row" (node 2369:10078). Chat with an Event Manager
// is the main route; WhatsApp is the second card. Night copy after 9 PM.
type HelpPersonRowProps = {
  channel: "chat" | "whatsapp";
  isNight?: boolean;
  onClick: () => void;
};

const COPY = {
  chat: {
    title: "Chat with an Event Manager",
    day: "Chat, or ask them to call you · usually replies within 30 min",
    night: "Offline now · leave a message, or book a call for tomorrow",
  },
  whatsapp: {
    title: "WhatsApp us",
    day: "Send reference photos or ask anything",
    night: "Send photos or questions · replies from 9 AM",
  },
} as const;

export default function HelpPersonRow({
  channel,
  isNight = false,
  onClick,
}: HelpPersonRowProps) {
  const copy = COPY[channel];
  const isWhatsApp = channel === "whatsapp";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-[12px] border border-[#e4e4e7] bg-white p-3 text-left"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
          isWhatsApp ? "bg-[#f0fdf4]" : "bg-[#fdeef0]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            isWhatsApp
              ? "/images/customer/help/whatsapp.png"
              : "/images/customer/help/chat-round-line.svg"
          }
          alt=""
          width={20}
          height={20}
          className="block size-5 object-cover"
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 font-figtree font-normal">
        <span className="text-[14px] leading-[20px] text-[#030303]">
          {copy.title}
        </span>
        <span className="text-[12px] leading-[18px] text-[#71717b]">
          {isNight ? copy.night : copy.day}
        </span>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/customer/help/arrow-right.svg"
        alt=""
        width={20}
        height={20}
        className="block shrink-0"
      />
    </button>
  );
}
