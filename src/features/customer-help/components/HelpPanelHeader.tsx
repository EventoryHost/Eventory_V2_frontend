import HelpIconButton from "./HelpIconButton";

// Figma "Help / Panel header" (node 2369:10024). Root shows the Home /
// Your chats tabs; thread + form headers name who you're talking to.
export type HelpPanelHeaderType =
  | "root"
  | "assistant"
  | "event-manager"
  | "form"
  | "whatsapp";

export type HelpPanelTab = "home" | "chats";

const COPY: Record<HelpPanelHeaderType, { title: string; subtitle: string }> =
  {
    root: { title: "Help", subtitle: "Ask our assistant or an Event Manager" },
    assistant: {
      title: "Eventory assistant",
      subtitle: "AI · answers from Eventory’s package data",
    },
    "event-manager": {
      title: "Event Manager",
      subtitle: "Usually replies within 30 min · 9 AM–9 PM",
    },
    whatsapp: {
      title: "WhatsApp the Eventory team",
      subtitle: "Replies 9 AM–9 PM",
    },
    form: {
      title: "Send to an Event Manager",
      subtitle: "Usually replies within 30 min",
    },
  };

const TABS: { id: HelpPanelTab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "chats", label: "Your chats" },
];

type HelpPanelHeaderProps = {
  type: HelpPanelHeaderType;
  onClose: () => void;
  onBack?: () => void;
  activeTab?: HelpPanelTab;
  onTabChange?: (tab: HelpPanelTab) => void;
  /** Overrides the default subtitle, e.g. night hours. */
  subtitle?: string;
};

export default function HelpPanelHeader({
  type,
  onClose,
  onBack,
  activeTab = "home",
  onTabChange,
  subtitle,
}: HelpPanelHeaderProps) {
  const isRoot = type === "root";
  const copy = COPY[type];

  return (
    <div className="flex w-full flex-col bg-white">
      <div className="flex w-full items-center gap-2.5 pb-3 pl-4 pr-3.5 pt-3.5">
        {!isRoot && (
          <>
            <HelpIconButton
              icon="/images/customer/help/arrow-left.svg"
              label="Back"
              onClick={onBack}
            />
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                type === "assistant" ? "bg-[#fdeef0]" : "bg-[#04222d]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  type === "assistant"
                    ? "/images/customer/help/stars.svg"
                    : "/images/customer/help/user-rounded.svg"
                }
                alt=""
                width={18}
                height={18}
                className="block"
              />
            </span>
          </>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-figtree">
          <p
            className={`font-medium text-[#030303] ${
              isRoot
                ? "text-[20px] leading-[28px]"
                : "text-[16px] leading-[24px]"
            }`}
          >
            {copy.title}
          </p>
          <p className="text-[12px] font-normal leading-[18px] text-[#71717b]">
            {subtitle ?? copy.subtitle}
          </p>
        </div>
        <HelpIconButton
          icon="/images/customer/help/close.svg"
          label="Close help"
          onClick={onClose}
        />
      </div>

      {isRoot && (
        <>
          <div role="tablist" className="flex w-full px-2">
            {TABS.map((tab) => {
              const selected = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`relative flex h-12 flex-col items-center justify-center px-4 pb-2 pt-2.5 font-figtree text-[14px] font-normal leading-[20px] ${
                    selected
                      ? "bg-[#fafafa] text-[#09090b]"
                      : "bg-transparent text-[#71717b]"
                  }`}
                >
                  {tab.label}
                  {selected && (
                    <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-[2px] bg-[#09090b]" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="h-px w-full bg-[#e4e4e7]" />
        </>
      )}
    </div>
  );
}
