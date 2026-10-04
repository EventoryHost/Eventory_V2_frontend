import { useMemo, useState } from "react";
import type {
  CustomizeRequest,
  CustomizeRequestType,
  IncludedItemEntry,
  IncludedItemLine,
  WorkshopCategoryDef,
} from "../types";
import type { RawCustomizeRequest, RawColourPreference } from "@/lib/customerCartApi";
import { COLOUR_PALETTE, VOLUME_OPTIONS } from "../data/workshopCategories";
import { ALL_EXTENDED_COLOURS } from "../data/extendedColorPalette";

// colours/originalColours (the vendor's own palette) are deliberately NOT
// compared here — freely picking among what the vendor already offers is
// never a request (design change 2026-09-30: "these are the options the
// vendor already provides"). Only a customColour pick (the extended
// palette, Customize items modal only) counts.
function hasChanged(item: IncludedItemLine): boolean {
  if (item.qty !== item.originalQty) return true;
  if (item.type !== undefined && item.type !== item.originalType) return true;
  if (item.volume !== undefined && item.volume !== item.originalVolume) return true;
  const custom = [...(item.customColours ?? [])].sort().join(",");
  const originalCustom = [...(item.originalCustomColours ?? [])].sort().join(",");
  if (custom !== originalCustom) return true;
  return false;
}

