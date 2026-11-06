"use client";

import { useState } from "react";
import { emFirst, emLabel } from "../../assistant/bookingAnswers";
import type { BookingHelpPackage } from "../../hooks/useBookingHelpData";
import HelpButton from "../HelpButton";
import HelpTextField from "../HelpTextField";
import type { BookingChangeKind } from "./BookingDoor";
import { changeWindow } from "./BookingDoor";
import { Banner } from "./ui";

// v6f9 "Can I change this?" — guest count, reschedule, venue. Says plainly
// whether it's inside the free-change window (from the package's
// cancellation template), then takes the new value and sends it to the
// Event Manager, who confirms it with the vendor(s).
export const CHANGE_TITLE: Record<BookingChangeKind, string> = {
  guests: "Change guest count",
  resched: "Reschedule",
  venue: "Change venue",
};

type Props = {
  kind: BookingChangeKind;
  packages: BookingHelpPackage[];
  emName: string | null;
  guestsLabel?: string;
  onSend: (input: { topic: string; text: string; details: string[] }) => Promise<void>;
};

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const when = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${d
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    .toUpperCase()}`;
};

export default function BookingChange({ kind, packages, emName, guestsLabel, onSend }: Props) {
  const [guests, setGuests] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { free, until } = changeWindow(packages);
  const names = packages.map((p) => p.vendorName ?? p.name).join(" and ");
  const one = packages.length === 1;
  const em = emLabel(emName);

  const value = kind === "guests" ? guests.trim() : kind === "resched" ? date : venue.trim();
  const ready = !sending && Boolean(value) && (kind !== "guests" || Number(guests) > 0);
  const describe = {
    guests: `Tell us the new guest count. ${names} ${one ? "confirms" : "confirm"} it, since it can change the price.`,
    resched: `Pick the new date. ${names} ${one ? "has" : "have"} to confirm ${one ? "it’s" : "they’re"} free.`,
    venue: `Add the new venue. ${names} ${one ? "has" : "have"} to confirm ${one ? "it" : "they"} can set up there.`,
  }[kind];

  const send = async () => {
    if (!ready) return;
    setSending(true);
    setError(null);
    const line =
      kind === "guests"
        ? `New guest count: ${guests.trim()}`
        : kind === "resched"
          ? `New date: ${new Date(`${date}T00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}`
          : `New venue: ${venue.trim()}`;
    try {
      await onSend({
        topic: CHANGE_TITLE[kind],
        text: note.trim() ? `${line}. ${note.trim()}` : line,
        details: [line, `Packages: ${packages.map((p) => `${p.name} (${p.reference})`).join("; ")}`, free ? "Inside the free-change window" : "Needs the vendor’s approval"],
      });
    } catch {
      setError("We couldn’t send that. Check your connection and try again.");
      setSending(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
      {free && until ? (
        <Banner tone="info" icon="/images/customer/help/shield-info.svg">
          <b className="font-semibold">Yes, you can still change this.</b> Free changes are open until {when(until)}.
        </Banner>
      ) : (
        <Banner tone="warn" icon="/images/customer/help/clock-warn.svg">
          <b className="font-semibold">This needs {one ? `${names}’s` : "the vendors’"} approval.</b> The free-change window is
          over, so it may cost more.
        </Banner>
      )}
      <p className="text-[14px] leading-[20px] text-[#71717b]">{describe}</p>

      {kind === "guests" && (
        <HelpTextField
          type="number"
          inputMode="numeric"
          min={1}
          placeholder={guestsLabel ? `Now ${guestsLabel}` : "New guest count"}
          value={guests}
          onChange={(e) => setGuests(e.target.value.replace(/\D/g, "").slice(0, 5))}
          leftIcon={null}
          aria-label="New guest count"
        />
      )}
      {kind === "resched" && (
        <input
          type="date"
          min={todayIso()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="New date"
          className="w-full rounded-[8px] border border-[#e4e4e7] px-3.5 py-[11px] text-[14px] leading-[20px] text-[#030303] outline-none focus:border-[#030303]"
        />
      )}
      {kind === "venue" && (
        <HelpTextField
          placeholder="Venue name and area"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          leftIcon={null}
          aria-label="New venue"
        />
      )}
      <textarea
        value={note}
        maxLength={500}
        onChange={(e) => setNote(e.target.value)}
        placeholder={`Anything ${em} should know? (optional)`}
        aria-label="Note"
        className="min-h-[72px] w-full resize-y rounded-[8px] border border-[#e4e4e7] px-3.5 py-3 text-[14px] leading-[20px] text-[#030303] outline-none placeholder:text-[#9f9fa9] focus:border-[#030303]"
      />
      <p className="text-[12px] leading-[18px] text-[#71717b]">
        {em} confirms it with the vendor{one ? "" : "s"} and sends you a revised proposal if the price changes. Nothing changes
        until you accept it.
      </p>
      {error && (
        <p role="alert" className="text-[12px] leading-[18px] text-[#c81e0d]">
          {error}
        </p>
      )}
      <HelpButton size="md" className="w-full disabled:opacity-45" disabled={!ready} onClick={() => void send()}>
        {sending ? "Sending…" : `Send to ${emFirst(emName) ?? "the Event Manager team"}`}
      </HelpButton>
    </div>
  );
}
