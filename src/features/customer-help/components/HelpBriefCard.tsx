"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import HelpButton from "./HelpButton";
import HelpCheckbox from "./HelpCheckbox";
import HelpChip from "./HelpChip";
import HelpPhoneIcon from "./HelpPhoneIcon";
import HelpTextField from "./HelpTextField";
import { scrollWithinPanel } from "./scrollWithinPanel";

// Figma "Help / Brief card" (node 2369:10225) — the hand-off brief to an
// Event Manager. One component covers every Figma state:
// Empty / Error ("· pick one" on missing groups) / Filled · Reply here /
// Call me (+ call time, phone, consent) / Call me · error / Signed in
// (account number + Change) / Location not served / With photo / After 9 PM.

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
const CALL_TIMES_DAY = ["As soon as possible", "In the next hour", "This evening, 6–9 PM"];
const CALL_TIMES_AFTER_HOURS = ["Tomorrow, 9–10 AM", "Tomorrow, 12–2 PM", "Tomorrow, 6–9 PM"];

export type HelpBrief = {
  occasion: string;
  guests: string;
  budget: string;
  vendorType: string;
  area: string;
  date: string;
  photo: File | null;
  replyMode: "reply-here" | "call-me";
  callTime: string | null;
  phone: string | null;
};

type HelpBriefCardProps = {
  /** Pre-filled from the chat (occasion, guests, budget, vendor type, date). */
  initial?: Partial<Pick<HelpBrief, "occasion" | "guests" | "budget" | "vendorType" | "date">>;
  /** The photo already shared in the chat (Figma 8.3), shown with Remove. */
  initialPhoto?: File;
  /** Area from the customer's location tag — pre-fills Area and shows the "From your location" note until edited. */
  locationArea?: string;
  /** The pre-filled area came from the location tag (shows "From your location"). */
  areaFromLocation?: boolean;
  /** false = not served (warning note); undefined = not checked yet. */
  isAreaServed?: (area: string) => boolean | undefined;
  /** Area edits, so the parent can check them (Figma 9.6). */
  onAreaChange?: (area: string) => void;
  /** Signed-in user's number; guests get a phone field + consent instead. */
  accountPhone?: string;
  /** After 9 PM: call times move to tomorrow and an offline note shows under Send. */
  isAfterHours?: boolean;
  onSubmit: (brief: HelpBrief) => void;
};

const LABEL = "font-figtree text-[12px] font-medium leading-[18px] text-[#3f3f47]";
const LABEL_ERROR = "font-figtree text-[12px] font-medium leading-[18px] text-[#c81e0d]";
const NOTE = "font-figtree text-[11px] font-normal leading-[16px]";

