import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { CustomizeRequest } from "../types";

const TYPE_META: Record<CustomizeRequest["requestType"], { label: string; icon: typeof Pencil }> = {
  change: { label: "Change", icon: Pencil },
  add: { label: "Adding", icon: Plus },
  remove: { label: "Removing", icon: Trash2 },
};

interface ChangedField {
  label: string;
  from: string;
  to: string;
}

function changedFields(item: CustomizeRequest["item"]): ChangedField[] {
  const fields: ChangedField[] = [];
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

export default function YourRequestsPanel({
  requests,
  onDismiss,
}: {
  requests: CustomizeRequest[];
  onDismiss: (request: CustomizeRequest) => void;
}) {
  if (requests.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 font-figtree text-[13px] font-semibold text-amber-800">
        Your requests · {requests.length}
      </div>
      <ul className="space-y-2">
        {requests.map((request) => {
          const meta = TYPE_META[request.requestType];
          const Icon = meta.icon;
          return (
            <li key={request.key} className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2.5 font-figtree text-[13px]">
              <div className="flex min-w-0 items-start gap-2.5">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      {meta.label}
                    </span>
                    <span className={`font-medium text-brand-950 ${request.requestType === "remove" ? "line-through" : ""}`}>
                      {request.item.label}
                    </span>
                  </div>
                  {request.requestType === "change" && (
                    <div className="mt-1 space-y-0.5 text-neutral-secondary">
                      {changedFields(request.item).map((field) => (
                        <div key={field.label}>
                          {field.label}: <span className="line-through">{field.from}</span> →{" "}
                          <span className="font-semibold text-brand-950">{field.to}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(request)}
                className="shrink-0 rounded-full p-1 text-neutral-tertiary hover:bg-black/5"
                aria-label="Dismiss request"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
