import HelpButton from "./HelpButton";
import HelpPhoneIcon from "./HelpPhoneIcon";

// Figma "Help / Status card" (node 2369:10159). One card per request:
// status + promise on top, one action underneath with WhatsApp as a quiet
// link. Late = 30 min with no reply; Night = after 9 PM.
export type HelpStatusCardState = "sent" | "late" | "night" | "call-back";

type HelpStatusCardProps = {
  state: HelpStatusCardState;
  /** "Call back" promise, e.g. "by 5:50 PM" or "this evening, 6–9 PM". */
  callBackWhen?: string;
  onRequestCallBack?: () => void;
  onWhatsApp?: () => void;
};

const COPY: Record<
  Exclude<HelpStatusCardState, "call-back">,
  { title: string; body: string; prompt: string; action: string }
> = {
  sent: {
    title: "Sent to the Event Manager team",
    body: "An Event Manager usually replies within 30 min. We’ll reply right here. If you close this, come back to Your chats on this device.",
    prompt: "Need it faster?",
    action: "Get a call back",
  },
  late: {
    title: "This is taking longer than usual",
    body: "Sorry for the wait. We’ve flagged your request to our team lead.",
    prompt: "A call is the quickest way to sort it now.",
    action: "Get a call back",
  },
  night: {
    title: "Saved. We’re offline until 9 AM",
    body: "Our Event Managers are back at 9 AM, and the first person in will reply by 9:30 AM.",
    prompt: "Rather talk it through?",
    action: "Call me after 9 AM",
  },
};

export default function HelpStatusCard({
  state,
  callBackWhen = "",
  onRequestCallBack,
  onWhatsApp,
}: HelpStatusCardProps) {
  const isLate = state === "late";
  const isCallBack = state === "call-back";
  const copy = isCallBack ? null : COPY[state];

  return (
    <div
      className={`flex w-full flex-col overflow-hidden rounded-[16px] border bg-white ${
        isLate ? "border-[#bb4d00]" : "border-[#e4e4e7]"
      }`}
    >
      <div
        className={`flex w-full items-start gap-2.5 px-4 py-3.5 ${
          isLate ? "bg-[#fffbeb]" : ""
        }`}
      >
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
            isLate ? "bg-white" : "bg-[#fffbeb]"
          }`}
        >
          {isCallBack ? (
            <HelpPhoneIcon tone="brand" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/customer/help/clock-circle.svg"
              alt=""
              width={18}
              height={18}
              className="block"
            />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1 font-figtree">
          <p
            className={`text-[14px] font-medium leading-[20px] ${
              isLate ? "text-[#bb4d00]" : "text-[#030303]"
            }`}
          >
            {copy?.title ?? "Call back requested"}
          </p>
          <p className="text-[12px] font-normal leading-[18px] text-[#3f3f47]">
            {copy?.body ??
              `We’ll call you ${callBackWhen}. You can keep chatting here in the meantime.`}
          </p>
        </div>
      </div>

      {copy && (
        <div className="flex w-full flex-col items-start gap-3 border-t border-[#e4e4e7] bg-[#fafafa] px-4 pb-4 pt-3.5">
          <p className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717b]">
            {copy.prompt}
          </p>
          <HelpButton
            variant={isLate ? "primary" : "secondary"}
            onClick={onRequestCallBack}
          >
            {copy.action}
          </HelpButton>
          <p className="flex items-center gap-1 whitespace-nowrap font-figtree text-[12px] font-normal leading-[18px]">
            <span className="text-[#71717b]">or</span>
            <button
              type="button"
              onClick={onWhatsApp}
              className="text-[#030303] underline decoration-[6%] underline-offset-auto"
            >
              message us on WhatsApp
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