export default function HelpBriefCard({
  initial,
  initialPhoto,
  locationArea = "",
  areaFromLocation = true,
  isAreaServed,
  onAreaChange,
  accountPhone,
  isAfterHours = false,
  onSubmit,
}: HelpBriefCardProps) {
  const callTimes = isAfterHours ? CALL_TIMES_AFTER_HOURS : CALL_TIMES_DAY;

  const [occasion, setOccasion] = useState(initial?.occasion ?? "");
  const [guests, setGuests] = useState(initial?.guests ?? "");
  const [budget, setBudget] = useState(initial?.budget ?? "");
  const [vendorType, setVendorType] = useState(initial?.vendorType ?? "");
  const [area, setArea] = useState(locationArea);
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
  const [showErrors, setShowErrors] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  // Bumped on each failed send so the scroll runs after the errors render.
  const [errorPass, setErrorPass] = useState(0);

  // Figma 6.2 / 7.2: the panel scrolls to the first missing field.
  useEffect(() => {
    if (!errorPass) return;
    const first = cardRef.current?.querySelector<HTMLElement>("[data-brief-error]");
    if (first) scrollWithinPanel(first, "center");
    const input = first?.matches("input") ? first : first?.querySelector<HTMLElement>("input");
    input?.focus({ preventScroll: true });
  }, [errorPass]);

  // Revoke the preview URL when the photo is replaced/removed or on unmount.
  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);

  // Call times swap to "Tomorrow, …" after hours; fall back to the first slot
  // if the selected one isn't in the current list.
  const activeCallTime = callTimes.includes(callTime) ? callTime : callTimes[0];
  const isCallMe = replyMode === "call-me";
  const typesPhone = isCallMe && !useAccountPhone;
  const phoneError =
    typesPhone && phone.replace(/\D/g, "").length !== 10
      ? "Enter a 10-digit mobile number."
      : undefined;
  const consentError = typesPhone && !consent;
  const areaNotServed = Boolean(area.trim()) && isAreaServed?.(area.trim()) === false;

  const submit = () => {
    if (!occasion || !guests || !budget || !vendorType || phoneError || consentError) {
      setShowErrors(true);
      setErrorPass((n) => n + 1);
      return;
    }
    onSubmit({
      occasion,
      guests,
      budget,
      vendorType,
      area: area.trim(),
      date: date.trim(),
      photo: photo?.file ?? null,
      replyMode,
      callTime: isCallMe ? activeCallTime : null,
      phone: isCallMe ? (useAccountPhone ? accountPhone ?? null : phone) : null,
    });
  };

  const group = (
    label: string,
    options: readonly string[],
    value: string,
    onChange: (v: string) => void,
  ) => (
    <div className="flex w-full flex-col gap-1.5" data-brief-error={showErrors && !value ? "" : undefined}>
      <p className={showErrors && !value ? LABEL_ERROR : LABEL}>
        {label}
        {showErrors && !value && " · pick one"}
      </p>
      <div className="flex w-full flex-wrap gap-1.5">
        {options.map((option) => (
          <HelpChip
            key={option}
            label={option}
            selected={option === value}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );

  let locationNote: ReactNode = null;
  if (areaNotServed) {
    locationNote = (
      <LocationNote icon="/images/customer/help/map-point-warning.svg" className="text-[#bb4d00]">
        We don’t cover {area.trim()} yet. The Event Manager can check if a vendor travels there.
      </LocationNote>
    );
  } else if (areaFromLocation && locationArea && area === locationArea) {
    locationNote = (
      <LocationNote icon="/images/customer/help/map-point-small.svg" className="text-[#71717b]">
        From your location. Change it if the event is somewhere else.
      </LocationNote>
    );
  }

  return (
    <div ref={cardRef} className="flex w-full flex-col overflow-hidden rounded-[16px] border border-[#e4e4e7] bg-white">
      <div className="flex w-full items-start gap-3 border-b border-[#e4e4e7] bg-[#fafafa] px-4 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fdeef0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/customer/help/users-group.svg" alt="" width={20} height={20} className="block" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-figtree font-normal">
          <p className="text-[14px] leading-[20px] text-[#030303]">Your brief for the Event Manager</p>
          <p className="text-[12px] leading-[18px] text-[#71717b]">
            We’ve filled in what you told us. Check it, then send. They’ll see this chat and the page you were on.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 p-4">
        {group("Occasion", OCCASIONS, occasion, setOccasion)}
        {group("Guests", GUEST_RANGES, guests, setGuests)}
        {group("Budget", BUDGET_RANGES, budget, setBudget)}
        {group("Vendor type", VENDOR_TYPES, vendorType, setVendorType)}

        <div className="flex w-full flex-col gap-1.5">
          <p className={LABEL}>Where and when (optional)</p>
          <div className="flex w-full gap-2">
            <HelpTextField
              className="flex-1"
              placeholder="Area, e.g. Saket"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                onAreaChange?.(e.target.value);
              }}
              leftIcon={<FieldIcon src="/images/customer/help/input-map-point.svg" />}
            />
            <HelpTextField
              className="flex-1"
              placeholder="Date, e.g. 14 Dec"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              leftIcon={<FieldIcon src="/images/customer/help/input-calendar.svg" />}
            />
          </div>
          {locationNote}
        </div>

        <div className="flex w-full flex-col items-start gap-1.5">
          <p className={LABEL}>Reference photo (optional)</p>
          {photo ? (
            <div className="flex w-full items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt="Reference photo"
                className="size-14 shrink-0 rounded-[8px] bg-[#f4f4f5] object-cover"
              />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="font-figtree text-[12px] font-normal leading-[18px] text-[#030303]"
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
                <HelpChip
                  key={time}
                  label={time}
                  selected={time === activeCallTime}
                  onClick={() => setCallTime(time)}
                />
              ))}
            </div>
          ) : (
            <p className="font-figtree text-[12px] font-normal leading-[18px] text-[#71717b]">
              The Event Manager replies right here in this chat. Keep this page open, or come back to Your chats on
              this device.
            </p>
          )}
        </div>

        {isCallMe && (
          <div className="flex w-full flex-col gap-1.5">
            <p className="font-figtree text-[12px] font-normal leading-[18px] text-[#3f3f47]">Phone number</p>
            {useAccountPhone ? (
              <div className="flex w-full items-center gap-2.5 rounded-[12px] border border-[#e4e4e7] px-3 py-2.5">
                <HelpPhoneIcon tone="account" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-figtree font-normal">
                  <p className="text-[14px] leading-[20px] text-[#030303]">{accountPhone}</p>
                  <p className="text-[11px] leading-[16px] text-[#71717b]">From your account</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUseAccountPhone(false)}
                  className="font-figtree text-[12px] font-normal leading-[18px] text-[#030303]"
                >
                  Change
                </button>
              </div>
            ) : (
              <HelpTextField
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                helper="Any number we can call. It doesn’t need WhatsApp."
                error={showErrors ? phoneError : undefined}
                data-brief-error={showErrors && phoneError ? "" : undefined}
                leftIcon={
                  showErrors && phoneError ? (
                    <FieldIcon src="/images/customer/help/input-phone.svg" size={24} />
                  ) : (
                    <span className="relative block size-5 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/customer/help/input-phone-guest.svg"
                        alt=""
                        width={21.5008}
                        height={20.7502}
                        className="absolute left-[-0.75px] top-0 block max-w-none"
                      />
                    </span>
                  )
                }
              />
            )}
          </div>
        )}

        {typesPhone && (
          <HelpCheckbox checked={consent} onChange={setConsent}>
            I agree that Eventory can call me about this request. Only for this request, never for offers. Privacy
            notice
          </HelpCheckbox>
        )}
        {typesPhone && showErrors && consentError && (
          <p data-brief-error="" className={`${NOTE} text-[#c81e0d]`}>
            Tick the box so we can call you.
          </p>
        )}

        <HelpButton size="md" className="w-full" onClick={submit}>
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
