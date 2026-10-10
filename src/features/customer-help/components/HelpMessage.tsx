// Figma "Help / Message" (node 2369:10107). Customer: time inside the
// bubble. Assistant / Event Manager: time on the name line. System: time
// at the end. EM bubble is brand/50, never green.
type HelpMessageProps =
  | { from: "me"; text: string; time: string; photoUrl?: string }
  | { from: "assistant"; text: string; time: string }
  | { from: "event-manager"; text: string; time: string; senderName: string }
  | { from: "system"; text: string; time: string; tone?: "error" }
  | { from: "typing" };

const TEXT = "font-figtree text-[14px] font-normal leading-[20px]";
const TIME = "font-figtree text-[11px] font-normal leading-[16px]";

export default function HelpMessage(props: HelpMessageProps) {
  if (props.from === "typing") {
    return (
      <div className="flex w-full flex-col items-start" aria-label="Typing">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/customer/help/typing.svg"
          alt=""
          width={58}
          height={34}
          className="block"
        />
      </div>
    );
  }

  if (props.from === "system") {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="flex items-center gap-1.5 rounded-full border border-[#e4e4e7] bg-[#fafafa] px-3 py-1">
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
          <p className={`${TIME} whitespace-nowrap text-[#9f9fa9]`}>
            · {props.time}
          </p>
        </div>
      </div>
    );
  }

  if (props.from === "me") {
    return (
      <div className="flex w-full flex-col items-end">
        <div
          className={`flex gap-2 rounded-[16px] rounded-br-[4px] bg-[#030303] px-3.5 py-2.5 text-[#fafafa] ${
            props.photoUrl ? "flex-col items-start" : "items-end"
          }`}
        >
          {props.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={props.photoUrl}
              alt="Reference photo"
              className="h-[140px] w-[180px] rounded-[12px] bg-[#f4f4f5] object-cover"
            />
          )}
          <p className={`${TEXT} max-w-[300px] whitespace-pre-wrap break-words`}>
            {props.text}
          </p>
          <p className={`${TIME} shrink-0 whitespace-nowrap opacity-72`}>
            {props.time}
          </p>
        </div>
      </div>
    );
  }

  const isEventManager = props.from === "event-manager";

  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span
          className={`rounded-full px-1.5 ${TIME} ${
            isEventManager
              ? "bg-[#f4f4f5] text-[#3f3f47]"
              : "bg-[#fdeef0] text-[#b4112a]"
          }`}
        >
          {isEventManager ? "Event Manager" : "AI"}
        </span>
        <span className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717b]">
          {isEventManager ? props.senderName : "Eventory assistant"}
        </span>
        <span className="font-figtree text-[12px] font-normal leading-[18px] text-[#9f9fa9]">
          · {props.time}
        </span>
      </div>
      <div
        className={`rounded-[16px] rounded-bl-[4px] px-3.5 py-2.5 ${
          isEventManager ? "bg-[#fdeef0]" : "bg-[#f4f4f5]"
        }`}
      >
        <p
          className={`${TEXT} max-w-[300px] whitespace-pre-wrap break-words text-[#030303]`}
        >
          {props.text}
        </p>
      </div>
    </div>
  );
}
