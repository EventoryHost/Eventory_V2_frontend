"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadImage";
import type { HelpReport } from "@/lib/customerHelpApi";
import { emFirst, emLabel } from "../../assistant/bookingAnswers";
import { GROUP_TITLE, ISSUES, bookedItems, issuesFor, vendorStatus, type IssueKey } from "../../assistant/eventDay";
import type { HelpBookingContext } from "../../helpContext";
import type { BookingHelpData } from "../../hooks/useBookingHelpData";
import HelpButton from "../HelpButton";
import { Banner, PackagePick } from "./ui";

// v6f9 event-day "Tell us what's happening" (flow P): which package (step
// 1) → what's happening, only the problems that fit it — before or after
// the vendor arrived (2) → check and send (3). Sent as a GRV ticket to the
// Event Manager; no-shows and safety alert the duty manager too.
export type ReportState = { step: "pkg" | "issue" | "send"; pkg?: string | null; issue?: IssueKey };
export const REPORT_STEPS = ["pkg", "issue", "send"] as const;

type Props = {
  ctx: HelpBookingContext;
  data: BookingHelpData;
  state: ReportState;
  onChange: (next: ReportState) => void;
  onSend: (input: { topic: string; text: string; details: string[]; report: HelpReport }) => Promise<void>;
};

function Option({ title, sub, selected, onClick }: { title: string; sub: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-14 w-full items-center gap-3 rounded-[12px] bg-white text-left ${
        selected ? "border-2 border-[#030303] p-[13px]" : "border border-[#e4e4e7] p-3.5 hover:border-[#030303]"
      }`}
    >
      <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${selected ? "border-[#030303]" : "border-[#9f9fa9]"}`}>
        {selected && <span className="size-2.5 rounded-full bg-[#030303]" />}
      </span>
      <span className="flex flex-1 flex-col text-[14px] leading-[20px] text-[#030303]">
        {title}
        <span className="text-[12px] leading-[18px] text-[#71717b]">{sub}</span>
      </span>
    </button>
  );
}

function Steps({ index }: { index: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {REPORT_STEPS.map((s, i) => (
        <i key={s} className={`h-1 flex-1 rounded-full ${i <= index ? "bg-[#030303]" : "bg-[#e4e4e7]"}`} />
      ))}
    </div>
  );
}

