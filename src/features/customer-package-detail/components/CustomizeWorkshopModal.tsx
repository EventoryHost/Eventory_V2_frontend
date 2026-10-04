"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, Plus, Trash2 } from "lucide-react";
import type { IncludedItemEntry, IncludedItemLine, WorkshopCategoryDef } from "../types";
import { WORKSHOP_CATEGORIES, WORKSHOP_CATEGORY_IMAGES } from "../data/workshopCategories";
import { EXTENDED_COLOUR_PALETTE } from "../data/extendedColorPalette";
import type { UseCustomizeWorkshopResult } from "../hooks/useCustomizeWorkshop";
import SetupDetailPanel from "./SetupDetailPanel";
import QuantityInput from "./QuantityInput";
import TypeSelectDropdown from "./TypeSelectDropdown";
import ColourSelectDropdown from "./ColourSelectDropdown";

type FooterPhase = "idle" | "processing" | "committed";
type ModalView = "detail" | "customize";

const NEW_ITEM_SLOT = "__new__";

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
  // "Other" is a real selection (item.type === "Other" literally) until the
  // customer types their own value into the text field it reveals — real
  // bug fixed 2026-10-04 (PM-reported: "user cannot just select other and
  // save"): nothing previously stopped leaving that field blank. Only
  // surfaced once they actually try to leave via "Save & back" rather than
  // on every keystroke, so picking "Other" doesn't show an error before
  // they've had a chance to type anything.
  const [showTypeError, setShowTypeError] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Captured once, on mount — this is already the committed/last-saved
  // state (hydrateFromRequests runs before this modal can ever open), so
  // "Don't save changes" has an exact baseline to restore instead of
  // reverting every pending request all the way back to the package's
  // pristine original (see restoreSetupItems's own comment for why that
  // was wrong).
  const openingSnapshot = useRef(items);

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
    workshop.restoreSetupItems(setup.id, openingSnapshot.current);
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
    if (type !== "Other") setShowTypeError(false);
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
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setShowTypeError(false);
                        }}
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
                    onClick={() => {
                      setSelectedItemId(NEW_ITEM_SLOT);
                      setShowTypeError(false);
                    }}
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
                        showTypeError={showTypeError}
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
                onClick={() => {
                  if (selectedItem?.type === "Other") {
                    setShowTypeError(true);
                    return;
                  }
                  setView("detail");
                }}
                className="rounded-full border border-[#030303] bg-transparent px-5 py-2 font-figtree text-[14px] font-medium text-[#030303] transition hover:bg-black/5"
              >
                Save &amp; back
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
  showTypeError,
}: {
  item: IncludedItemLine;
  onRemove: () => void;
  onSetType: (type: string) => void;
  onToggleColour: (colourId: string) => void;
  onToggleCustomColour: (colourId: string) => void;
  onClearCustomColours: () => void;
  onSetVolume: (volume: string) => void;
  onSetQuantity: (qty: number) => void;
  showTypeError?: boolean;
}) {
  const sections: React.ReactNode[] = [];

  // Order: type, then volume, then quantity, then colour(s) last — colour
  // is the section most likely to need scrolling (up to 89 extended-palette
  // swatches), so it goes at the bottom rather than pushing the shorter,
  // quicker fields below the fold.
  if (item.typeOptions && item.typeOptions.length > 0) {
    // "Other" is a pill like any other, but its real purpose is "let the
    // customer type what they actually want" rather than a fixed option —
    // so once it (or any value typed into it) is the current selection, a
    // text input appears for entering the real value. A custom value no
    // longer literally equals the typeOptions string "Other" once typed, so
    // this also catches "already has a typed-in custom type" on top of
    // "Other" having just been clicked.
    const isOtherSelected = item.type === "Other" || (item.type !== undefined && !item.typeOptions.includes(item.type));
    sections.push(
      <div key="type">
        <TypeSelectDropdown
          label={item.typeLabel ?? "Type"}
          placeholder={`Select ${item.typeLabel ?? "type"}`}
          options={item.typeOptions}
          value={isOtherSelected ? "Other" : item.type}
          onChange={onSetType}
        />
        {isOtherSelected && (
          <>
            <input
              type="text"
              value={item.type === "Other" ? "" : (item.type ?? "")}
              onChange={(e) => onSetType(e.target.value === "" ? "Other" : e.target.value)}
              placeholder={`Enter ${item.typeLabel?.toLowerCase() ?? "type"}`}
              autoFocus
              aria-invalid={showTypeError && item.type === "Other"}
              className={`mt-2 w-full rounded-lg border px-3 py-2 font-figtree text-[13px] text-brand-950 placeholder:text-neutral-tertiary focus:outline-none ${
                showTypeError && item.type === "Other"
                  ? "border-red-400 focus:border-red-500"
                  : "border-black/15 focus:border-brand-primary"
              }`}
            />
            {showTypeError && item.type === "Other" && (
              <p className="mt-1 font-figtree text-[12px] text-red-600">
                Please enter the {item.typeLabel?.toLowerCase() ?? "type"} before saving.
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  // Volume (Low/Medium/High density) only makes sense for Flowers — defended
  // here too (not just at the data sources in useCustomizeWorkshop.ts/
  // getPackageDetail.ts), so a non-Flowers item can never show it even if
  // some other path ever sets volumeOptions on one again.
  const showVolume = item.category === "Flowers" && Boolean(item.volumeOptions?.length);

  if (showVolume) {
    sections.push(
      <div key="volume">
        <div className={`mb-2 ${SECTION_HEADING}`}>Volume</div>
        <div className="flex flex-wrap gap-2">
          {item.volumeOptions!.map((option) => (
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
  if (!showVolume) {
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
  // isn't one).
  if (item.isNew && item.colourOptions && item.colourOptions.length > 0) {
    const selectedColourIds = item.colours ?? [];
    sections.push(
      <div key="colour">
        <ColourSelectDropdown
          label="Colours"
          helperText="pick as many as you like"
          placeholder="Pick your Colors"
          options={item.colourOptions}
          selectedIds={selectedColourIds}
          onToggle={onToggleColour}
          onClear={() => selectedColourIds.forEach((id) => onToggleColour(id))}
        />
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
        <ColourSelectDropdown
          placeholder="Pick your Colors"
          categories={EXTENDED_COLOUR_PALETTE}
          selectedIds={item.customColours ?? []}
          onToggle={onToggleCustomColour}
          onClear={onClearCustomColours}
        />
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

      {/* Read-only facts the vendor set (item type/category, its sub-type —
          e.g. "Metallic Balloons" — and length) — shown whenever present but
          NOT as an editable picker like the typeOptions section above: these
          are free text on the schema (flowerType/lightingType/subCategory),
          not a fixed option list, so there's nothing real to offer as
          choices. REAL GAP FIXED 2026-10-02 (PM-reported: "balloon type and
          all not displayed in customization modal") — previously shown only
          in the read-only Item Details view, never here, since this section
          only ever rendered when typeOptions (new-item categories only) was
          set. */}
      {!item.typeOptions?.length && (item.category || item.type || item.length != null) && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl bg-black/[0.03] px-4 py-3">
          {item.category && (
            <div>
              <div className="font-figtree text-[11px] font-medium text-neutral-tertiary">Item Type</div>
              <div className="font-figtree text-[13px] font-semibold text-brand-950">{item.category}</div>
            </div>
          )}
          {item.type && (
            <div>
              <div className="font-figtree text-[11px] font-medium text-neutral-tertiary">{item.typeLabel ?? "Type"}</div>
              <div className="font-figtree text-[13px] font-semibold text-brand-950">{item.type}</div>
            </div>
          )}
          {item.length != null && (
            <div>
              <div className="font-figtree text-[11px] font-medium text-neutral-tertiary">Length</div>
              <div className="font-figtree text-[13px] font-semibold text-brand-950">
                {item.unit ? `${item.length} ${item.unit}` : item.length}
              </div>
            </div>
          )}
        </div>
      )}

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
      <div className="-mx-4 -mt-4 border-b border-[#E4E4E7] px-4 py-3 sm:-mx-6 sm:-mt-6 sm:px-6">
        <h3 className="font-figtree text-[20px] leading-7 font-semibold text-[#09090B]">New item</h3>
        <p className="mt-1 font-figtree text-[14px] leading-5 text-[#71717B]">
          Choose an item of your choice in the setup
        </p>
      </div>
      {/* Fixed-px column tracks (not 1fr/stretch) — a grid-cols-2 with auto
          columns stretches each card to fill half the panel's real width,
          which is wider than Figma's own fixed 206px cards and threw off
          the gap rhythm even though the gap VALUE was already correct
          (real bug fixed 2026-10-04). Matching the track width to the
          card's own fixed width keeps every card exactly 206×100 with the
          exact 18/20px gaps regardless of how wide this panel renders. */}
      <div className="mt-5 grid grid-cols-1 gap-x-[18px] gap-y-5 min-[460px]:grid-cols-[206px_206px]">
        {WORKSHOP_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onPick(category)}
            className="relative flex h-[100px] w-full items-start overflow-hidden rounded-[11px] border-[0.92px] border-[#E4E4E7] bg-white px-[17px] py-[15px] text-left transition hover:border-brand-primary hover:bg-brand-primary/5 min-[460px]:w-[206px]"
          >
            <span className="relative z-[1] font-figtree text-[16px] leading-[26px] font-medium text-black">
              {category.label}
            </span>
            {WORKSHOP_CATEGORY_IMAGES[category.id] && (
              <img
                src={WORKSHOP_CATEGORY_IMAGES[category.id]}
                alt=""
                className="pointer-events-none absolute right-3 bottom-2 h-[80px] w-[80px] object-contain"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
