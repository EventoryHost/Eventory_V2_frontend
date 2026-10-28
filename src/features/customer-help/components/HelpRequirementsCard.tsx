"use client";

import { useEffect, useRef } from "react";
import {
  AREA_OPTIONS,
  BUDGET_OPTIONS,
  GUEST_OPTIONS,
  REQUIREMENT_OCCASIONS,
  SERVICE_OPTIONS,
  type ParsedRequest,
} from "../assistant/parseRequest";
import {
  LOCATION_TAG,
  dateLabel,
  type RequirementField,
  type ThreadItem,
} from "../assistant/useHelpConversation";
import HelpButton from "./HelpButton";
import HelpChip from "./HelpChip";
import { scrollWithinPanel } from "./scrollWithinPanel";

// v6f4 "Your requirements": one card per chat, chip input only, kept as
// the chat moves on. Read view lists what's set (the three must-haves
// always, "Not given" when missing) with "+ Add …" for the optional
// ones; Edit turns it into chip groups. Before a photo's actions only the
// must-haves are asked, and the button reads "Continue".
type Item = Extract<ThreadItem, { kind: "requirements" }>;

type Props = {
  item: Item;
  /** The site's location tag, when it's an area we serve. */
  locationTag: { label: string } | null;
  onConfirm: () => void;
  onEdit: (field?: RequirementField) => void;
  onSet: (field: RequirementField, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

const LABEL = "font-figtree text-[14px] font-normal leading-[20px]";

type Row = { field: RequirementField; label: string; value?: string; required: boolean };

function rows(req: ParsedRequest): Row[] {
  return [
    { field: "occasion", label: "Occasion", value: req.occasion?.label, required: true },
    {
      field: "service",
      label: "Service",
      value: req.service && req.service.label !== "Not sure yet" ? req.service.label : undefined,
      required: false,
    },
    { field: "guests", label: "Guests", value: req.guests?.label, required: true },
    { field: "budget", label: "Budget", value: req.budget?.label, required: true },
    {
      field: "area",
      label: "Area",
      value: req.area && `${req.area.label}${req.area.fromLocation ? " · your location" : ""}`,
      required: false,
    },
    { field: "date", label: "Date", value: dateLabel(req.date) || undefined, required: false },
  ];
}

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function HelpRequirementsCard({ item, locationTag, onConfirm, onEdit, onSet, onSave, onCancel }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const editing = item.state === "edit";
  const e = item.edit ?? item.req;
  const photoStep = Boolean(item.photo);

  // "+ Add date" opens the editor on that field, scrolled into view.
  useEffect(() => {
    if (!editing) return;
    const el = item.focus
      ? cardRef.current?.querySelector<HTMLElement>(`[data-field="${item.focus}"]`)
      : cardRef.current;
    if (el) scrollWithinPanel(el, item.focus ? "center" : "start");
  }, [editing, item.focus]);

  const group = (
    field: RequirementField,
    label: string,
    options: { value: string; label: string; selected: boolean }[],
    optional: boolean,
  ) => {
    const missing = item.showErrors && !optional && !options.some((o) => o.selected);
    return (
      <div
        data-field={field}
        className={`flex w-full flex-col gap-1.5 rounded-[8px] ${item.focus === field ? "bg-[#eff6ff] ring-8 ring-[#eff6ff]" : ""}`}
      >
        <p className={`${LABEL} ${missing ? "text-[#c81e0d]" : "text-[#3f3f47]"}`}>
          {label}
          {optional && <span className="text-[12px] text-[#71717b]"> (optional)</span>}
          {missing && " · pick one"}
        </p>
        <div className="flex w-full flex-wrap gap-1.5">
          {options.map((o) => (
            <HelpChip key={o.value} label={o.label} selected={o.selected} onClick={() => onSet(field, o.value)} />
          ))}
        </div>
      </div>
    );
  };

  const pill = editing ? (
    <span className="rounded-full bg-[#f4f4f5] px-2 font-figtree text-[12px] leading-[18px] text-[#3f3f47]">Editing</span>
  ) : item.state === "confirmed" ? (
    <span className="rounded-full bg-[#f0fdf4] px-2 font-figtree text-[12px] leading-[18px] text-[#008236]">Confirmed</span>
  ) : null;

  const areaOptions = [
    ...(locationTag
      ? [{ value: LOCATION_TAG, label: `${locationTag.label} (your location)`, selected: Boolean(e.area?.fromLocation) }]
      : []),
    // A typed area that isn't one of the chips stays as its own chip.
    ...(e.area && !e.area.fromLocation && !AREA_OPTIONS.some((a) => a.label === e.area?.label)
      ? [{ value: e.area.label, label: e.area.label, selected: true }]
      : []),
    ...AREA_OPTIONS.filter((a) => !locationTag?.label.includes(a.label)).map((a) => ({
      value: a.label,
      label: a.label,
      selected: !e.area?.fromLocation && e.area?.label === a.label,
    })),
  ];

  return (
    <div ref={cardRef} className="flex w-full flex-col overflow-hidden rounded-[16px] border border-[#e4e4e7] bg-white font-figtree">
      <div className="flex items-center gap-2 border-b border-[#e4e4e7] px-3.5 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/customer/help/doc.svg" alt="" width={20} height={20} className="block" />
        <p className="flex-1 text-[14px] font-semibold leading-[20px] text-[#030303]">Your requirements</p>
        {pill}
      </div>

      {!editing ? (
        <>
          <dl className="grid grid-cols-[90px_minmax(0,1fr)]">
            {rows(item.req)
              .filter((r) => r.value || r.required)
              .map((r, i) => (
                <div key={r.field} className="contents">
                  <dt className={`py-2 pl-3.5 text-[14px] leading-[20px] text-[#71717b] ${i ? "border-t border-[#e4e4e7]" : ""}`}>
                    {r.label}
                  </dt>
                  <dd className={`py-2 pl-2 pr-3.5 text-[14px] leading-[20px] text-[#030303] break-words ${i ? "border-t border-[#e4e4e7]" : ""}`}>
                    {r.value ?? (
                      <span className="rounded-full bg-[#fffbeb] px-2 text-[12px] leading-[18px] text-[#bb4d00]">Not given</span>
                    )}
                  </dd>
                </div>
              ))}
          </dl>
          {rows(item.req).some((r) => !r.value && !r.required) && (
            <div className="flex flex-wrap gap-2 border-t border-[#e4e4e7] px-3.5 py-2.5">
              {rows(item.req)
                .filter((r) => !r.value && !r.required)
                .map((r) => (
                  <button
                    key={r.field}
                    type="button"
                    onClick={() => onEdit(r.field)}
                    className="rounded-full bg-[#f4f4f5] px-3 py-1 text-[13px] leading-[20px] text-[#18181b]"
                  >
                    + Add {r.label.toLowerCase()}
                  </button>
                ))}
            </div>
          )}
          {item.state === "confirmed" ? (
            <div className="flex items-center gap-2 border-t border-[#e4e4e7] bg-[#fafafa] px-3.5 py-3">
              <p className="flex-1 text-[12px] leading-[18px] text-[#71717b]">Change anything and I’ll search again.</p>
              <HelpButton variant="tertiary" onClick={() => onEdit()}>
                Edit
              </HelpButton>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 border-t border-[#e4e4e7] bg-[#fafafa] px-3.5 py-3">
              <HelpButton onClick={onConfirm}>Looks right, find packages</HelpButton>
              <HelpButton variant="secondary" onClick={() => onEdit()}>
                Edit
              </HelpButton>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 p-3.5">
            {group(
              "occasion",
              "Occasion",
              REQUIREMENT_OCCASIONS.map((o) => ({ value: o.label, label: o.label, selected: e.occasion?.label === o.label })),
              false,
            )}
            {group(
              "guests",
              "Guests",
              GUEST_OPTIONS.map((o) => ({ value: o.label, label: o.label, selected: e.guests?.label === `${o.label} guests` })),
              false,
            )}
            {group(
              "budget",
              "Budget",
              BUDGET_OPTIONS.map((o) => ({ value: o.label, label: o.label, selected: e.budget?.label === o.label })),
              false,
            )}
            {!photoStep && (
              <>
                <p className="text-[11px] uppercase leading-[16px] tracking-[0.4px] text-[#71717b]">Optional · narrows the results</p>
                {group(
                  "service",
                  "Service",
                  SERVICE_OPTIONS.map((o) => ({ value: o.label, label: o.label, selected: e.service?.label === o.label })),
                  true,
                )}
                {group("area", "Area", areaOptions, true)}
                <div
                  data-field="date"
                  className={`flex w-full flex-col gap-1.5 rounded-[8px] ${item.focus === "date" ? "bg-[#eff6ff] ring-8 ring-[#eff6ff]" : ""}`}
                >
                  <p className={`${LABEL} text-[#3f3f47]`}>
                    Date <span className="text-[12px] text-[#71717b]">(optional · we’ll check availability)</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <HelpChip label="Not decided yet" selected={!e.date} onClick={() => onSet("date", "")} />
                    <label
                      className={`relative flex min-h-8 cursor-pointer items-center rounded-full border px-4 py-[5px] text-[14px] leading-[20px] ${
                        e.date ? "border-[#09090b] bg-[#030303] text-[#fafafa]" : "border-[#f4f4f5] bg-[#f4f4f5] text-[#18181b]"
                      }`}
                    >
                      {e.date ? dateLabel(e.date) : "Pick a date"}
                      <input
                        type="date"
                        min={todayIso()}
                        value={e.date ?? ""}
                        aria-label="Event date"
                        onChange={(ev) => onSet("date", ev.target.value)}
                        onClick={(ev) => {
                          try {
                            ev.currentTarget.showPicker();
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
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-[#e4e4e7] bg-[#fafafa] px-3.5 py-3">
            <HelpButton onClick={onSave} disabled={!e.occasion || !e.guests || !e.budget} className="disabled:opacity-45">
              {photoStep ? "Continue" : "Save and find packages"}
            </HelpButton>
            {item.prev && (
              <HelpButton variant="tertiary" onClick={onCancel}>
                Cancel
              </HelpButton>
            )}
          </div>
        </>
      )}
    </div>
  );
}
