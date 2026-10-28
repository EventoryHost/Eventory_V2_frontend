import type { ReactNode } from "react";

// v6f8 bubbles (values from Figma "Help floater · Pre-booking v6", v6.2):
// customer = brand pink, white text, time inside; assistant = flat grey,
// full width, time inside at the bottom right, with any chips or package
// cards inside the same bubble; Event Manager = brand/50, fits its text.
// System lines stay a centred pill with the time at the end.
type HelpMessageProps =
  | { from: "me"; text: string; time: string; photoUrl?: string }
  | { from: "assistant"; text: string; time?: string; children?: ReactNode }
  | { from: "event-manager"; text: string; time: string; senderName: string }
  | { from: "system"; text: string; time: string; tone?: "error" }
  | { from: "typing" };

const TEXT = "font-figtree text-[16px] font-normal leading-[24px]";
const TIME = "font-figtree text-[11px] font-normal leading-[16px]";

function Who({ tag, name }: { tag: string; name: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 whitespace-nowrap">
      <span className={`rounded-full bg-[#f4f4f5] px-1.5 text-[#3f3f47] ${TIME}`}>{tag}</span>
      <span className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717b]">{name}</span>
    </div>
  );
}

/** Time inside a grey / brand-50 bubble, bottom right. */
function InnerTime({ time }: { time?: string }) {
  if (!time) return null;
  return (
    <p className="mt-2 pr-1 text-right font-figtree text-[12px] font-normal leading-[18px] text-[#71717b]">{time}</p>
  );
}

export default function HelpMessage(props: HelpMessageProps) {
  if (props.from === "typing") {
    return (
      <div className="flex w-full flex-col items-start" aria-label="Typing">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/customer/help/typing.svg" alt="" width={58} height={34} className="block" />
      </div>
    );
  }

  if (props.from === "system") {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 rounded-full border border-[#e4e4e7] bg-[#fafafa] px-3 py-1 text-center">
          {/* The success tick only on lines that confirm something. */}
          {props.tone !== "error" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/customer/help/check-circle-success.svg"
              alt=""
              width={14}
              height={14}
              className="block shrink-0"
            />
          )}
          <p
            className={`font-figtree text-[12px] font-normal leading-[18px] ${
              props.tone === "error" ? "text-[#c81e0d]" : "text-[#71717b]"
            }`}
          >
            {props.text}
          </p>
          <p className={`${TIME} whitespace-nowrap text-[#9f9fa9]`}>· {props.time}</p>
        </div>
      </div>
    );
  }

  if (props.from === "me") {
    return (
      <div className="flex w-full flex-col items-end">
        <div className="flex max-w-[86%] flex-col items-start rounded-[16px] rounded-br-[4px] bg-[#f0596f] px-3.5 py-2.5 text-white">
          {props.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.photoUrl}
              alt="Your reference photo"
              className="mb-1.5 block max-h-[180px] max-w-[180px] rounded-[12px] object-cover"
            />
          )}
          <p className={`${TEXT} whitespace-pre-wrap break-words`}>
            {props.text}
            <span className={`${TIME} float-right ml-3 mt-1.5 -mb-1.5 whitespace-nowrap text-white`}>{props.time}</span>
          </p>
        </div>
      </div>
    );
  }

  if (props.from === "event-manager") {
    return (
      <div className="flex w-full flex-col items-start">
        <Who tag="Event Manager" name={props.senderName} />
        <div className="max-w-[86%] rounded-[16px] rounded-bl-[4px] bg-[#fdeef0] px-3.5 py-2.5">
          <p className={`${TEXT} whitespace-pre-wrap break-words text-[#030303]`}>{props.text}</p>
          <InnerTime time={props.time} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-stretch">
      <Who tag="AI" name="Eventory assistant" />
      <div className="flow-root rounded-[16px] rounded-bl-[4px] bg-[#f4f4f5] px-3.5 py-2.5">
        <p className={`${TEXT} whitespace-pre-wrap break-words text-[#030303]`}>{props.text}</p>
        {props.children}
        <InnerTime time={props.time} />
      </div>
    </div>
  );
}
