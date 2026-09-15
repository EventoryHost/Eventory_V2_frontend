"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, Plus, Trash2 } from "lucide-react";
import type { ColourOption, IncludedItemEntry, IncludedItemLine, WorkshopCategoryDef } from "../types";
import { WORKSHOP_CATEGORIES, WORKSHOP_CATEGORY_IMAGES } from "../data/workshopCategories";
import type { UseCustomizeWorkshopResult } from "../hooks/useCustomizeWorkshop";
import SetupDetailPanel from "./SetupDetailPanel";
import QuantityInput from "./QuantityInput";

type FooterPhase = "idle" | "processing" | "committed";
type ModalView = "detail" | "customize";

const NEW_ITEM_SLOT = "__new__";

function colourLabel(ids: string[] | undefined, options: ColourOption[] | undefined) {
  if (!ids || !ids.length || !options) return "None";
  return ids.map((id) => options.find((o) => o.id === id)?.label ?? id).join(", ");
}

// The checkmark needs to stay legible on both dark swatches (Maroon, Navy)
// and light ones (White, Cream) — a fixed white check would vanish on the
// latter, so pick the check's color from the swatch's own brightness.
function isLightSwatch(hex: string): boolean {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return false;
  const value = parseInt(match[1], 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.7;
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
  const [view, setView] = useState<ModalView>(initialItemId ? "customize" : "detail");
  const [selectedItemId, setSelectedItemId] = useState(initialItemId ?? items[0]?.id ?? NEW_ITEM_SLOT);
  const [phase, setPhase] = useState<FooterPhase>("idle");
  const [isLeaveGuardOpen, setIsLeaveGuardOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const setupRequests = workshop.requests.filter((r) => r.setupId === setup.id);
  const requestCount = setupRequests.length;
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;

  // Every edit here is already live-committed to the parent's workshop state
  // (see useCustomizeWorkshop's design-doc comment), so closing never loses
  // data on its own — this guard is a deliberate "are you sure" checkpoint,
  // and "Don't save changes" reverts every pending request on THIS setup
  // back to original before closing.
  function requestClose() {
    if (setupRequests.length > 0) {
      setIsLeaveGuardOpen(true);
    } else {
      onClose();
    }
  }

  function discardAndClose() {
    setupRequests.forEach((request) => workshop.dismissRequest(request));
    setIsLeaveGuardOpen(false);
    onClose();
  }

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

  function setVolume(volume: string) {
    if (!selectedItem) return;
    workshop.setVolume(setup.id, selectedItem.id, volume);
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
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
          view === "detail" ? "h-[min(720px,90vh)] w-full max-w-[640px]" : "h-[min(640px,90vh)] w-full max-w-[880px]"
        }`}
      >
        {view === "detail" ? (
          <SetupDetailPanel
            setup={setup}
            items={items}
            requests={setupRequests}
            onDismissRequest={workshop.dismissRequest}
            onCustomize={() => setView("customize")}
            onCloseAttempt={requestClose}
            onSave={onClose}
          />
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-black/10 px-6 py-4">
              <button
                type="button"
                onClick={() => setView("detail")}
                aria-label="Back to setup"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-secondary transition hover:bg-black/5"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="font-figtree text-[16px] font-bold text-brand-950">Customize items</h2>
                <p className="font-figtree text-[12px] text-neutral-secondary">Customize your items and set preferences</p>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex w-[260px] shrink-0 flex-col border-r border-black/10 bg-[#F4F4F5]">
                <div className="border-b border-black/10 px-4 py-3 font-figtree text-[12px] leading-[18px] font-medium tracking-[0.02em] text-[#3F3F47] uppercase">
                  Choose an item
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                  {items.map((item) => {
                    const request = setupRequests.find((r) => r.itemId === item.id);
                    const subtitle = [item.category, item.type, item.volume].filter(Boolean).join(" · ");
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItemId(item.id)}
                        className={`flex w-full items-center justify-between gap-2 border-l-4 py-3 pr-4 pl-3.5 text-left transition ${
                          item.id === selectedItemId
                            ? "border-brand-950 bg-white"
                            : "border-transparent hover:bg-white/60"
                        }`}
                      >
                        <span>
                          <span
                            className={`block font-figtree text-[16px] leading-[24px] font-semibold ${
                              request?.requestType === "remove" ? "text-neutral-tertiary line-through" : "text-[#030303]"
                            }`}
                          >
                            {item.label}
                          </span>
                          {subtitle && (
                            <span className="mt-0.5 block font-figtree text-[12px] leading-[18px] font-normal text-[#71717B]">
                              {subtitle}
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
                    className={`flex w-full items-center justify-center gap-2 px-4 py-3 text-center font-figtree text-[16px] leading-[24px] font-medium text-[#EA1D3B] transition ${
                      selectedItemId === NEW_ITEM_SLOT ? "bg-white" : "hover:bg-white/60"
                    }`}
                  >
                    <Plus className="h-4 w-4" /> Add an item
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {selectedItem ? (
                    selectedItem.removalRequested ? (
                      <RemovalPanel item={selectedItem} onCancel={cancelRemoval} />
                    ) : (
                      <AttributeEditor
                        item={selectedItem}
                        onRemove={handleRemoveClick}
                        onSetType={setType}
                        onToggleColour={toggleColour}
                        onSetVolume={setVolume}
                        onSetQuantity={setQuantity}
                      />
                    )
                  ) : (
                    <CategoryGrid onPick={pickCategory} />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">
              <div className="flex items-center gap-2 font-figtree text-[12px] leading-[16px] font-semibold">
                {phase === "processing" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                ) : phase === "committed" ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-700">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </span>
                ) : (
                  <span className={`h-2 w-2 rounded-full ${requestCount > 0 ? "bg-amber-500" : "bg-black/20"}`} />
                )}
                <span
                  className={
                    phase === "processing" || requestCount > 0
                      ? "text-amber-600"
                      : phase === "committed"
                        ? "text-success-700"
                        : "text-[#9F9FA9]"
                  }
                >
                  {footerLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setView("detail")}
                className="rounded-full border border-black/15 px-4 py-2 font-figtree text-[13px] font-semibold text-brand-950 transition hover:border-black/30"
              >
                Back to Setup
              </button>
            </div>
          </>
        )}

        {isLeaveGuardOpen && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-[360px] rounded-2xl bg-white p-6 text-center shadow-xl">
              <h3 className="font-figtree text-[18px] font-bold text-brand-950">Leaving so soon?</h3>
              <p className="mt-2 font-figtree text-[13px] text-neutral-secondary">
                You have {setupRequests.length} pending request{setupRequests.length === 1 ? "" : "s"} for this setup.
                Continue editing, or leave without saving them.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveGuardOpen(false)}
                  className="rounded-xl bg-brand-primary py-2.5 font-figtree text-[13px] font-semibold text-white transition hover:bg-rose-600"
                >
                  Continue editing
                </button>
                <button
                  type="button"
                  onClick={discardAndClose}
                  className="rounded-xl py-2.5 font-figtree text-[13px] font-semibold text-neutral-secondary transition hover:text-brand-950"
                >
                  Don&apos;t save changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// footnote size/line-height per this codebase's own resolved fallback for
// that Figma token (see Step2SetupsAndPricing.tsx), 2% letter-spacing as
// specified, Medium weight, uppercase, #71717B.
const SECTION_HEADING = "font-figtree text-[12px] leading-[18px] font-medium tracking-[0.02em] uppercase text-[#71717B]";

function AttributeEditor({
  item,
  onRemove,
  onSetType,
  onToggleColour,
  onSetVolume,
  onSetQuantity,
}: {
  item: IncludedItemLine;
  onRemove: () => void;
  onSetType: (type: string) => void;
  onToggleColour: (colourId: string) => void;
  onSetVolume: (volume: string) => void;
  onSetQuantity: (qty: number) => void;
}) {
  const sections: React.ReactNode[] = [];

  if (item.typeOptions && item.typeOptions.length > 0) {
    sections.push(
      <div key="type">
        <div className={`mb-2 ${SECTION_HEADING}`}>{item.typeLabel}</div>
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
    );
  }

  if (item.colourOptions && item.colourOptions.length > 0) {
    sections.push(
      <div key="colour">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className={SECTION_HEADING}>Colours</span>
          <span className="font-figtree text-[12px] leading-[18px] font-normal normal-case text-neutral-tertiary">
            · Pick colors you would want in your setup
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          {item.colourOptions.map((colour) => {
            const selected = item.colours?.includes(colour.id);
            return (
              <button
                key={colour.id}
                type="button"
                onClick={() => onToggleColour(colour.id)}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full border transition ${
                    selected
                      ? "border-black/10 ring-[1.5px] ring-[#B4112A] ring-offset-2 ring-offset-white"
                      : "border-black/10"
                  }`}
                  style={{ backgroundColor: colour.swatch }}
                >
                  {selected && (
                    <Check
                      className={`h-6 w-6 ${isLightSwatch(colour.swatch) ? "text-brand-950" : "text-white"}`}
                      strokeWidth={3}
                    />
                  )}
                </span>
                <span className="font-figtree text-[12px] text-neutral-secondary">{colour.label}</span>
              </button>
            );
          })}
        </div>
        {item.originalColours && item.originalColours.length > 0 && (
          <p className="mt-3 font-figtree text-[12px] text-neutral-tertiary">
            Original: {colourLabel(item.originalColours, item.colourOptions)}
          </p>
        )}
      </div>
    );
  }

  if (item.volumeOptions && item.volumeOptions.length > 0) {
    sections.push(
      <div key="volume">
        <div className={`mb-2 ${SECTION_HEADING}`}>Volume</div>
        <div className="flex flex-wrap gap-2">
          {item.volumeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSetVolume(option)}
              className={`rounded-full border px-3 py-1.5 font-figtree text-[13px] transition ${
                item.volume === option
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-black/15 text-brand-950 hover:border-black/30"
              }`}
            >
              {option}
              {option === item.originalVolume && <span className="ml-1 text-[10px] text-neutral-tertiary">(original)</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  sections.push(
    <div key="quantity">
      <div className={`mb-2 ${SECTION_HEADING}`}>Quantity</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSetQuantity(item.qty - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 font-figtree text-[16px] text-brand-950 hover:border-black/30"
        >
          −
        </button>
        <QuantityInput
          value={item.qty}
          onChange={onSetQuantity}
          min={1}
          max={99}
          aria-label={`Quantity for ${item.label}`}
          className="w-10 rounded-md border border-transparent text-center font-figtree text-[15px] font-semibold text-brand-950 hover:border-black/15 focus:border-black/20 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onSetQuantity(item.qty + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 font-figtree text-[16px] text-brand-950 hover:border-black/30"
        >
          +
        </button>
      </div>
    </div>
  );

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

      {sections.map((section, i) => (
        <div key={i} className={i > 0 ? "border-t border-black/10 pt-6" : ""}>
          {section}
        </div>
      ))}
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
      <h3 className="font-figtree text-[20px] font-bold text-brand-950">New item</h3>
      <p className="mt-1 font-figtree text-[13px] text-neutral-secondary">Choose an item of your choice in the setup</p>
      <div className="mt-5 grid grid-cols-2 gap-4">
        {WORKSHOP_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onPick(category)}
            className="relative flex h-[100px] w-[206px] items-start overflow-hidden rounded-[11px] border-[0.92px] border-black/10 bg-white p-3 text-left transition hover:border-brand-primary hover:bg-brand-primary/5"
          >
            <span className="font-figtree text-[14px] font-semibold text-brand-950">{category.label}</span>
            <img
              src={WORKSHOP_CATEGORY_IMAGES[category.id]}
              alt=""
              className="pointer-events-none absolute right-1 bottom-1 h-[62px] w-[62px] object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
