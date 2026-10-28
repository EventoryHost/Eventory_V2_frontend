"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AREA_OPTIONS } from "../assistant/parseRequest";
import HelpButton from "./HelpButton";
import HelpCheckbox from "./HelpCheckbox";
import HelpChip from "./HelpChip";
import HelpPhoneIcon from "./HelpPhoneIcon";
import HelpTextField from "./HelpTextField";

// v6f9 "Your brief for the Event Manager" — the hand-off to an Event
// Manager. Occasion, guests and budget are required (Send stays off until
// they're picked); vendor type, area, date and a photo are optional.
// Once the chat's requirements are confirmed they're attached as one box
// (with Edit) instead of the chips. Reply here, or Call me with a call
// time, phone and — for guests — consent.

export const OCCASIONS = [
  "Birthday",
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Anniversary",
  "Baby shower",
  "Other",
] as const;
export const GUEST_RANGES = ["Up to 25", "25–50", "50–100", "100–200", "200+"] as const;
export const BUDGET_RANGES = ["Under ₹25K", "₹25–50K", "₹50K–1L", "₹1–2L", "₹2L+"] as const;
export const VENDOR_TYPES = [
  "Decorator",
  "Caterer",
  "Photographer & videographer",
  "Makeup artist",
  "DJ",
  "Venue",
] as const;
const NOT_SURE = "Not sure yet";

const CALL_TIMES_DAY = ["As soon as possible", "In the next hour", "This evening, 6–9 PM"];
const CALL_TIMES_AFTER_HOURS = ["Tomorrow, 9–10 AM", "Tomorrow, 12–2 PM", "Tomorrow, 6–9 PM"];

export type HelpBrief = {
  occasion: string;
  guests: string;
  budget: string;
  /** "" = not sure yet. */
  vendorType: string;
  area: string;
  /** "2026-12-14", or "" when not decided. */
  date: string;
  photo: File | null;
  replyMode: "reply-here" | "call-me";
  callTime: string | null;
  phone: string | null;
};

/** The confirmed requirements card, attached instead of the chips. */
export type AttachedRequirements = {
  summary: string;
  occasion: string;
  guests: string;
  budget: string;
  vendorType: string;
  area: string;
  date: string;
};

type HelpBriefCardProps = {
  /** Pre-filled from the chat (occasion, guests, budget, vendor type, date). */
  initial?: Partial<Pick<HelpBrief, "occasion" | "guests" | "budget" | "vendorType" | "date">>;
  /** Confirmed requirements: shown as one attached box with Edit. */
  attached?: AttachedRequirements | null;
  onEditRequirements?: () => void;
  /** The photo already shared in the chat (Figma 8.3), shown with Remove. */
  initialPhoto?: File;
  /** An area from the chat (typed, or one we don't serve yet). */
  initialArea?: string;
  /** The site's location tag; `served` false shows the "don't cover" note. */
  locationTag?: { label: string; served: boolean | undefined } | null;
  /** false = not served (warning note); undefined = not checked yet. */
  isAreaServed?: (area: string) => boolean | undefined;
  /** Signed-in user's number; guests get a phone field + consent instead. */
  accountPhone?: string;
  /** Signed in: "We'll also send you a notification." */
  signedIn?: boolean;
  /** After 9 PM: call times move to tomorrow and an offline note shows under Send. */
  isAfterHours?: boolean;
  onSubmit: (brief: HelpBrief) => void;
};