// Live-commit request state for the "Customize items" workshop (design doc
// §1: "editing an item is itself the request"). There is no separate request
// store — every item line carries its own original* fields, and the pending
// "Your requests" list is derived by diffing current vs. original on each
// render. Cancelling a request just reverts (or removes) the line item.
export function useCustomizeWorkshop(setups: IncludedItemEntry[]) {
  const [itemsBySetup, setItemsBySetup] = useState<Record<string, IncludedItemLine[]>>(() =>
    Object.fromEntries(setups.map((setup) => [setup.id, setup.items]))
  );

  function updateItem(setupId: string, itemId: string, patch: Partial<IncludedItemLine>) {
    setItemsBySetup((prev) => ({
      ...prev,
      [setupId]: (prev[setupId] ?? []).map((item) =>
        item.id === itemId && !item.removalRequested ? { ...item, ...patch } : item
      ),
    }));
  }

  function setType(setupId: string, itemId: string, type: string) {
    updateItem(setupId, itemId, { type });
  }

  function setVolume(setupId: string, itemId: string, volume: string) {
    updateItem(setupId, itemId, { volume });
  }

  // Multi-select toggle among the vendor's OWN colourOptions — the
  // item-details section's clickable swatches (SetupDetailPanel.tsx).
  // Deliberately not run through hasChanged's originalColours: this never
  // generates a request, so there is nothing to diff against.
  function toggleVendorColour(setupId: string, itemId: string, colourId: string) {
    setItemsBySetup((prev) => ({
      ...prev,
      [setupId]: (prev[setupId] ?? []).map((item) => {
        if (item.id !== itemId || item.removalRequested) return item;
        const selected = item.colours ?? [];
        const colours = selected.includes(colourId)
          ? selected.filter((c) => c !== colourId)
          : [...selected, colourId];
        return { ...item, colours };
      }),
    }));
  }

  // Multi-select toggle over a brand-new item's own colourOptions
  // (COLOUR_PALETTE, set by addItem() below) — unrelated to the vendor-
  // colour/customColour split above: a new item has no vendor default to
  // begin with, and the whole item is already a request regardless of
  // which colours it's given, so this keeps its pre-existing behaviour
  // unchanged.
  function toggleColour(setupId: string, itemId: string, colourId: string) {
    setItemsBySetup((prev) => ({
      ...prev,
      [setupId]: (prev[setupId] ?? []).map((item) => {
        if (item.id !== itemId || item.removalRequested) return item;
        const selected = item.colours ?? [];
        const colours = selected.includes(colourId)
          ? selected.filter((c) => c !== colourId)
          : [...selected, colourId];
        return { ...item, colours };
      }),
    }));
  }

  // Multi-select toggle over the EXTENDED palette (data/extendedColorPalette.ts),
  // picked only from the Customize items modal — this is what makes a
  // colour choice a real request (see hasChanged above).
  function toggleCustomColour(setupId: string, itemId: string, colourId: string) {
    setItemsBySetup((prev) => ({
      ...prev,
      [setupId]: (prev[setupId] ?? []).map((item) => {
        if (item.id !== itemId || item.removalRequested) return item;
        const selected = item.customColours ?? [];
        const customColours = selected.includes(colourId)
          ? selected.filter((c) => c !== colourId)
          : [...selected, colourId];
        return { ...item, customColours };
      }),
    }));
  }

  function clearCustomColours(setupId: string, itemId: string) {
    updateItem(setupId, itemId, { customColours: [] });
  }

  function setQuantity(setupId: string, itemId: string, qty: number) {
    updateItem(setupId, itemId, { qty: Math.max(1, qty) });
  }

  function requestRemoval(setupId: string, itemId: string) {
    updateItem(setupId, itemId, { removalRequested: true });
  }

  function cancelRemoval(setupId: string, itemId: string) {
    setItemsBySetup((prev) => ({
      ...prev,
      [setupId]: (prev[setupId] ?? []).map((item) =>
        item.id === itemId ? { ...item, removalRequested: false } : item
      ),
    }));
  }

  function cancelChange(setupId: string, itemId: string) {
    setItemsBySetup((prev) => ({
      ...prev,
      [setupId]: (prev[setupId] ?? []).map((item) =>
        item.id === itemId
          ? {
              ...item,
              type: item.originalType,
              volume: item.originalVolume,
              qty: item.originalQty,
              customColours: item.originalCustomColours ? [...item.originalCustomColours] : [],
            }
          : item
      ),
    }));
  }

  function addItem(setupId: string, category: WorkshopCategoryDef): string {
    const id = `new-${setupId}-${category.id}-${Math.random().toString(36).slice(2, 8)}`;
    const defaultType = category.typeOptions[0];
    // Volume (Low/Medium/High density) only makes sense for Flowers — real
    // bug fixed 2026-10-04 (PM-reported: "volume field only for flowers"):
    // every new-item category got a Volume section regardless, since this
    // was set unconditionally.
    const isFlowers = category.label === "Flowers";
    const newItem: IncludedItemLine = {
      id,
      label: category.label,
      qty: 1,
      originalQty: 1,
      category: category.label,
      typeLabel: category.typeLabel,
      typeOptions: category.typeOptions,
      type: defaultType,
      originalType: defaultType,
      colourOptions: COLOUR_PALETTE,
      colours: [],
      originalColours: [],
      volumeOptions: isFlowers ? VOLUME_OPTIONS : undefined,
      volume: isFlowers ? VOLUME_OPTIONS[1] : undefined,
      originalVolume: isFlowers ? VOLUME_OPTIONS[1] : undefined,
      isNew: true,
    };
    setItemsBySetup((prev) => ({ ...prev, [setupId]: [...(prev[setupId] ?? []), newItem] }));
    return id;
  }

  // Restores one setup's items to an exact snapshot — used by the
  // Customize-items modal's "Don't save changes" leave-guard. Real bug
  // fixed 2026-10-02: that guard used to call dismissRequest on every
  // currently-pending request, which reverts each one all the way back to
  // the PACKAGE'S PRISTINE ORIGINAL (item.original*) — correct for an
  // explicit single-request cancel (see dismissRequest below), but wrong
  // here, since on a second visit the "pending requests" list already
  // includes requests that were saved to the cart on a PREVIOUS visit
  // (hydrateFromRequests replays them on load). Discarding blindly wiped
  // those out too, not just the edits made in the current modal session.
  // The modal now snapshots this setup's items the moment it opens (i.e.
  // the already-saved state) and restores exactly that snapshot on
  // discard, leaving previously-saved customizations untouched.
  function restoreSetupItems(setupId: string, items: IncludedItemLine[]) {
    setItemsBySetup((prev) => ({ ...prev, [setupId]: items }));
  }

  function cancelAdd(setupId: string, itemId: string) {
    setItemsBySetup((prev) => ({
      ...prev,
      [setupId]: (prev[setupId] ?? []).filter((item) => item.id !== itemId),
    }));
  }

  // Reconstructs itemsBySetup from a cart item's already-persisted
  // customizeRequests (real requests sent by buildCartPayload on a previous
  // visit) — otherwise reopening "Customize items" on an edit always starts
  // fresh from the package's original items and silently loses whatever was
  // already saved. Replays onto the ORIGINAL catalog items (not whatever's
  // currently in state) so this is safe to call once, right after the
  // catalog-only initial state has already rendered.
  function hydrateFromRequests(requests: RawCustomizeRequest[], colourPreferences: RawColourPreference[] = []) {
    if (requests.length === 0 && colourPreferences.length === 0) return;
    setItemsBySetup(() => {
      const base: Record<string, IncludedItemLine[]> = Object.fromEntries(
        setups.map((setup) => [setup.id, setup.items])
      );
      // Vendor-palette picks — replayed first so a "change" request below
      // (which never touches `colours`) can't clobber it either way.
      for (const preference of colourPreferences) {
        const list = base[preference.setupId];
        if (!list) continue;
        base[preference.setupId] = list.map((item) => {
          if (item.id !== preference.itemId) return item;
          const colours = preference.colours?.map(
            (label) => item.colourOptions?.find((c) => c.label === label)?.id ?? label
          );
          return { ...item, colours: colours ?? item.colours };
        });
      }
      for (const request of requests) {
        const list = base[request.setupId];
        if (!list) continue;
        if (request.requestType === "remove") {
          base[request.setupId] = list.map((item) =>
            item.id === request.itemId ? { ...item, removalRequested: true } : item
          );
        } else if (request.requestType === "change") {
          base[request.setupId] = list.map((item) => {
            if (item.id !== request.itemId) return item;
            // colours comes back from the backend as labels (see
            // buildCartPayload) — a "change" request's colours are always
            // customColours picks (extended palette), never the vendor's
            // own, so resolve against that palette to get the ids back.
            const customColours = request.colours?.length
              ? request.colours.map((label) => ALL_EXTENDED_COLOURS.find((c) => c.label === label)?.id ?? label)
              : item.customColours;
            return {
              ...item,
              qty: request.quantity ?? item.qty,
              type: request.type ?? item.type,
              volume: request.volume ?? item.volume,
              customColours,
            };
          });
        } else if (request.requestType === "add" && !list.some((item) => item.id === request.itemId)) {
          const colours = request.colours?.map(
            (label) => COLOUR_PALETTE.find((c) => c.label === label)?.id ?? label
          ) ?? [];
          const newItem: IncludedItemLine = {
            id: request.itemId,
            label: request.label,
            qty: request.quantity ?? 1,
            originalQty: request.quantity ?? 1,
            category: request.label,
            type: request.type,
            originalType: request.type,
            colourOptions: COLOUR_PALETTE,
            colours,
            originalColours: [],
            // Same "Flowers only" rule as addItem() above.
            volumeOptions: request.label === "Flowers" ? VOLUME_OPTIONS : undefined,
            volume: request.label === "Flowers" ? request.volume : undefined,
            originalVolume: request.label === "Flowers" ? request.volume : undefined,
            isNew: true,
          };
          base[request.setupId] = [...list, newItem];
        }
      }
      return base;
    });
  }

  const requests: CustomizeRequest[] = useMemo(() => {
    const list: CustomizeRequest[] = [];
    for (const setup of setups) {
      for (const item of itemsBySetup[setup.id] ?? []) {
        let requestType: CustomizeRequestType | null = null;
        if (item.removalRequested) requestType = "remove";
        else if (item.isNew) requestType = "add";
        else if (hasChanged(item)) requestType = "change";
        if (requestType) {
          list.push({ key: `${setup.id}-${item.id}`, setupId: setup.id, setupTitle: setup.title, itemId: item.id, item, requestType });
        }
      }
    }
    return list;
  }, [itemsBySetup, setups]);

  // Vendor-palette colour picks, one entry per item that actually has one —
  // never a request (see hasChanged above), but real data the vendor should
  // still see, sent alongside (not mixed into) customizeRequests. Resolved
  // to real colour names here already, same "backend/vendor display expects
  // names, not slugified ids" convention buildCartPayload already follows
  // for customizeRequests.
  const colourPreferences = useMemo(() => {
    const list: { setupId: string; itemId: string; itemLabel: string; colours: string[] }[] = [];
    for (const setup of setups) {
      for (const item of itemsBySetup[setup.id] ?? []) {
        if (item.removalRequested || !item.colours || item.colours.length === 0) continue;
        const colours = item.colours.map((id) => item.colourOptions?.find((c) => c.id === id)?.label ?? id);
        list.push({ setupId: setup.id, itemId: item.id, itemLabel: item.label, colours });
      }
    }
    return list;
  }, [itemsBySetup, setups]);

  function dismissRequest(request: CustomizeRequest) {
    if (request.requestType === "add") cancelAdd(request.setupId, request.itemId);
    else if (request.requestType === "remove") cancelRemoval(request.setupId, request.itemId);
    else cancelChange(request.setupId, request.itemId);
  }

  return {
    itemsBySetup,
    requests,
    colourPreferences,
    setType,
    setVolume,
    toggleColour,
    toggleVendorColour,
    toggleCustomColour,
    clearCustomColours,
    setQuantity,
    requestRemoval,
    cancelRemoval,
    cancelChange,
    addItem,
    cancelAdd,
    dismissRequest,
    hydrateFromRequests,
    restoreSetupItems,
  };
}

export type UseCustomizeWorkshopResult = ReturnType<typeof useCustomizeWorkshop>;
