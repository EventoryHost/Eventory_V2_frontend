"use client";

import { useState } from "react";
import { Loader2, Star, TriangleAlert } from "lucide-react";
import { TICKET_TYPES, categoryOf } from "../data/ticketTypes";
import { ticketService } from "../services/ticketService";
import { navigateSupport } from "../store";
import type { SupportContext, TicketType } from "../types";
import AttachmentPicker from "./AttachmentPicker";
import ContextChips, { BookingStrip } from "./ContextChips";
import { CATEGORY_ICON, TYPE_ICON } from "./icons";
import { Chip, SectionLabel } from "./ui";

function toDateInput(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

const INPUT =
  "h-11 w-full rounded-xl border border-[#E4E4E7] bg-white px-3.5 font-figtree text-[14px] text-[#09090B] outline-none placeholder:text-[#9F9FA9] focus:border-[#F0596F]";

export default function SupportCompose({
  type,
  categoryId,
  initialTopic,
  context,
}: {
  type: TicketType;
  categoryId?: string;
  initialTopic?: string;
  context: SupportContext;
}) {
  const def = TICKET_TYPES[type];
  const category = categoryOf(type, categoryId);
  const Icon = CATEGORY_ICON[category.id] ?? TYPE_ICON[type];
  const isGrievance = def.group === "grievance";

  const [topic, setTopic] = useState<string | undefined>(
    initialTopic && category.subtopics.includes(initialTopic) ? initialTopic : undefined
  );
  const packages = context.packages ?? [];
  const [packageIndex, setPackageIndex] = useState<number | null>(packages.length === 1 ? 0 : null);
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of def.fields ?? []) {
      const fromContext = field.contextKey ? context[field.contextKey] : undefined;
      if (fromContext) initial[field.id] = field.kind === "date" ? toDateInput(fromContext) : fromContext;
      else if (field.kind === "select" && !field.optional && field.options) initial[field.id] = field.options[0];
    }
    return initial;
  });
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showEvidence = Boolean(category.evidence || def.evidence);
  const needsPackage = def.packagePicker === "required" && packages.length > 0;
  const missingFields = (def.fields ?? []).filter((f) => !f.optional && !fields[f.id]?.trim());

  const ready =
    !isSubmitting &&
    missingFields.length === 0 &&
    (!needsPackage || packageIndex !== null) &&
    (category.rating ? rating > 0 : category.subtopics.length === 0 || Boolean(topic)) &&
    (isGrievance ? Boolean(description.trim() || files.length || rating) : Boolean(description.trim() || topic));

  async function submit() {
    if (!ready) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const pkg = packageIndex !== null ? packages[packageIndex] : undefined;
      const ticket = await ticketService.createTicket({
        type,
        category: category.id,
        topic: category.rating ? `Rated ${rating}/5` : topic,
        description,
        rating: category.rating ? rating : undefined,
        fields: { ...fields, ...(pkg ? { package: `${pkg.name}${pkg.vendorName ? ` · ${pkg.vendorName}` : ""}` } : {}) },
        context,
        attachments: files,
      });
      navigateSupport({ screen: "ticket", ticketId: ticket.id }, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't raise that ticket. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-wrap gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-figtree text-[13px] font-bold ${
              isGrievance && type === "event_day_issue"
                ? "border-[#FFCAC5] bg-[#FFF2F1] text-[#C81E0D]"
                : "border-[#E4E4E7] bg-[#F4F4F5] text-[#09090B]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {def.categories.length > 1 ? category.label : def.label}
          </span>
          {packageIndex !== null && packages[packageIndex] && (
            <span className="rounded-full border border-[#E4E4E7] bg-[#F4F4F5] px-3 py-1.5 font-figtree text-[13px] font-semibold text-[#3F3F47]">
              Package {packageIndex + 1}
              {packages[packageIndex].status ? ` · ${packages[packageIndex].status}` : ""}
            </span>
          )}
        </div>
        <BookingStrip context={context} />
      </div>

      {category.notice && (
        <div className="flex gap-2 rounded-xl border border-[#FEE685] bg-[#FFFBEB] p-3 font-figtree text-[13px] leading-[18px] text-[#BB4D00]">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {category.notice}
        </div>
      )}

      {def.packagePicker && packages.length > 1 && (
        <div>
          <SectionLabel hint={def.packagePicker === "optional" ? "optional" : undefined}>
            {def.packagePicker === "required" ? "Which package is this about?" : "About a specific package?"}
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            {def.packagePicker === "optional" && (
              <Chip selected={packageIndex === null} onClick={() => setPackageIndex(null)}>
                General
              </Chip>
            )}
            {packages.map((pkg, index) => (
              <Chip key={pkg.id} selected={packageIndex === index} onClick={() => setPackageIndex(index)}>
                {pkg.name}
                {pkg.status ? ` · ${pkg.status}` : ""}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {def.fields && def.fields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {def.fields.map((field) => (
            <label key={field.id} className={`block ${field.kind === "text" && field.id === "location" ? "col-span-2" : ""} ${def.fields!.length === 1 ? "col-span-2" : ""}`}>
              <span className="mb-1.5 block font-figtree text-[12.5px] font-semibold text-[#3F3F47]">
                {field.label}
                {field.optional && <span className="ml-1 font-normal text-[#9F9FA9]">(optional)</span>}
              </span>
              {field.kind === "select" ? (
                <select
                  value={fields[field.id] ?? ""}
                  onChange={(e) => setFields({ ...fields, [field.id]: e.target.value })}
                  className={INPUT}
                >
                  {field.optional && <option value="">Select</option>}
                  {!field.optional && !fields[field.id] && <option value="">Select</option>}
                  {field.options?.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                  {fields[field.id] && !field.options?.includes(fields[field.id]) && <option>{fields[field.id]}</option>}
                </select>
              ) : (
                <input
                  type={field.kind === "date" ? "date" : "text"}
                  value={fields[field.id] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => setFields({ ...fields, [field.id]: e.target.value })}
                  className={INPUT}
                />
              )}
            </label>
          ))}
        </div>
      )}

      {category.rating && (
        <div>
          <SectionLabel>{category.description}</SectionLabel>
          <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`Rate ${n}`}
                onClick={() => setRating(n)}
                className="p-0.5"
              >
                <Star
                  className={`h-9 w-9 ${n <= rating ? "fill-[#F5A524] text-[#F5A524]" : "text-[#D4D4D8]"}`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {category.subtopics.length > 0 && (
        <div>
          <SectionLabel>What is this about?</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {category.subtopics.map((sub) => (
              <Chip key={sub} selected={topic === sub} onClick={() => setTopic(sub)}>
                {sub}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionLabel>{isGrievance ? (category.rating ? "Tell us more" : "Tell us what happened") : "Your question"}</SectionLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={category.placeholder}
          rows={4}
          data-testid="support-description"
          className="w-full resize-y rounded-xl border border-[#E4E4E7] bg-white px-3.5 py-3 font-figtree text-[14px] text-[#09090B] outline-none placeholder:text-[#9F9FA9] focus:border-[#F0596F]"
        />
      </div>

      {showEvidence && (
        <div>
          <SectionLabel hint={isGrievance ? undefined : "optional"}>
            {isGrievance ? "Add evidence" : "Attach a screenshot"}
          </SectionLabel>
          <AttachmentPicker files={files} onChange={setFiles} />
          {isGrievance && !category.rating && (
            <p className="mt-2 font-figtree text-[12px] text-[#9F9FA9]">
              Add a description or a photo/video — at least one is needed.
            </p>
          )}
        </div>
      )}

      <ContextChips
        context={{
          ...context,
          eventType: fields.eventType ?? context.eventType,
          eventDate: fields.eventDate || context.eventDate,
          location: fields.location || context.location,
        }}
      />

      {error && <p className="font-figtree text-[13px] text-[#C81E0D]">{error}</p>}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={!ready}
          onClick={submit}
          data-testid="support-submit"
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-full font-figtree text-[15px] font-bold text-white transition-colors disabled:bg-[#F4F4F5] disabled:text-[#9F9FA9] ${
            type === "event_day_issue" ? "bg-[#C81E0D] hover:bg-[#A8180A]" : "bg-[#F0596F] hover:bg-[#EA1D3B]"
          }`}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {def.submitLabel}
        </button>
        <p className="text-center font-figtree text-[12px] text-[#9F9FA9]">
          Goes to {def.routedTo} · {def.sla}
        </p>
      </div>
    </div>
  );
}
