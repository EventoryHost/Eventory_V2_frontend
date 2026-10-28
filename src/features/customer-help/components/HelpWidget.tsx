"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { useSelectedCity } from "@/features/customer-landing/hooks/useSelectedCity";
import { listHelpConversations, type HelpConversationSummary } from "@/lib/customerHelpApi";
import { addDayRequest, cancelBooking, downloadBookingInvoice, type RawBookingRefund } from "@/lib/customerBookingApi";
import { noteVendorContact } from "@/lib/customerHelpApi";
import { isEventDay } from "../assistant/eventDay";
import EventDayHome from "./booking/EventDayHome";
import ReportFlow, { REPORT_STEPS, type ReportState } from "./booking/ReportFlow";
import ReportStatus from "./booking/ReportStatus";
import {
  answerBookingQuestion,
  bookingTopicReply,
  emFirst,
  emLabel,
  type BookingRequestKind,
} from "../assistant/bookingAnswers";
import { useBookingHelpData, type BookingHelpData } from "../hooks/useBookingHelpData";
import BookingCancel, { type CancelStep } from "./booking/BookingCancel";
import BookingChange, { CHANGE_TITLE } from "./booking/BookingChange";
import BookingCustomisation from "./booking/BookingCustomisation";
import BookingDoor, { type BookingChangeKind } from "./booking/BookingDoor";
import BookingHome, { type BookingDoorKey } from "./booking/BookingHome";
import BookingRequestCard from "./booking/BookingRequestCard";
import {
  budgetBucket,
  guestBucket,
  requirementsSummary,
  useHelpConversation,
  type BriefDefaults,
} from "../assistant/useHelpConversation";
import {
  BOOKING_CHANGED_EVENT,
  OPEN_BOOKING_PACKAGE_EVENT,
  OPEN_BOOKING_PAYMENTS_EVENT,
  OPEN_BOOKING_PROPOSAL_EVENT,
  OPEN_CUSTOMISE_EVENT,
  OPEN_HELP_EVENT,
  useHelpPageContext,
} from "../helpContext";
import { useIsAfterHours } from "../hooks/useIsAfterHours";
import HelpBriefCard, {
  OCCASIONS,
  VENDOR_TYPES,
  type AttachedRequirements,
  type HelpBrief,
} from "./HelpBriefCard";
import HelpCallBackScreen from "./HelpCallBackScreen";
import HelpChats, { chatStatus, type ChatsFilter } from "./HelpChats";
import HelpFloaterDock from "./HelpFloaterDock";
import HelpHome from "./HelpHome";
import HelpPanel from "./HelpPanel";
import HelpPanelHeader, { type HelpPanelTab } from "./HelpPanelHeader";
import HelpRequirementsCard from "./HelpRequirementsCard";
import HelpThread from "./HelpThread";
import HelpWhatsAppCard from "./HelpWhatsAppCard";
import { scrollWithinPanel } from "./scrollWithinPanel";

// Booking pages add the door, change, cancel and customisation screens.
type View = "home" | "thread" | "whatsapp" | "callback" | "door" | "change" | "cancel" | "cust" | "report";

const NO_BOOKING_DATA: BookingHelpData = { packages: [], emName: null, remaining: 0, nextDueDate: null };
const DOOR: Record<BookingDoorKey, { title: string; sub: string; icon: string }> = {
  mybooking: { title: "My booking", sub: "Customisation, guests, date, venue", icon: "/images/customer/help/calendar.svg" },
  pay: { title: "Payments and invoices", sub: "Dues, payment modes, invoices", icon: "/images/customer/help/wallet.svg" },
  vendor: { title: "A vendor or package question", sub: "What’s included, timings, asking a vendor", icon: "/images/customer/help/box.svg" },
  other: { title: "Other help", sub: "Payments and last-minute changes", icon: "/images/customer/help/info.svg" },
};

// The brief's values from what the requirements card holds: typed
// amounts ("40 guests", "₹50,000") land in the brief's range chips.
const pick = <T extends readonly string[]>(options: T, label?: string) =>
  label && (options as readonly string[]).includes(label) ? label : "";

