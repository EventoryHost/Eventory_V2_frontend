"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, Plus, Trash2 } from "lucide-react";
import type { IncludedItemEntry, IncludedItemLine, WorkshopCategoryDef } from "../types";
import { WORKSHOP_CATEGORIES, WORKSHOP_CATEGORY_IMAGES } from "../data/workshopCategories";
import { EXTENDED_COLOUR_PALETTE } from "../data/extendedColorPalette";
import type { UseCustomizeWorkshopResult } from "../hooks/useCustomizeWorkshop";
import SetupDetailPanel from "./SetupDetailPanel";
import QuantityInput from "./QuantityInput";

type FooterPhase = "idle" | "processing" | "committed";
type ModalView = "detail" | "customize";

const NEW_ITEM_SLOT = "__new__";

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

  // Extended-palette colour pick (existing items only, multi-select) — the
  // only colour action here that counts as a real request.
  function toggleCustomColour(colourId: string) {
    if (!selectedItem) return;
    workshop.toggleCustomColour(setup.id, selectedItem.id, colourId);
    flash();
  }

  function clearCustomColours() {
    if (!selectedItem) return;
    workshop.clearCustomColours(setup.id, selectedItem.id);
  }

  // Vendor-palette pick from the item-details view (multi-select) — never a
  // request, so no flash() (that's reserved for actions that add/change a
  // pending request).
  function selectVendorColour(itemId: string, colourId: string) {
    workshop.toggleVendorColour(setup.id, itemId, colourId);
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
          view === "detail" ? "h-[min(720px,90vh)] w-full max-w-[640px]" : "h-[min(90vh,720px)] w-full max-w-[880px] sm:h-[min(640px,90vh)]"
        }`}
      >
        {view === "detail" ? (
          <SetupDetailPanel
            setup={setup}
            items={items}
            requests={setupRequests}
            onDismissRequest={workshop.dismissRequest}
            onSelectVendorColour={selectVendorColour}
            onCustomize={() => setView("customize")}
            onCloseAttempt={requestClose}
            onSave={onClose}
          />
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3 sm:px-6 sm:py-4">
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

            {/* Mobile: the item picker collapses into a horizontal chip strip
                above the editor (own row, capped height) instead of a fixed
                260px vertical sidebar sharing the same row — that sidebar
                left almost no width for the colour/quantity controls next to
                it on a phone-sized screen (real bug fixed 2026-10-01). From
                sm up, it reverts to the original vertical sidebar layout. */}
            <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
              <div className="flex max-h-[104px] w-full shrink-0 flex-col border-b border-black/10 bg-[#F4F4F5] sm:h-auto sm:max-h-none sm:w-[260px] sm:border-r sm:border-b-0">
                <div className="hidden border-b border-black/10 px-4 py-3 font-figtree text-[12px] leading-[18px] font-medium tracking-[0.02em] text-[#3F3F47] uppercase sm:block">
                  Choose an item
                </div>

                <div className="flex gap-2 overflow-x-auto px-3 py-2.5 sm:flex-1 sm:flex-col sm:gap-0 sm:overflow-x-hidden sm:overflow-y-auto sm:px-0 sm:py-2">
                  {items.map((item) => {
                    const request = setupRequests.find((r) => r.itemId === item.id);
                    const subtitle = [item.category, item.type, item.volume].filter(Boolean).join(" · ");
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedItemId(item.id)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-left transition sm:w-full sm:shrink sm:justify-between sm:gap-2 sm:rounded-none sm:border-y-0 sm:border-r-0 sm:border-l-4 sm:px-4 sm:py-3 sm:pl-3.5 ${
                          item.id === selectedItemId
                            ? "border-brand-950 bg-white sm:bg-white"
                            : "border-black/15 bg-white/60 hover:border-black/30 sm:border-transparent sm:bg-transparent sm:hover:bg-white/60"
                        }`}
                      >
                        <span>
                          <span
                            className={`block font-figtree text-[13px] leading-[18px] font-semibold whitespace-nowrap sm:text-[16px] sm:leading-[24px] sm:whitespace-normal ${
                              request?.requestType === "remove" ? "text-neutral-tertiary line-through" : "text-[#030303]"
                            }`}
                          >
                            {item.label}
                          </span>
                          {subtitle && (
                            <span className="mt-0.5 hidden font-figtree text-[12px] leading-[18px] font-normal text-[#71717B] sm:block">
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
                    className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-dashed border-[#EA1D3B]/40 px-3 py-1.5 text-center font-figtree text-[13px] leading-[18px] font-medium whitespace-nowrap text-[#EA1D3B] transition sm:w-full sm:rounded-none sm:border-none sm:px-4 sm:py-3 sm:text-[16px] sm:leading-[24px] sm:whitespace-normal ${
                      selectedItemId === NEW_ITEM_SLOT ? "bg-white" : "hover:bg-white/60"
                    }`}
                  >
                    <Plus className="h-4 w-4 shrink-0" /> Add an item
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                  {selectedItem ? (
                    selectedItem.removalRequested ? (
                      <RemovalPanel item={selectedItem} onCancel={cancelRemoval} />
                    ) : (
                      <AttributeEditor
                        item={selectedItem}
                        onRemove={handleRemoveClick}
                        onSetType={setType}
                        onToggleColour={toggleColour}
                        onToggleCustomColour={toggleCustomColour}
                        onClearCustomColours={clearCustomColours}
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

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/10 px-4 py-3 sm:px-6 sm:py-4">
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
  onToggleCustomColour,
  onClearCustomColours,
  onSetVolume,
  onSetQuantity,
}: {
  item: IncludedItemLine;
  onRemove: () => void;
  onSetType: (type: string) => void;
  onToggleColour: (colourId: string) => void;
  onToggleCustomColour: (colourId: string) => void;
  onClearCustomColours: () => void;
  onSetVolume: (volume: string) => void;
  onSetQuantity: (qty: number) => void;
}) {
  const sections: React.ReactNode[] = [];

  // Order: type, then volume, then quantity, then colour(s) last — colour
  // is the section most likely to need scrolling (up to 89 extended-palette
  // swatches), so it goes at the bottom rather than pushing the shorter,
  // quicker fields below the fold.
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

  // Volume (Low/Medium/High density — e.g. flowers) replaces the concept of
  // a countable quantity for that item, so no Quantity control is shown at
  // all when Volume applies (2026-10-01, product-confirmed) — same rule as
  // the read-only item-details view (SetupDetailPanel.tsx).
  if (!item.volumeOptions || item.volumeOptions.length === 0) {
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
            // Setup items are frequently measured in units like cm (e.g. a
            // real Chrome Balloons line at 300cm) rather than "how many of
            // this thing", so the add-ons' 99 cap silently clamped any real
            // entry above that back down — 9999 covers real data without
            // still being an effectively unbounded/unvalidated field.
            max={9999}
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
  }

  // Colour, last. Brand-new item ("Add an item") — its own curated palette
  // (COLOUR_PALETTE), multi-select, unrelated to any vendor default (there
  // isn't one), so this stays exactly as it always has.
  if (item.isNew && item.colourOptions && item.colourOptions.length > 0) {
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
      </div>
    );
  }

  // Existing catalog item — the vendor's own colours are NOT shown here at
  // all (design change 2026-09-30: picking among them is free, done from
  // the item-details view instead, and never a request). This is the only
  // place a colour choice becomes a real request: picking one or more from
  // the full extended palette (data/extendedColorPalette.ts, sourced from
  // the SVG_Balloon_Color_Palette.xlsx reference sheet) that isn't what the
  // vendor already offers. Multi-select (2026-09-30) — a customer can
  // request several alternate colours for the same item, same as the
  // vendor's own multi-select above.
  if (!item.isNew) {
    const currentVendorColours = item.colours
      ?.map((id) => item.colourOptions?.find((c) => c.id === id)?.label)
      .filter((label): label is string => Boolean(label));
    sections.push(
      <div key="custom-colour">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className={SECTION_HEADING}>Request different colour(s)</span>
        </div>
        <p className="mb-3 font-figtree text-[12px] leading-[18px] font-normal text-neutral-tertiary">
          {currentVendorColours && currentVendorColours.length > 0
            ? `The vendor already offers ${currentVendorColours.join(", ")} for this item — pick from here only if you want something else. This counts as a request.`
            : "Pick colour(s) the vendor doesn't already offer for this item. This counts as a request."}
        </p>
        <div className="max-h-[280px] space-y-4 overflow-y-auto pr-1">
          {EXTENDED_COLOUR_PALETTE.map((category) => (
            <div key={category.id}>
              <div className="mb-2 font-figtree text-[11px] leading-[16px] font-semibold text-neutral-tertiary">
                {category.label}
              </div>
              <div className="flex flex-wrap gap-3">
                {category.colours.map((colour) => {
                  const selected = item.customColours?.includes(colour.id);
                  return (
                    <button
                      key={colour.id}
                      type="button"
                      title={colour.label}
                      onClick={() => onToggleCustomColour(colour.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition ${
                          selected
                            ? "border-black/10 ring-[1.5px] ring-[#B4112A] ring-offset-2 ring-offset-white"
                            : "border-black/10"
                        }`}
                        style={{ backgroundColor: colour.swatch }}
                      >
                        {selected && (
                          <Check
                            className={`h-4 w-4 ${isLightSwatch(colour.swatch) ? "text-brand-950" : "text-white"}`}
                            strokeWidth={3}
                          />
                        )}
                      </span>
                      <span className="w-14 truncate text-center font-figtree text-[10px] text-neutral-secondary">
                        {colour.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {item.customColours && item.customColours.length > 0 && (
          <button
            type="button"
            onClick={onClearCustomColours}
            className="mt-3 font-figtree text-[12px] font-semibold text-brand-primary hover:underline"
          >
            Remove this request — use the vendor's colour instead
          </button>
        )}
      </div>
    );
  }

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
      <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
        {WORKSHOP_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onPick(category)}
            className="relative flex h-[100px] w-full items-start overflow-hidden rounded-[11px] border-[0.92px] border-black/10 bg-white p-3 text-left transition hover:border-brand-primary hover:bg-brand-primary/5 sm:w-[206px]"
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