export default function ReportFlow({ ctx, data, state, onChange, onSend }: Props) {
  const active = data.packages.filter((p) => !p.cancelled);
  const pkg = state.pkg ? active.find((p) => p.reference === state.pkg) : null;
  const issue = ISSUES.find((i) => i.key === state.issue);
  const em = emLabel(data.emName);
  const [note, setNote] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [photo, setPhoto] = useState<{ name: string; url?: string; uploading: boolean; error?: boolean } | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pinned = (
    <div className="flex items-center gap-4 rounded-[16px] border border-[#e4e4e7] bg-[#fafafa] py-3 pl-3 pr-4">
      <span className="size-14 shrink-0 overflow-hidden rounded-[12px] bg-[#f4f4f5]">
        {pkg?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pkg.image} alt="" className="size-full object-cover" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[16px] font-medium leading-[24px] text-[#030303]">{pkg ? pkg.name : "Not sure, or the venue"}</span>
        <span className="text-[14px] leading-[20px] text-[#71717b]">
          {pkg ? `${pkg.vendorName ?? ""}${pkg.variantLabel ? ` · ${pkg.variantLabel}` : ""}` : `${em} will work out who to call`}
        </span>
        {pkg && <span className="text-[12px] leading-[18px] text-[#71717b]">{vendorStatus(pkg, ctx).text}</span>}
      </span>
      <button type="button" onClick={() => onChange({ step: "pkg" })} className="self-start text-[12px] text-[#030303] underline underline-offset-2">
        Change
      </button>
    </div>
  );

  if (state.step === "pkg") {
    return (
      <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
        <Steps index={0} />
        <h3 className="text-[20px] font-semibold leading-[28px] text-[#030303]">Which package is this about?</h3>
        <p className="-mt-3 text-[14px] leading-[20px] text-[#71717b]">We’ll only show the problems that fit it.</p>
        <div className="flex flex-col gap-2">
          {active.map((p) => (
            <PackagePick
              key={p.reference}
              name={p.name}
              sub={[p.vendorName, p.variantLabel].filter(Boolean).join(" · ")}
              image={p.image}
              single
              selected={state.pkg === p.reference}
              onClick={() => onChange({ step: "issue", pkg: p.reference })}
            />
          ))}
          <PackagePick
            name="Not sure, or the venue"
            sub={`${em} will work out who to call`}
            single
            selected={state.pkg === null}
            onClick={() => onChange({ step: "issue", pkg: null })}
          />
        </div>
      </div>
    );
  }

  if (state.step === "issue") {
    const fitting = issuesFor(pkg ? vendorStatus(pkg, ctx).arrived : null);
    const group = (g: "vendor" | "setup") => {
      const list = fitting.filter((i) => i.group === g);
      return list.length ? (
        <div className="flex flex-col gap-2">
          <p className="text-[12px] uppercase leading-[18px] tracking-[0.4px] text-[#71717b]">{GROUP_TITLE[g]}</p>
          {list.map((i) => (
            <Option key={i.key} title={i.label} sub={i.sub} selected={state.issue === i.key} onClick={() => onChange({ ...state, step: "send", issue: i.key })} />
          ))}
        </div>
      ) : null;
    };
    const other = fitting.find((i) => i.key === "other")!;
    return (
      <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
        <Steps index={1} />
        {pinned}
        <h3 className="text-[20px] font-semibold leading-[28px] text-[#030303]">What’s happening?</h3>
        {group("vendor")}
        {group("setup")}
        <Option title={other.label} sub={other.sub} selected={state.issue === "other"} onClick={() => onChange({ ...state, step: "send", issue: "other" })} />
      </div>
    );
  }

  // Check and send.
  if (!issue) return null;
  const items = pkg ? bookedItems(pkg) : [];
  const needsPick = Boolean(issue.pick && pkg && items.length);
  const ready =
    !sending &&
    !photo?.uploading &&
    (!needsPick || missing.length > 0) &&
    (issue.key !== "other" || Boolean(note.trim() || photo?.url));
  const help = issue.urgent
    ? `${em} and a duty manager get this the moment you send it. ${em} usually replies within 30 minutes.`
    : issue.call
      ? `${em} will call you, since this is easier on the phone. They usually call within 30 minutes.`
      : `${em} gets this the moment you send it and usually replies within 30 minutes.`;
  const chips = [
    ctx.reference,
    pkg && (issue.key === "late" || issue.key === "noshow") && ctx.startTime ? `Event at ${ctx.startTime}` : null,
    pkg && issue.key === "extra" ? "Booked price attached" : null,
    pkg && ["missing", "wrong", "quality"].includes(issue.key) ? "Booked items attached" : null,
  ].filter((c): c is string => Boolean(c));

  const pickPhoto = async (file: File) => {
    setPhoto({ name: file.name, uploading: true });
    try {
      const url = await uploadImage(file);
      setPhoto({ name: file.name, url, uploading: false });
    } catch {
      setPhoto({ name: file.name, uploading: false, error: true });
    }
  };

  const send = async () => {
    if (!ready) return;
    setSending(true);
    setError(null);
    const vendor = pkg?.vendorName ?? (pkg ? pkg.name : "Not sure / the venue");
    const details = [
      `About: ${pkg ? `${pkg.name} (${pkg.reference})` : "Not sure / the venue"}`,
      ...(pkg ? [`Vendor status: ${vendorStatus(pkg, ctx).text}`] : []),
      ...(missing.length ? [`Missing: ${missing.join(", ")}`] : []),
      ...(photo?.url ? [`Photo: ${photo.url}`] : []),
    ];
    try {
      await onSend({
        topic: `${issue.label} · ${vendor}`,
        text: note.trim() || issue.label,
        details,
        report: {
          issue: issue.key,
          label: issue.label,
          packageRef: pkg?.reference ?? null,
          urgent: Boolean(issue.urgent),
          photoUrl: photo?.url,
          missing: missing.length ? missing : undefined,
        },
      });
    } catch {
      setError("We couldn’t send that. Check your connection and try again, or call the number under “Just want to talk?”.");
      setSending(false);
    }
  };

  const photoBox = (
    <label
      className={`flex cursor-pointer flex-col gap-1.5 rounded-[12px] border border-dashed p-3.5 text-[14px] leading-[20px] ${
        issue.photo ? "border-[#030303]" : "border-[#9f9fa9] text-[#3f3f47]"
      }`}
    >
      {issue.photo ? (
        <>
          <b className="font-semibold text-[#030303]">Add a photo of the setup</b>
          <span className="text-[#71717b]">A photo lets {em} compare it with what you booked straight away.</span>
        </>
      ) : (
        <span>Add a photo (optional)</span>
      )}
      {photo && (
        <span className={photo.error ? "text-[#c81e0d]" : "text-[#71717b]"}>
          {photo.uploading ? `Uploading ${photo.name}…` : photo.error ? "That photo didn’t upload. Try again." : `Photo added: ${photo.name}`}
        </span>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void pickPhoto(f);
          e.target.value = "";
        }}
      />
    </label>
  );

  return (
    <div className="flex w-full flex-col gap-4 px-4 pb-6 pt-4 font-figtree">
      <Steps index={2} />
      <h3 className="text-[20px] font-semibold leading-[28px] text-[#030303]">Check and send</h3>
      <div className="flex flex-col gap-2.5 rounded-[16px] border border-[#e4e4e7] p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[14px] leading-[20px] text-[#030303]">
            <b className="font-semibold">{issue.label}</b>
            <span className="block text-[#71717b]">{pkg ? (pkg.vendorName ?? pkg.name) : "Not sure / the venue"}</span>
          </span>
          <button type="button" onClick={() => onChange({ step: "pkg" })} className="text-[12px] text-[#030303] underline underline-offset-2">
            Change
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="rounded-full border border-[#e4e4e7] bg-white px-2.5 py-1 text-[12px] leading-[18px] text-[#3f3f47] tabular-nums">
              {c}
            </span>
          ))}
        </div>
      </div>
      {issue.photo && photoBox}
      {needsPick && (
        <div className="flex flex-col gap-2">
          <p className="text-[14px] leading-[20px] text-[#3f3f47]">What’s missing?</p>
          {items.map((it) => (
            <label key={it} className="flex cursor-pointer items-center gap-2.5 rounded-[12px] border border-[#e4e4e7] px-3 py-2.5 text-[14px] leading-[20px] text-[#030303]">
              <input
                type="checkbox"
                checked={missing.includes(it)}
                onChange={(e) => setMissing((m) => (e.target.checked ? [...m, it] : m.filter((x) => x !== it)))}
                className="size-[18px] accent-[#030303]"
              />
              {it}
            </label>
          ))}
          <p className="text-[12px] leading-[18px] text-[#71717b]">From what you booked with {pkg?.vendorName ?? "the vendor"}.</p>
        </div>
      )}
      {!issue.photo && photoBox}
      <div className="flex flex-col gap-2">
        <label htmlFor="help-report-note" className="text-[14px] leading-[20px] text-[#3f3f47]">
          Anything to add? {issue.key === "other" ? "" : "(optional)"}
        </label>
        <textarea
          id="help-report-note"
          value={note}
          maxLength={1000}
          onChange={(e) => setNote(e.target.value)}
          placeholder="One line is enough"
          className="min-h-[72px] w-full resize-y rounded-[8px] border border-[#e4e4e7] px-3.5 py-3 text-[14px] leading-[20px] text-[#030303] outline-none placeholder:text-[#9f9fa9] focus:border-[#030303]"
        />
        <p className="text-[12px] leading-[18px] text-[#71717b]">Describe what you see. You don’t need to say whose fault it is.</p>
      </div>
      {issue.key === "safety" && (
        <Banner tone="warn" icon="/images/customer/help/info-warning.svg">
          <b className="font-semibold">If anyone is hurt or in danger, call 112 first.</b> Then send this so {em} can act on the rest.
        </Banner>
      )}
      {error && (
        <p role="alert" className="text-[12px] leading-[18px] text-[#c81e0d]">
          {error}
        </p>
      )}
      <HelpButton size="md" className="w-full disabled:opacity-45" disabled={!ready} onClick={() => void send()}>
        {sending ? "Sending…" : needsPick && !missing.length ? "Tick what’s missing" : `Send to ${emFirst(data.emName) ?? "the Event Manager team"}`}
      </HelpButton>
      <p className="-mt-2 text-center text-[12px] leading-[18px] text-[#71717b]">{help}</p>
    </div>
  );
}
