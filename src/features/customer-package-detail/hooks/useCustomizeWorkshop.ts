import { useMemo, useState } from "react";
import type {
  CustomizeRequest,
  CustomizeRequestType,
  IncludedItemEntry,
  IncludedItemLine,
  WorkshopCategoryDef,
} from "../types";
import type { RawCustomizeRequest } from "@/lib/customerCartApi";
import { COLOUR_PALETTE, VOLUME_OPTIONS } from "../data/workshopCategories";

function hasChanged(item: IncludedItemLine): boolean {
  if (item.qty !== item.originalQty) return true;
  if (item.type !== undefined && item.type !== item.originalType) return true;
  if (item.volume !== undefined && item.volume !== item.originalVolume) return true;
  if (item.colours && item.originalColours) {
    const selected = [...item.colours].sort().join(",");
    const original = [...item.originalColours].sort().join(",");
    if (selected !== original) return true;
  }
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
              colours: item.originalColours ? [...item.originalColours] : item.colours,
            }
          : item
      ),
    }));
  }

  function addItem(setupId: string, category: WorkshopCategoryDef): string {
    const id = `new-${setupId}-${category.id}-${Math.random().toString(36).slice(2, 8)}`;
    const defaultType = category.typeOptions[0];
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
      volumeOptions: VOLUME_OPTIONS,
      volume: VOLUME_OPTIONS[1],
      originalVolume: VOLUME_OPTIONS[1],
      isNew: true,
    };
    setItemsBySetup((prev) => ({ ...prev, [setupId]: [...(prev[setupId] ?? []), newItem] }));
    return id;
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
  function hydrateFromRequests(requests: RawCustomizeRequest[]) {
    if (requests.length === 0) return;
    setItemsBySetup(() => {
      const base: Record<string, IncludedItemLine[]> = Object.fromEntries(
        setups.map((setup) => [setup.id, setup.items])
      );
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
            // colours came back from the backend as labels (see
            // buildCartPayload) — resolve back to this item's own option
            // ids, same ids toggleColour/colourOptions already use.
            const colours = request.colours?.map(
              (label) => item.colourOptions?.find((c) => c.label === label)?.id ?? label
            );
            return {
              ...item,
              qty: request.quantity ?? item.qty,
              type: request.type ?? item.type,
              volume: request.volume ?? item.volume,
              colours: colours ?? item.colours,
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
            volumeOptions: VOLUME_OPTIONS,
            volume: request.volume,
            originalVolume: request.volume,
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

  function dismissRequest(request: CustomizeRequest) {
    if (request.requestType === "add") cancelAdd(request.setupId, request.itemId);
    else if (request.requestType === "remove") cancelRemoval(request.setupId, request.itemId);
    else cancelChange(request.setupId, request.itemId);
  }

  return {
    itemsBySetup,
    requests,
    setType,
    setVolume,
    toggleColour,
    setQuantity,
    requestRemoval,
    cancelRemoval,
    cancelChange,
    addItem,
    cancelAdd,
    dismissRequest,
    hydrateFromRequests,
  };
}

export type UseCustomizeWorkshopResult = ReturnType<typeof useCustomizeWorkshop>;
