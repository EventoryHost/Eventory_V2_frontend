"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Plus, Trash2, X } from "lucide-react";
import type { ColourOption, IncludedItemEntry, IncludedItemLine, WorkshopCategoryDef } from "../types";
import { WORKSHOP_CATEGORIES, WORKSHOP_CATEGORY_ICONS } from "../data/workshopCategories";
import type { UseCustomizeWorkshopResult } from "../hooks/useCustomizeWorkshop";

type FooterPhase = "idle" | "processing" | "committed";

const NEW_ITEM_SLOT = "__new__";

function colourLabel(ids: string[] | undefined, options: ColourOption[] | undefined) {
  if (!ids || !ids.length || !options) return "None";
  return ids.map((id) => options.find((o) => o.id === id)?.label ?? id).join(", ");
}

export default function CustomizeWorkshopModal({
  setup,
  items,
  workshop,
  initialItemId,
  onClose,
}: {
  setup: IncludedItemEntry;
  items: IncludedItemLine[];
  workshop: UseCustomizeWorkshopResult;
  initialItemId?: string;
  onClose: () => void;
}) {
  const [selectedItemId, setSelectedItemId] = useState(initialItemId ?? items[0]?.id ?? NEW_ITEM_SLOT);
  const [phase, setPhase] = useState<FooterPhase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const setupRequests = workshop.requests.filter((r) => r.setupId === setup.id);
  const requestCount = setupRequests.length;
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function flash() {
    timers.current.forEach(clearTimeout);
    setPhase("processing");
    timers.current = [
      setTimeout(() => setPhase("committed"), 280),
      setTimeout(() => setPhase("idle"), 1800),
    ];
  }

  function setType(type: string) {
    if (!selectedItem) return;
    workshop.setType(setup.id, selectedItem.id, type);
    flash();
  }

  function toggleColour(colourId: string) {
    if (!selectedItem) return;
    workshop.toggleColour(setup.id, selectedItem.id, colourId);
    flash();
  }

  function setQuantity(qty: number) {
    if (!selectedItem) return;
    workshop.setQuantity(setup.id, selectedItem.id, qty);
    flash();
  }

  function handleRemoveClick() {
    if (!selectedItem) return;
    if (selectedItem.isNew) {
      const fallback = items.find((i) => i.id !== selectedItem.id)?.id ?? NEW_ITEM_SLOT;
      workshop.cancelAdd(setup.id, selectedItem.id);
      setSelectedItemId(fallback);
    } else {
      workshop.requestRemoval(setup.id, selectedItem.id);
      flash();
    }
  }

  function cancelRemoval() {
    if (!selectedItem) return;
    workshop.cancelRemoval(setup.id, selectedItem.id);
  }

  function pickCategory(category: WorkshopCategoryDef) {
    const id = workshop.addItem(setup.id, category);
    setSelectedItemId(id);
    flash();
  }

  const footerLabel =
    phase === "processing"
      ? "Adding request"
      : phase === "committed"
        ? "Request added"
        : requestCount > 0
          ? `${requestCount} request${requestCount === 1 ? "" : "s"}`
          : "No changes yet";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="flex h-[min(640px,90vh)] w-full max-w-[880px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex w-[260px] shrink-0 flex-col border-r border-black/10 bg-black/[0.02]">
          <div className="border-b border-black/10 px-4 py-4">
            <div className="font-figtree text-[11px] font-semibold tracking-wide text-neutral-tertiary uppercase">
              Choose an item
            </div>
            <div className="mt-0.5 font-figtree text-[13px] text-neutral-secondary">{setup.title}</div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {items.map((item) => {
              const request = setupRequests.find((r) => r.itemId === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition ${
                    item.id === selectedItemId ? "bg-white" : "hover:bg-white/60"
                  }`}
                >
                  <span>
                    <span
                      className={`block font-figtree text-[13px] font-medium ${
                        request?.requestType === "remove" ? "text-neutral-tertiary line-through" : "text-brand-950"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.type && (
                      <span className="mt-0.5 block font-figtree text-[11px] text-neutral-tertiary">
                        {item.category} · {item.type}
                      </span>
                    )}
                  </span>
                  {request && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden />}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setSelectedItemId(NEW_ITEM_SLOT)}
              className={`flex w-full items-center gap-2 px-4 py-3 text-left font-figtree text-[13px] font-medium transition ${
                selectedItemId === NEW_ITEM_SLOT ? "bg-white text-brand-primary" : "text-brand-primary hover:bg-white/60"
              }`}
            >
              <Plus className="h-4 w-4" /> Add an item
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-end border-b border-black/10 px-4 py-3">
            <button type="button" onClick={onClose} className="rounded-full p-1.5 text-neutral-tertiary hover:bg-black/5">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {selectedItem ? (
              selectedItem.removalRequested ? (
                <RemovalPanel item={selectedItem} onCancel={cancelRemoval} />
              ) : (
                <AttributeEditor item={selectedItem} onRemove={handleRemoveClick} onSetType={setType} onToggleColour={toggleColour} onSetQuantity={setQuantity} />
              )
            ) : (
              <CategoryGrid onPick={pickCategory} />
            )}
          </div>

          <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">
            <div className="flex items-center gap-2 font-figtree text-[13px] font-medium">
              {phase === "processing" ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              ) : phase === "committed" ? (
                <Check className="h-4 w-4 text-amber-600" />
              ) : (
                <span className={`h-2 w-2 rounded-full ${requestCount > 0 ? "bg-amber-500" : "bg-black/20"}`} />
              )}
              <span className={phase === "processing" ? "text-neutral-tertiary" : "text-brand-950"}>{footerLabel}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-black/15 px-4 py-2 font-figtree text-[13px] font-semibold text-brand-950 transition hover:border-black/30"
            >
              Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttributeEditor({
  item,
  onRemove,
  onSetType,
  onToggleColour,
  onSetQuantity,
}: {
  item: IncludedItemLine;
  onRemove: () => void;
  onSetType: (type: string) => void;
  onToggleColour: (colourId: string) => void;
  onSetQuantity: (qty: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-figtree text-[18px] font-bold text-brand-950">{item.label}</h3>
          <p className="mt-1 font-figtree text-[13px] text-neutral-secondary">
            Pick different options to request a change. Your setup stays as-is until the vendor confirms.
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 font-figtree text-[12px] font-medium text-neutral-secondary transition hover:border-red-200 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remove
        </button>
      </div>

      {item.typeOptions && item.typeOptions.length > 0 && (
        <div>
          <div className="mb-2 font-figtree text-[12px] font-semibold text-neutral-tertiary">{item.typeLabel}</div>
          <div className="flex flex-wrap gap-2">
            {item.typeOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSetType(option)}
                className={`rounded-full border px-3 py-1.5 font-figtree text-[13px] transition ${
                  item.type === option
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-black/15 text-brand-950 hover:border-black/30"
                }`}
              >
                {option}
                {option === item.originalType && <span className="ml-1 text-[10px] text-neutral-tertiary">(original)</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {item.colourOptions && item.colourOptions.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="font-figtree text-[12px] font-semibold text-neutral-tertiary">Colours</span>
            {item.originalColours && item.originalColours.length > 0 && (
              <span className="font-figtree text-[11px] text-neutral-tertiary">
                Original: {colourLabel(item.originalColours, item.colourOptions)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {item.colourOptions.map((colour) => {
              const selected = item.colours?.includes(colour.id);
              return (
                <button
                  key={colour.id}
                  type="button"
                  onClick={() => onToggleColour(colour.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-figtree text-[13px] transition ${
                    selected
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : "border-black/15 text-brand-950 hover:border-black/30"
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: colour.swatch }} />
                  {colour.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 font-figtree text-[12px] font-semibold text-neutral-tertiary">Quantity</div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSetQuantity(item.qty - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 font-figtree text-[16px] text-brand-950 hover:border-black/30"
          >
            −
          </button>
          <span className="w-8 text-center font-figtree text-[15px] font-semibold text-brand-950">{item.qty}</span>
          <button
            type="button"
            onClick={() => onSetQuantity(item.qty + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 font-figtree text-[16px] text-brand-950 hover:border-black/30"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function RemovalPanel({ item, onCancel }: { item: IncludedItemLine; onCancel: () => void }) {
  return (
    <div className="space-y-4">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 font-figtree text-[12px] font-semibold text-amber-700">
          Removal requested
        </span>
        <h3 className="mt-3 font-figtree text-[18px] font-bold text-brand-950 line-through decoration-2">{item.label}</h3>
        <button type="button" onClick={onCancel} className="mt-1 font-figtree text-[13px] font-semibold text-brand-primary hover:underline">
          Cancel request
        </button>
      </div>
      <div className="rounded-xl bg-amber-50 px-4 py-3 font-figtree text-[13px] text-amber-800">
        Editing is paused while this item is set to be removed. Cancel the request to edit again.
      </div>
      {item.typeOptions && item.typeOptions.length > 0 && (
        <div className="pointer-events-none opacity-40">
          <div className="mb-2 font-figtree text-[12px] font-semibold text-neutral-tertiary">{item.typeLabel}</div>
          <div className="flex flex-wrap gap-2">
            {item.typeOptions.map((option) => (
              <span key={option} className="rounded-full border border-black/15 px-3 py-1.5 font-figtree text-[13px] text-brand-950">
                {option}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryGrid({ onPick }: { onPick: (category: WorkshopCategoryDef) => void }) {
  return (
    <div>
      <h3 className="font-figtree text-[16px] font-bold text-brand-950">New item</h3>
      <p className="mt-1 font-figtree text-[13px] text-neutral-secondary">Choose an item of your choice to add to the setup.</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {WORKSHOP_CATEGORIES.map((category) => {
          const Icon = WORKSHOP_CATEGORY_ICONS[category.id];
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onPick(category)}
              className="flex flex-col items-center gap-2 rounded-xl border border-black/10 px-3 py-4 text-center transition hover:border-brand-primary hover:bg-brand-primary/5"
            >
              {Icon && <Icon className="h-5 w-5 text-brand-950" />}
              <span className="font-figtree text-[12px] font-medium text-brand-950">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
