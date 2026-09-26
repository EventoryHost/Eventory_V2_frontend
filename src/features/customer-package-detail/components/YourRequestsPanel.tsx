import { Trash2 } from "lucide-react";
import type { CustomizeRequest } from "../types";

const TYPE_LABEL: Record<CustomizeRequest["requestType"], string> = {
  change: "Change",
  add: "Adding",
  remove: "Removing",
};

interface FieldRow {
  label: string;
  from?: string;
  to: string;
}

// "Change" rows — diffs current vs. original attribute values.
function changedFields(item: CustomizeRequest["item"]): FieldRow[] {
  const fields: FieldRow[] = [];
  if (item.type !== undefined && item.type !== item.originalType) {
    fields.push({ label: item.typeLabel ?? "Type", from: item.originalType ?? "—", to: item.type });
  }
  if (item.qty !== item.originalQty) {
    fields.push({ label: "Qty", from: String(item.originalQty), to: String(item.qty) });
  }
  if (item.volume !== undefined && item.volume !== item.originalVolume) {
    fields.push({ label: "Volume", from: item.originalVolume ?? "—", to: item.volume });
  }
  if (item.colours && item.originalColours) {
    const before = item.colours.slice().sort().join(",");
    const after = item.originalColours.slice().sort().join(",");
    if (before !== after) {
      const labelOf = (id: string) => item.colourOptions?.find((c) => c.id === id)?.label ?? id;
      fields.push({
        label: "Colour",
        from: item.originalColours.map(labelOf).join(", ") || "None",
        to: item.colours.map(labelOf).join(", ") || "None",
      });
    }
  }
  return fields;
}

// "Add" rows — the new item's own attribute values, no "from" to diff against.
function newItemFields(item: CustomizeRequest["item"]): FieldRow[] {
  const fields: FieldRow[] = [];
  if (item.type !== undefined) fields.push({ label: item.typeLabel ?? "Type", to: item.type });
  if (item.volume !== undefined) fields.push({ label: "Volume", to: item.volume });
  if (item.colours && item.colours.length > 0) {
    const labelOf = (id: string) => item.colourOptions?.find((c) => c.id === id)?.label ?? id;
    fields.push({ label: "Colour", to: item.colours.map(labelOf).join(", ") });
  }
  return fields;
}

export default function YourRequestsPanel({
  requests,
  onDismiss,
}: {
  requests: CustomizeRequest[];
  onDismiss: (request: CustomizeRequest) => void;
}) {
  if (requests.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl bg-[#FFFBEB] p-4">
      <div className="flex items-center gap-2">
        <span className="font-figtree text-[13px] font-semibold text-[#3F3F47]">Your requests</span>
        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#BB4D00] font-figtree text-[11px] font-bold text-white">
          {requests.length}
        </span>
      </div>
      <p className="mt-1 mb-3 font-figtree text-[12px] leading-[18px] font-normal text-[#71717B]">
        The vendor will see these requests and get back to you after booking.
      </p>

      <ul className="space-y-3">
        {requests.map((request) => {
          const fields = request.requestType === "change" ? changedFields(request.item) : newItemFields(request.item);
          return (
            <li key={request.key} className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4">
              <div className="min-w-0">
                {request.requestType !== "add" && (
                  <p className="font-figtree text-[14px] font-bold text-[#0F172A]">{request.setupTitle}</p>
                )}
                {request.requestType === "remove" ? (
                  <p className="mt-1 font-figtree text-[13px] text-[#71717B] line-through">{request.item.label}</p>
                ) : (
                  <div className="mt-1 space-y-0.5">
                    {fields.map((field) => (
                      <p key={field.label} className="font-figtree text-[13px] text-[#71717B]">
                        {field.label}:{" "}
                        {field.from && <span className="line-through">{field.from}</span>}{" "}
                        <span className="font-semibold text-[#0F172A]">{field.to}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="flex h-[22px] items-center justify-center rounded-full bg-[#F4F4F5] px-2 font-figtree text-[12px] font-medium tracking-[0.02em] text-[#3F3F47] uppercase">
                  {TYPE_LABEL[request.requestType]}
                </span>
                <button
                  type="button"
                  onClick={() => onDismiss(request)}
                  aria-label="Dismiss request"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#3F3F47] transition-colors hover:bg-black/5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
