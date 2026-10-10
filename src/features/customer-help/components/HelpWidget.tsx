"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { useSelectedCity } from "@/features/customer-landing/hooks/useSelectedCity";
import { useHelpConversation, type BriefDefaults } from "../assistant/useHelpConversation";
import { OPEN_CUSTOMISE_EVENT, useHelpPageContext } from "../helpContext";
import { useIsAfterHours } from "../hooks/useIsAfterHours";
import HelpBriefCard, { type HelpBrief } from "./HelpBriefCard";
import HelpCallBackForm from "./HelpCallBackForm";
import HelpChats from "./HelpChats";
import HelpFloaterDock from "./HelpFloaterDock";
import HelpHome from "./HelpHome";
import HelpPanel from "./HelpPanel";
import HelpPanelHeader, { type HelpPanelTab } from "./HelpPanelHeader";
import HelpThread from "./HelpThread";
import HelpWhatsAppCard from "./HelpWhatsAppCard";
import { scrollWithinPanel } from "./scrollWithinPanel";

type View = "home" | "thread" | "whatsapp";

// The brief opens inside the thread (Figma 5.4) and scrolls itself into
// view; the panel leaves scrolling alone while it's open.
function InlineBrief({
  defaults,
  accountPhone,
  isAfterHours,
  isAreaServed,
  checkArea,
  onSubmit,
}: {
  defaults: BriefDefaults;
  accountPhone?: string;
  isAfterHours: boolean;
  isAreaServed: (area: string) => boolean | undefined;
  checkArea: (area: string) => Promise<unknown>;
  onSubmit: (brief: HelpBrief) => Promise<void>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const areaTimer = useRef<number | undefined>(undefined);

  // Check the pre-filled area now and typed edits after a pause, so the
  // "we don't cover … yet" note can show (Figma 9.6).
  useEffect(() => {
    if (defaults.locationArea) void checkArea(defaults.locationArea);
    return () => window.clearTimeout(areaTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ref.current) scrollWithinPanel(ref.current);
  }, []);

  return (
    <div ref={ref} className="flex w-full flex-col gap-3">
      <HelpBriefCard
        initial={defaults.initial}
        initialPhoto={defaults.photo}
        locationArea={defaults.locationArea}
        areaFromLocation={defaults.areaFromLocation}
        accountPhone={accountPhone}
        isAfterHours={isAfterHours}
        isAreaServed={isAreaServed}
        onAreaChange={(area) => {
          window.clearTimeout(areaTimer.current);
          areaTimer.current = window.setTimeout(() => void checkArea(area), 600);
        }}
        onSubmit={async (brief) => {
          if (sending) return;
          setSending(true);
          setError(null);
          try {
            await onSubmit(brief);
          } catch {
            setError("We couldn’t send that. Check your connection and try again.");
          } finally {
            setSending(false);
          }
        }}
      />
      {error && (
        <p role="alert" className="font-figtree text-[12px] font-normal leading-[18px] text-[#c81e0d]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function HelpWidget() {
  const [open, setOpen] = useState(false);
  // Kept here, not in the panel, so closing and reopening resumes the chat.
  const [view, setView] = useState<View>("home");
  const [tab, setTab] = useState<HelpPanelTab>("home");

  const pageContext = useHelpPageContext();
  const isAfterHours = useIsAfterHours();
  const { city } = useSelectedCity();
  const { session } = useCustomerSession();
  const accountPhone = session?.phone || undefined;
  const convo = useHelpConversation({ pageContext, accountPhone, locationCity: city });

  const close = useCallback(() => setOpen(false), []);

  // Figma 11.1: WhatsApp opens a card first (number, the message we'll
  // start, what happens next); Back returns to where they were.
  const [whatsAppFrom, setWhatsAppFrom] = useState<Exclude<View, "whatsapp">>("home");
  const openWhatsApp = () => {
    if (view !== "whatsapp") setWhatsAppFrom(view);
    setView("whatsapp");
  };
  const whatsAppLines = () => {
    const page = `${window.location.host}${window.location.pathname}`.replace(/\/$/, "");
    const lines = ["Hi Eventory, I have a question about planning an event.", `Page: ${page}`];
    if (pageContext) lines.push(`Package: ${pageContext.packageName}`);
    // Their own words, not the canned hand-off lines or the brief summary.
    const lastAsk = [...convo.items]
      .reverse()
      .find(
        (i) =>
          i.kind === "me" &&
          !i.photoUrl &&
          !i.text.startsWith("My brief:") &&
          !/^(I’d like to talk to an Event Manager|Send to an Event Manager|Find similar packages)$/.test(i.text),
      );
    if (lastAsk?.kind === "me") lines.push(`My question: ${lastAsk.text}`);
    if (convo.ticket) lines.push(`Ticket: ${convo.ticket}`);
    return lines;
  };

  const ask = (text: string) => {
    if (!text) return;
    setView("thread");
    void convo.ask(text);
  };
  const photo = (file: File) => {
    setView("thread");
    void convo.photo(file);
  };
  const openCustomise = () => {
    close();
    window.dispatchEvent(new Event(OPEN_CUSTOMISE_EVENT));
  };

  const briefOpen = view === "thread" && convo.hasOpenBrief;

  return (
    <>
      {!open && <HelpFloaterDock onOpen={() => setOpen(true)} />}
      <HelpPanel
        open={open}
        onClose={close}
        scrollKey={`${view}:${tab}:${convo.items.length}`}
        scrollMode={view !== "thread" ? "top" : briefOpen ? "none" : "bottom"}
        header={
          view === "home"
            ? {
                type: "root",
                tabs: <HelpPanelHeader type="root" onClose={close} activeTab={tab} onTabChange={setTab} />,
              }
            : view === "whatsapp"
              ? { type: "whatsapp", onBack: () => setView(whatsAppFrom) }
              : briefOpen
              ? {
                  type: "form",
                  onBack: convo.dismissBrief,
                  // Figma 10.1: offline is said up front, no 30-minute promise.
                  subtitle: isAfterHours ? "Offline now · replies from 9 AM" : undefined,
                }
              : {
                  // After the brief, the thread is the Event Manager chat (Figma 6.4).
                  type: convo.withEventManager ? "event-manager" : "assistant",
                  onBack: () => setView("home"),
                  // Figma 10.2.
                  subtitle: convo.withEventManager && isAfterHours ? "Offline now · back at 9 AM" : undefined,
                }
        }
        // One input at a time: no composer while the brief or the out-of-area form is open.
        composer={view === "thread" && !briefOpen && !convo.hasOpenAreaForm ? { onSend: ask, onPhoto: photo } : undefined}
      >
        {view === "whatsapp" && (
          <div className="flex w-full px-4 pb-6 pt-4">
            <HelpWhatsAppCard messageLines={whatsAppLines()} />
          </div>
        )}
        {view === "home" && tab === "home" && (
          <HelpHome
            pageContext={pageContext}
            isAfterHours={isAfterHours}
            onAsk={ask}
            onPhoto={photo}
            onWhatsApp={openWhatsApp}
          />
        )}
        {view === "home" && tab === "chats" && <HelpChats onAskQuestion={() => setTab("home")} />}
        {view === "thread" && (
          <HelpThread
            items={convo.items}
            onAnswerFollowUp={(id, field, option) => void convo.answerFollowUp(id, field, option)}
            onClose={convo.close}
            onChatWithEventManager={convo.openBrief}
            onWhatsApp={openWhatsApp}
            onPackageOpen={close}
            onOpenCustomise={openCustomise}
            renderBrief={(item) => (
              <InlineBrief
                defaults={item.defaults}
                accountPhone={accountPhone}
                isAfterHours={isAfterHours}
                isAreaServed={convo.isAreaServed}
                checkArea={convo.checkArea}
                onSubmit={convo.sendBrief}
              />
            )}
            onRequestCallBack={convo.callBack}
            onFindSimilar={(id) => void convo.findSimilar(id)}
            onSendPhoto={convo.sendPhotoToEventManager}
            accountPhone={accountPhone}
            onNotifyArea={(id, phone) => void convo.notifyArea(id, phone)}
            onPickArea={(id, choice) => void convo.pickClosestArea(id, choice)}
            renderCallBackForm={() => <HelpCallBackForm onSubmit={convo.confirmCallBack} />}
          />
        )}
      </HelpPanel>
    </>
  );
}