// The brief opens inside the thread (Figma 5.4) and scrolls itself into
// view; the panel leaves scrolling alone while it's open.
function InlineBrief({
  defaults,
  attached,
  onEditRequirements,
  locationTag,
  accountPhone,
  signedIn,
  isAfterHours,
  isAreaServed,
  checkArea,
  onSubmit,
}: {
  defaults: BriefDefaults;
  attached: AttachedRequirements | null;
  onEditRequirements: () => void;
  locationTag: { label: string; served: boolean | undefined } | null;
  accountPhone?: string;
  signedIn: boolean;
  isAfterHours: boolean;
  isAreaServed: (area: string) => boolean | undefined;
  checkArea: (area: string) => Promise<unknown>;
  onSubmit: (brief: HelpBrief) => Promise<void>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Check the pre-filled area now, so the "we don't cover … yet" note can
  // show (Figma 9.6).
  useEffect(() => {
    if (defaults.initialArea) void checkArea(defaults.initialArea);
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
        attached={attached}
        onEditRequirements={onEditRequirements}
        initialPhoto={defaults.photo}
        initialArea={defaults.initialArea}
        locationTag={locationTag}
        accountPhone={accountPhone}
        signedIn={signedIn}
        isAfterHours={isAfterHours}
        isAreaServed={isAreaServed}
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
  const { session, isLoggedIn } = useCustomerSession();
  const accountPhone = session?.phone || undefined;

  // Booking page (v6f9 "Help with your booking"): each package's numbers,
  // loaded while the panel is open, and the booking assistant.
  const bookingCtx = pageContext?.kind === "booking" ? pageContext : null;
  // v6f9 event day: the booking page on the day of the event.
  const eventDay = isEventDay(bookingCtx);
  const { data: bookingData, error: bookingError, reload: reloadBooking } = useBookingHelpData(bookingCtx, open);
  const booking = useMemo(() => {
    if (!bookingCtx) return null;
    const data = bookingData ?? NO_BOOKING_DATA;
    return {
      refs: bookingCtx.packages.map((p) => p.reference),
      emName: data.emName,
      answer: (text: string) => answerBookingQuestion(text, bookingCtx, data),
      topic: (kind: BookingRequestKind | "arrive" | "included" | "pay-issue") => bookingTopicReply(kind, bookingCtx, data),
    };
  }, [bookingCtx, bookingData]);

  const convo = useHelpConversation({
    pageContext: pageContext?.kind === "package" ? pageContext : null,
    accountName: session?.name || undefined,
    locationCity: city,
    viewing: open && view === "thread",
    booking,
  });

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const openPanel = () => setOpen(true);
    window.addEventListener(OPEN_HELP_EVENT, openPanel);
    return () => window.removeEventListener(OPEN_HELP_EVENT, openPanel);
  }, []);

  // Your chats: loaded on mount (the floater's unread dot), whenever the
  // panel opens or closes (Home's Recent chats, the tab badge) and each
  // time the tab is shown.
  const [chats, setChats] = useState<HelpConversationSummary[] | null>(null);
  const [chatsFilter, setChatsFilter] = useState<ChatsFilter>("open");
  const showingChats = open && view === "home" && tab === "chats";
  useEffect(() => {
    let stale = false;
    listHelpConversations().then(
      (rows) => !stale && setChats(rows),
      () => !stale && setChats((c) => c ?? []),
    );
    return () => {
      stale = true;
    };
  }, [open, showingChats]);
  const openChats = (chats ?? []).filter((c) => chatStatus(c) === "open");
  // The floater only shows while the panel is closed, so any unread reply counts.
  const unread = (chats ?? []).some((c) => c.unread);

  const openChat = async (id: string) => {
    if (id !== convo.conversationId) {
      try {
        await convo.openConversation(id);
      } catch {
        return;
      }
    }
    setView("thread");
  };
  const newChat = () => {
    convo.startNewConversation();
    setTab("home");
  };

  // Figma 11.1: WhatsApp opens a card first (number, the message we'll
  // start, what happens next); Back returns to where they were.
  const [whatsAppFrom, setWhatsAppFrom] = useState<Exclude<View, "whatsapp" | "callback">>("home");
  const openWhatsApp = () => {
    if (view === "home" || view === "thread") setWhatsAppFrom(view);
    setView("whatsapp");
  };

  // ---- Event day: problem reports ----
  const [report, setReport] = useState<ReportState>({ step: "pkg" });
  const openReports = (chats ?? []).filter((c) => chatStatus(c) === "open" && c.ticket?.startsWith("GRV-"));

  // ---- Booking screens ----
  const [door, setDoor] = useState<BookingDoorKey>("mybooking");
  const [doorStep, setDoorStep] = useState<"pick" | "options">("pick");
  const [picked, setPicked] = useState<string[]>([]);
  const [changeKind, setChangeKind] = useState<BookingChangeKind>("guests");
  const [cancelStep, setCancelStep] = useState<CancelStep>("pick");
  const [cancelPicked, setCancelPicked] = useState<string[]>([]);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [cancelOther, setCancelOther] = useState("");
  const [cancelDone, setCancelDone] = useState<{ refs: string[]; refunds: Record<string, RawBookingRefund | null> } | null>(null);
  // Where a booking thread was opened from, for Back.
  const [threadFrom, setThreadFrom] = useState<View>("home");
  const activeRefs = (bookingData?.packages ?? []).filter((p) => !p.cancelled).map((p) => p.reference);
  const em = emLabel(bookingData?.emName ?? null);

  const openDoor = (d: BookingDoorKey) => {
    setDoor(d);
    // One package: no need to pick it.
    setPicked(activeRefs.length === 1 ? activeRefs : []);
    setDoorStep(d !== "pay" && d !== "other" && activeRefs.length === 1 ? "options" : "pick");
    setView("door");
  };
  const bookingTopic = (question: string, kind: BookingRequestKind | "arrive" | "included" | "pay-issue") => {
    setThreadFrom(view);
    setView("thread");
    void convo.startBookingTopic(question, kind);
  };
  const openChange = (kind: BookingChangeKind) => {
    if (!picked.length) setPicked(activeRefs);
    setChangeKind(kind);
    setView("change");
  };
  const startCancel = () => {
    const cancellable = (bookingData?.packages ?? []).filter((p) => p.cancellable).map((p) => p.reference);
    setCancelPicked(cancellable.length === 1 ? cancellable : []);
    setCancelReason(null);
    setCancelOther("");
    setCancelDone(null);
    setCancelStep("pick");
    setView("cancel");
  };
  const confirmCancel = async () => {
    const reason = cancelReason === "Other" ? cancelOther.trim() || "Other" : (cancelReason ?? undefined);
    const refunds: Record<string, RawBookingRefund | null> = {};
    for (const ref of cancelPicked) {
      const res = await cancelBooking(ref, reason);
      refunds[ref] = res.refund;
    }
    setCancelDone({ refs: [...cancelPicked], refunds });
    setCancelStep("done");
    reloadBooking();
    window.dispatchEvent(new Event(BOOKING_CHANGED_EVENT));
  };
  /** Back to the booking page's own panels (customise, proposal, pay). */
  const toBookingPage = (event: string, reference?: string) => {
    close();
    window.dispatchEvent(new CustomEvent(event, { detail: reference }));
  };
  const downloadInvoice = async (reference: string) => {
    try {
      const blob = await downloadBookingInvoice(reference);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Eventory-invoice-${reference}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // The row stays; the booking page has the same download.
    }
  };

  const ask = (text: string) => {
    if (!text) return;
    if (view !== "thread") setThreadFrom(view);
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

  // The location tag, for the area chips: its label once checked, and
  // whether we serve it (undefined until known).
  const tagCheck = city ? convo.isAreaServed(city) : undefined;
  useEffect(() => {
    if (city) void convo.checkArea(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);
  const locationTag = city ? { label: city, served: tagCheck } : null;

  const req = convo.confirmedRequirements;
  const attached: AttachedRequirements | null = req
    ? {
        summary: requirementsSummary(req),
        occasion: pick(OCCASIONS, req.occasion?.label) || (req.occasion ? "Other" : ""),
        guests: req.guests ? guestBucket(req.guests.count) : "",
        budget: req.budget ? budgetBucket(req.budget.max) : "",
        vendorType: pick(VENDOR_TYPES, req.service?.label),
        area: req.area?.label ?? "",
        date: req.date ?? "",
      }
    : null;

  const request = convo.request;
  const briefOpen = view === "thread" && convo.hasOpenBrief;

  // Built only when shown: the message reads the page's URL.
  const whatsAppCard = () => (
    <HelpWhatsAppCard
      messageLines={convo.whatsAppLines()}
      ticket={request?.ticket}
      opened={Boolean(request?.whatsappAt)}
      isAfterHours={isAfterHours}
      onOpen={() => void convo.openWhatsApp()}
    />
  );

  const threadHeader = () => {
    if (briefOpen)
      return {
        type: "form" as const,
        onBack: convo.dismissBrief,
        // Figma 10.1: offline is said up front, no 30-minute promise.
        subtitle: isAfterHours ? "Offline now · replies from 9 AM" : undefined,
      };
    const back = () => setView(bookingCtx ? threadFrom : "home");
    // Booking page: the booking's Event Manager, by name once assigned.
    if (bookingCtx && (convo.withEventManager || !convo.items.some((i) => i.kind === "assistant"))) {
      const name = convo.eventManagerName ?? bookingData?.emName ?? null;
      return {
        type: "event-manager" as const,
        onBack: back,
        title: name ?? "Event Manager team",
        subtitle: isAfterHours
          ? "Offline now · back at 9 AM"
          : name
            ? "Your Event Manager · usually replies within 30 min"
            : undefined,
      };
    }
    if (convo.withEventManager) {
      const name = convo.eventManagerName;
      return {
        type: "event-manager" as const,
        onBack: back,
        // After a reply the header names who's helping (v6f9).
        title: name,
        subtitle: isAfterHours ? "Offline now · back at 9 AM" : name ? "Event Manager team" : undefined,
      };
    }
    return { type: "assistant" as const, onBack: back };
  };

  const chosenPackages = (bookingData?.packages ?? []).filter((p) => picked.includes(p.reference));
  const eventDateLabel = bookingCtx
    ? new Date(bookingCtx.eventDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
    : "";
  /** Booking screens' headers (mock header(): door / chg / cx / cust). */
  const bookingHeader = () => {
    if (view === "door") {
      const d = DOOR[door];
      const picking = door !== "pay" && door !== "other" && doorStep === "pick";
      return {
        type: "topic" as const,
        icon: d.icon,
        title: d.title,
        subtitle:
          door === "pay" || door === "other"
            ? d.sub
            : picking
              ? "Step 1 of 2 · choose the package"
              : `Step 2 of 2 · ${chosenPackages.map((p) => p.vendorName ?? p.name).join(", ")}`,
        onBack: () =>
          door !== "pay" && door !== "other" && doorStep === "options" && activeRefs.length > 1 ? setDoorStep("pick") : setView("home"),
      };
    }
    if (view === "report") {
      const i = REPORT_STEPS.indexOf(report.step);
      return {
        type: "topic" as const,
        icon: "/images/customer/help/chat-round-line.svg",
        title: "Tell us what’s happening",
        subtitle: `Step ${i + 1} of 3 · ${bookingCtx?.eventTitle ?? ""}`,
        onBack: () => (i > 0 ? setReport({ ...report, step: REPORT_STEPS[i - 1] }) : setView("home")),
      };
    }
    if (view === "change")
      return {
        type: "topic" as const,
        icon: "/images/customer/help/calendar.svg",
        title: CHANGE_TITLE[changeKind],
        subtitle: chosenPackages.map((p) => p.vendorName ?? p.name).join(", ") || bookingCtx?.eventTitle,
        onBack: () => setView("door"),
      };
    if (view === "cancel")
      return {
        type: "topic" as const,
        icon: "/images/customer/help/calendar.svg",
        title: cancelStep === "done" ? "Cancellation done" : "Cancel package(s)",
        subtitle:
          cancelStep === "pick"
            ? "Step 1 of 2 · choose packages"
            : cancelStep === "review"
              ? "Step 2 of 2 · review and confirm"
              : `Cancelled today · ${bookingCtx?.eventTitle ?? ""}`,
        onBack: () => (cancelStep === "review" ? setCancelStep("pick") : cancelStep === "done" ? setView("home") : setView("door")),
      };
    return {
      type: "topic" as const,
      icon: "/images/customer/help/box.svg",
      title: "Customisation status",
      subtitle: `${bookingCtx?.eventTitle ?? ""} · ${eventDateLabel}`,
      onBack: () => setView("door"),
    };
  };

  return (
    <>
      {!open && (
        <HelpFloaterDock unread={unread} label={eventDay ? "Help for today" : undefined} onOpen={() => setOpen(true)} />
      )}
      <HelpPanel
        open={open}
        onClose={close}
        scrollKey={`${view}:${tab}:${convo.items.length}`}
        scrollMode={view !== "thread" ? "top" : briefOpen ? "none" : "bottom"}
        header={
          view === "home"
            ? {
                type: "root",
                tabs: (
                  <HelpPanelHeader
                    type="root"
                    onClose={close}
                    activeTab={tab}
                    onTabChange={setTab}
                    chatsBadge={openChats.length}
                    title={eventDay ? "Help for today" : bookingCtx ? "Help with your booking" : undefined}
                    subtitle={
                      eventDay
                        ? `${bookingCtx?.eventTitle} · today${bookingCtx?.startTime ? ` ${bookingCtx.startTime}` : ""}`
                        : bookingCtx
                          ? `${bookingCtx.eventTitle} · ${eventDateLabel}`
                          : undefined
                    }
                  />
                ),
              }
            : view === "whatsapp"
              ? { type: "whatsapp", onBack: () => setView(whatsAppFrom) }
              : view === "callback"
                ? {
                    type: "callback",
                    onBack: () => setView(convo.request ? "thread" : "home"),
                    subtitle: isAfterHours ? "We’re offline now · calls from 9 AM" : undefined,
                  }
                : view === "thread"
                  ? threadHeader()
                  : bookingHeader()
        }
        // One input at a time: no composer while the brief or the out-of-area form is open.
        composer={
          view === "thread" && !briefOpen && !convo.hasOpenAreaForm && !convo.hasOpenBookingCard
            ? { onSend: ask, onPhoto: photo }
            : undefined
        }
      >
        {view === "whatsapp" && <div className="flex w-full px-4 pb-6 pt-4">{whatsAppCard()}</div>}
        {view === "callback" && (
          <HelpCallBackScreen
            accountPhone={accountPhone}
            signedIn={isLoggedIn}
            isAfterHours={isAfterHours}
            defaultNote={convo.request ? convo.threadTitle : undefined}
            // Booking home, no chat yet: the call back makes its own ticket.
            onSubmit={bookingCtx && !convo.request ? convo.bookingCallBack : convo.requestCallBack}
            onDone={() => setView("thread")}
          />
        )}
        {view === "home" && tab === "home" && bookingCtx && eventDay && (
          <EventDayHome
            ctx={bookingCtx}
            data={bookingData}
            openReports={openReports}
            onReport={() => {
              setReport({ step: "pkg" });
              setView("report");
            }}
            onOpenReport={(id) => void openChat(id)}
            onMessageEventManager={() => {
              setThreadFrom("home");
              convo.startEventManagerChat();
              setView("thread");
            }}
            onVendorContact={(ref) => noteVendorContact(ref)}
            onOtherHelp={() => openDoor("other")}
          />
        )}
        {view === "report" && bookingCtx && bookingData && (
          <ReportFlow
            ctx={bookingCtx}
            data={bookingData}
            state={report}
            onChange={setReport}
            onSend={async (input) => {
              await convo.sendBookingRequest(input, undefined, { fresh: true });
              setThreadFrom("home");
              setView("thread");
            }}
          />
        )}
        {view === "home" && tab === "home" && bookingCtx && !eventDay && (
          <BookingHome
            ctx={bookingCtx}
            data={bookingData}
            loadError={bookingError}
            isAfterHours={isAfterHours}
            recentChats={openChats}
            onMessageEventManager={() => {
              setThreadFrom("home");
              convo.startEventManagerChat();
              setView("thread");
            }}
            onCallBack={() => setView("callback")}
            onWhatsApp={openWhatsApp}
            onAsk={ask}
            onDoor={openDoor}
            onOpenChat={(id) => void openChat(id)}
            onSeeAllChats={() => setTab("chats")}
          />
        )}
        {view === "door" && bookingCtx && bookingData && (
          <BookingDoor
            door={door}
            step={doorStep}
            ctx={bookingCtx}
            data={bookingData}
            selected={picked}
            onToggle={(ref) => setPicked((p) => (p.includes(ref) ? p.filter((x) => x !== ref) : [...p, ref]))}
            onContinue={() => setDoorStep("options")}
            onChangePick={() => setDoorStep("pick")}
            onCustomise={(ref) => toBookingPage(OPEN_BOOKING_PACKAGE_EVENT, ref)}
            onChange={openChange}
            onCustomisationStatus={() => setView("cust")}
            onCancel={startCancel}
            onTopic={bookingTopic}
            onPayments={() => toBookingPage(OPEN_BOOKING_PAYMENTS_EVENT)}
            onDownloadInvoice={(p) => void downloadInvoice(p.reference)}
          />
        )}
        {view === "door" && bookingCtx && !bookingData && (
          <p className="px-4 py-6 font-figtree text-[14px] text-[#71717b]">
            {bookingError ? "We couldn’t load your booking’s details. Try again in a moment." : "Loading your booking…"}
          </p>
        )}
        {view === "change" && bookingData && (
          <BookingChange
            kind={changeKind}
            packages={chosenPackages.length ? chosenPackages : bookingData.packages.filter((p) => !p.cancelled)}
            emName={bookingData.emName}
            guestsLabel={bookingCtx?.guestsLabel}
            onSend={async (input) => {
              await convo.sendBookingRequest(input, undefined, { fresh: true });
              setThreadFrom("door");
              setView("thread");
            }}
          />
        )}
        {view === "cancel" && bookingData && (
          <BookingCancel
            step={cancelStep}
            packages={bookingData.packages}
            selected={cancelPicked}
            onToggle={(ref) => setCancelPicked((p) => (p.includes(ref) ? p.filter((x) => x !== ref) : [...p, ref]))}
            onToggleAll={() => {
              const all = bookingData.packages.filter((p) => p.cancellable).map((p) => p.reference);
              setCancelPicked((p) => (all.every((r) => p.includes(r)) ? [] : all));
            }}
            reason={cancelReason}
            otherReason={cancelOther}
            onReason={setCancelReason}
            onOtherReason={setCancelOther}
            onReview={() => setCancelStep("review")}
            onEditPick={() => setCancelStep("pick")}
            onKeep={() => setView("door")}
            onConfirm={confirmCancel}
            done={cancelDone}
            emName={bookingData.emName}
            eventDateLabel={eventDateLabel}
            onReplacement={(text) => {
              setThreadFrom("home");
              setView("thread");
              void convo.sendBookingRequest({ topic: "Replacement vendor", text }, undefined, { fresh: true });
            }}
            onHome={() => setView("home")}
          />
        )}
        {view === "cust" && bookingCtx && bookingData && (
          <BookingCustomisation
            packages={bookingData.packages}
            awaitingReview={bookingCtx.proposalsAwaitingReview}
            onReview={(ref) => toBookingPage(OPEN_BOOKING_PROPOSAL_EVENT, ref)}
          />
        )}
        {view === "home" && tab === "home" && !bookingCtx && (
          <HelpHome
            pageContext={pageContext}
            isAfterHours={isAfterHours}
            onAsk={ask}
            onPhoto={photo}
            onWhatsApp={openWhatsApp}
            recentChats={openChats}
            onOpenChat={(id) => void openChat(id)}
            onSeeAllChats={() => setTab("chats")}
          />
        )}
        {view === "home" && tab === "chats" && (
          <HelpChats
            conversations={chats}
            filter={chatsFilter}
            onFilter={setChatsFilter}
            onOpen={(id) => void openChat(id)}
            onNewChat={newChat}
          />
        )}
        {view === "thread" && (
          <HelpThread
            items={convo.items}
            summary={
              request
                ? {
                    title: convo.threadTitle ?? "Your request",
                    ticket: request.ticket,
                    raisedAt: request.createdAt,
                    resolved: request.resolved,
                  }
                : undefined
            }
            onAnswerFollowUp={(id, field, option) => void convo.answerFollowUp(id, field, option)}
            onClose={convo.close}
            onChatWithEventManager={convo.openBrief}
            onWhatsApp={convo.showWhatsApp}
            onPackageOpen={close}
            onOpenCustomise={openCustomise}
            renderBrief={(item) => (
              <InlineBrief
                defaults={item.defaults}
                attached={attached}
                onEditRequirements={() => convo.editRequirements()}
                locationTag={locationTag}
                accountPhone={accountPhone}
                signedIn={isLoggedIn}
                isAfterHours={isAfterHours}
                isAreaServed={convo.isAreaServed}
                checkArea={convo.checkArea}
                onSubmit={convo.sendBrief}
              />
            )}
            renderRequirements={(item) => (
              <HelpRequirementsCard
                item={item}
                locationTag={locationTag && tagCheck ? { label: locationTag.label } : null}
                onConfirm={() => void convo.confirmRequirements()}
                onEdit={convo.editRequirements}
                onSet={convo.setRequirement}
                onSave={() => void convo.saveRequirements()}
                onCancel={convo.cancelRequirementsEdit}
              />
            )}
            renderWhatsApp={whatsAppCard}
            onRequestCallBack={() => setView("callback")}
            onFindSimilar={(id) => void convo.findSimilar(id)}
            onSendPhoto={convo.sendPhotoToEventManager}
            accountPhone={accountPhone}
            onNotifyArea={(id, phone) => void convo.notifyArea(id, phone)}
            onPickArea={(id, choice) => void convo.pickClosestArea(id, choice)}
            renderBookingRequest={(item) => (
              <BookingRequestCard
                request={item.request}
                quote={item.quote}
                emName={bookingData?.emName ?? null}
                eventLine={bookingCtx ? `${bookingCtx.eventTitle} · ${bookingCtx.reference}` : ""}
                packages={(bookingData?.packages ?? []).filter((p) => !p.cancelled).map((p) => p.name)}
                packageChoices={(bookingData?.packages ?? [])
                  .filter((p) => !p.cancelled)
                  .map((p) => ({ reference: p.reference, name: p.name }))}
                onSend={async ({ packageRef, ...input }) => {
                  // Event-day changes go to the vendor's app too (day request).
                  let dayLine: string | null = null;
                  if (packageRef) {
                    dayLine = await addDayRequest(packageRef, input.text).then(
                      () => `Sent to the vendor as a day request (${packageRef})`,
                      (e: unknown) => `Day request to the vendor failed (${packageRef}): ${e instanceof Error ? e.message : "error"}`,
                    );
                  }
                  await convo.sendBookingCard(item.id, {
                    ...input,
                    details: [...(input.details ?? []), ...(dayLine ? [dayLine] : [])],
                  });
                }}
              />
            )}
            onBookingAction={(id, action) => {
              if (action === "cancel") {
                convo.close(id);
                startCancel();
              } else if (action === "payments") toBookingPage(OPEN_BOOKING_PAYMENTS_EVENT);
              else void convo.bookingAction(id, action);
            }}
            chatLabel={bookingCtx ? `Ask ${emFirst(bookingData?.emName ?? null) ?? "the Event Manager team"}` : undefined}
            reportStatus={
              request?.kind === "report" ? (
                <ReportStatus
                  request={request}
                  em={em}
                  repliedBy={convo.eventManagerName}
                  onSorted={() => void convo.markSorted()}
                  onCallBack={() => setView("callback")}
                  onWhatsApp={convo.showWhatsApp}
                />
              ) : undefined
            }
            statusWho={bookingCtx ? em : undefined}
          />
        )}
      </HelpPanel>
    </>
  );
}