const LABEL = "font-figtree text-[14px] font-normal leading-[20px] text-[#3f3f47]";
const OPTIONAL = "font-figtree text-[12px] font-normal text-[#71717b]";
const NOTE = "font-figtree text-[12px] font-normal leading-[18px]";

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const dateText = (iso: string) => {
  const d = new Date(`${iso}T00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

export default function HelpBriefCard({
  initial,
  attached,
  onEditRequirements,
  initialPhoto,
  initialArea = "",
  locationTag,
  isAreaServed,
  accountPhone,
  signedIn = false,
  isAfterHours = false,
  onSubmit,
}: HelpBriefCardProps) {
  const callTimes = isAfterHours ? CALL_TIMES_AFTER_HOURS : CALL_TIMES_DAY;
  const tagServed = Boolean(locationTag?.served);

  const [occasion, setOccasion] = useState(initial?.occasion ?? "");
  const [guests, setGuests] = useState(initial?.guests ?? "");
  const [budget, setBudget] = useState(initial?.budget ?? "");
  const [vendorType, setVendorType] = useState(initial?.vendorType ?? "");
  // The location tag pre-fills the area when it's one we serve.
  const [area, setArea] = useState(initialArea || (tagServed ? (locationTag?.label ?? "") : ""));
  const [date, setDate] = useState(initial?.date ?? "");
  // Own preview URL (not the chat bubble's), since this one is revoked below.
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(() =>
    initialPhoto ? { file: initialPhoto, url: URL.createObjectURL(initialPhoto) } : null,
  );
  const [replyMode, setReplyMode] = useState<HelpBrief["replyMode"]>("reply-here");
  const [callTime, setCallTime] = useState(callTimes[0]);
  const [useAccountPhone, setUseAccountPhone] = useState(Boolean(accountPhone));
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Revoke the preview URL when the photo is replaced/removed or on unmount.
  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);

  // Call times swap to "Tomorrow, …" after hours; fall back to the first slot
  // if the selected one isn't in the current list.
  const activeCallTime = callTimes.includes(callTime) ? callTime : callTimes[0];
  const isCallMe = replyMode === "call-me";
  const typesPhone = isCallMe && !useAccountPhone;
  const phoneDigits = phone.replace(/\D/g, "").slice(-10);
  const phoneOk = /^[6-9]\d{9}$/.test(phoneDigits);

  const value = attached
    ? attached
    : { occasion, guests, budget, vendorType, area, date };
  const ready =
    Boolean(value.occasion && value.guests && value.budget) &&
    (!typesPhone || (phoneOk && (signedIn || consent)));

  const submit = () => {
    if (!ready) return;
    onSubmit({
      occasion: value.occasion,
      guests: value.guests,
      budget: value.budget,
      vendorType: value.vendorType === NOT_SURE ? "" : value.vendorType,
      area: value.area.trim(),
      date: value.date,
      photo: photo?.file ?? null,
      replyMode,
      callTime: isCallMe ? activeCallTime : null,
      phone: isCallMe ? (useAccountPhone ? accountPhone ?? null : phoneDigits) : null,
    });
  };

  const group = (
    label: string,
    options: readonly string[],
    selected: string,
    onChange: (v: string) => void,
    optional = false,
  ) => (
    <div className="flex w-full flex-col gap-1.5">
      <p className={LABEL}>
        {label}
        {optional && <span className={OPTIONAL}> (optional)</span>}
      </p>
      <div className="flex w-full flex-wrap gap-1.5">
        {options.map((option) => (
          <HelpChip
            key={option}
            label={option}
            selected={option === selected}
            // Tapping an optional choice again clears it.
            onClick={() => onChange(optional && option === selected ? "" : option)}
          />
        ))}
      </div>
    </div>
  );

  // Area chips: the location tag (served), an area from the chat, then
  // the served regions.
  const tagChip = tagServed && locationTag ? `${locationTag.label} (your location)` : null;
  const areaChips = [
    ...(tagChip ? [tagChip] : []),
    ...(initialArea && initialArea !== locationTag?.label && !AREA_OPTIONS.some((a) => a.label === initialArea)
      ? [initialArea]
      : []),
    ...AREA_OPTIONS.map((a) => a.label).filter((l) => !locationTag?.label.includes(l)),
  ];
  const chipValue = (chip: string) => (chip === tagChip ? (locationTag?.label ?? "") : chip);
  const areaNotServed =
    (Boolean(area.trim()) && isAreaServed?.(area.trim()) === false) ||
    (!area && locationTag && locationTag.served === false);
  const unservedName = area.trim() || locationTag?.label;

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[16px] border border-[#e4e4e7] bg-white">
      <div className="flex w-full items-start gap-3 border-b border-[#e4e4e7] bg-[#fafafa] px-4 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fdeef0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/customer/help/users-group.svg" alt="" width={20} height={20} className="block" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-figtree font-normal">
          <p className="text-[14px] font-semibold leading-[20px] text-[#030303]">Your brief for the Event Manager</p>
          <p className="text-[12px] leading-[18px] text-[#71717b]">
            We’ve filled in what you told us. Check it, then send. They’ll see this chat and the page you were on.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3.5 p-4">
        {attached ? (
          <div className="flex w-full flex-col gap-1.5">
            <p className={LABEL}>
              Your requirements <span className={OPTIONAL}>(attached)</span>
            </p>
            <div className="flex items-start gap-2.5 rounded-[12px] border border-[#e4e4e7] px-3 py-2.5 font-figtree">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/customer/help/doc.svg" alt="" width={20} height={20} className="mt-0.5 block shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-[14px] leading-[20px] text-[#030303]">{attached.summary}</p>
                <p className="text-[12px] leading-[18px] text-[#71717b]">
                  The Event Manager sees this, so you won’t repeat yourself.
                </p>
              </div>
              <button
                type="button"
                onClick={onEditRequirements}
                className="text-[14px] leading-[20px] text-[#030303] underline underline-offset-2"
              >
                Edit
              </button>
            </div>
          </div>
        ) : (
          <>
            {group("Occasion", OCCASIONS, occasion, setOccasion)}
            {group("Vendor type", [...VENDOR_TYPES, NOT_SURE], vendorType, setVendorType, true)}
            {group("Guests", GUEST_RANGES, guests, setGuests)}
            {group("Budget", BUDGET_RANGES, budget, setBudget)}

            <div className="flex w-full flex-col gap-1.5">
              <p className={LABEL}>
                Area <span className={OPTIONAL}>(optional)</span>
              </p>
              <div className="flex w-full flex-wrap gap-1.5">
                {areaChips.map((chip) => {
                  const v = chipValue(chip);
                  return (
                    <HelpChip key={chip} label={chip} selected={area === v} onClick={() => setArea(area === v ? "" : v)} />
                  );
                })}
              </div>
              {areaNotServed && unservedName && (
                <LocationNote icon="/images/customer/help/map-point-warning.svg" className="text-[#bb4d00]">
                  We don’t cover {unservedName} yet. The Event Manager can check if a vendor travels there.
                </LocationNote>
              )}
            </div>

            <div className="flex w-full flex-col gap-1.5">
              <p className={LABEL}>
                Date <span className={OPTIONAL}>(optional)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                <HelpChip label="Not decided yet" selected={!date} onClick={() => setDate("")} />
                <label
                  className={`relative flex min-h-8 cursor-pointer items-center rounded-full border px-4 py-[5px] font-figtree text-[14px] leading-[20px] ${
                    date ? "border-[#09090b] bg-[#030303] text-[#fafafa]" : "border-[#f4f4f5] bg-[#f4f4f5] text-[#18181b]"
                  }`}
                >
                  {date ? dateText(date) : "Pick a date"}
                  <input
                    type="date"
                    min={todayIso()}
                    value={date}
                    aria-label="Event date"
                    onChange={(e) => setDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {
                        // Older browsers open the picker on focus.
                      }
                    }}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                </label>
              </div>
            </div>
          </>
        )}

        <div className="flex w-full flex-col items-start gap-1.5">
          <p className={LABEL}>
            Reference photo <span className={OPTIONAL}>(optional)</span>
          </p>
          {photo ? (
            <div className="flex w-full items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="Your reference photo" className="size-14 shrink-0 rounded-[10px] border border-[#e4e4e7] object-cover" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="font-figtree text-[14px] font-normal leading-[20px] text-[#030303] underline underline-offset-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <HelpButton
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              leftIcon={<FieldIcon src="/images/customer/help/brief-camera.svg" size={16} />}
            >
              Add a photo
            </HelpButton>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhoto({ file, url: URL.createObjectURL(file) });
              e.target.value = "";
            }}
          />
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <p className={LABEL}>How should we reach you?</p>
          <div className="flex gap-2 rounded-full bg-[#f4f4f5] p-1">
            <HelpChip
              label="Reply here"
              selected={!isCallMe}
              onClick={() => setReplyMode("reply-here")}
              leftIcon={
                <FieldIcon
                  src={
                    isCallMe
                      ? "/images/customer/help/chip-chat-unselected.svg"
                      : "/images/customer/help/chip-chat-selected.svg"
                  }
                  size={18}
                />
              }
            />
            <HelpChip
              label="Call me"
              selected={isCallMe}
              onClick={() => setReplyMode("call-me")}
              leftIcon={<HelpPhoneIcon tone={isCallMe ? "chipSelected" : "chipUnselected"} />}
            />
          </div>
          {isCallMe ? (
            <div className="flex w-full flex-wrap gap-1.5">
              {callTimes.map((time) => (
                <HelpChip key={time} label={time} selected={time === activeCallTime} onClick={() => setCallTime(time)} />
              ))}
            </div>
          ) : (
            <p className={`${NOTE} text-[#71717b]`}>
              The Event Manager replies right here in this chat.
              {signedIn
                ? " We’ll also send you a notification."
                : " Keep this page open, or come back to Your chats on this device."}
            </p>
          )}
        </div>

        {isCallMe && (
          <div className="flex w-full flex-col gap-1.5">
            <p className={LABEL}>Phone number</p>
            {useAccountPhone ? (
              <div className="flex w-full items-center gap-2.5 rounded-[12px] border border-[#e4e4e7] px-3 py-2.5">
                <HelpPhoneIcon tone="account" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-figtree font-normal">
                  <p className="text-[14px] leading-[20px] text-[#030303] tabular-nums">{accountPhone}</p>
                  <p className="text-[11px] leading-[16px] text-[#71717b]">From your account</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseAccountPhone(false)}
                  className="font-figtree text-[14px] font-normal leading-[20px] text-[#030303] underline underline-offset-2"
                >
                  Change
                </button>
              </div>
            ) : (
              <HelpTextField
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={11}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, ""))}
                helper={
                  phone && !phoneOk ? undefined : "Any number we can call. It doesn’t need WhatsApp."
                }
                error={phone.replace(/\D/g, "").length >= 10 && !phoneOk ? "Enter a 10-digit mobile number." : undefined}
                leftIcon={<span className="font-figtree text-[14px] text-[#3f3f47]">+91</span>}
              />
            )}
          </div>
        )}

        {typesPhone && !signedIn && (
          <HelpCheckbox checked={consent} onChange={setConsent}>
            I agree that Eventory can call me about this request. Only for this request, never for offers. Privacy
            notice
          </HelpCheckbox>
        )}

        <HelpButton size="md" className="w-full disabled:opacity-45" onClick={submit} disabled={!ready}>
          Send to an Event Manager
        </HelpButton>
        {isAfterHours && (
          <p className={`${NOTE} text-center text-[#71717b]`}>
            We’re offline now. The first Event Manager in replies by 9:30 AM.
          </p>
        )}
      </div>
    </div>
  );
}

function FieldIcon({ src, size = 20 }: { src: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} className="block shrink-0" />;
}

function LocationNote({
  icon,
  className,
  children,
}: {
  icon: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full items-center gap-1">
      <FieldIcon src={icon} size={14} />
      <p className={`${NOTE} flex-1 ${className}`}>{children}</p>
    </div>
  );
}
