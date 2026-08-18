import { useMemo, useState } from "react";
import type {
  CustomizeRequest,
  CustomizeRequestType,
  IncludedItemEntry,
  IncludedItemLine,
  WorkshopCategoryDef,
} from "../types";
import { COLOUR_PALETTE } from "../data/workshopCategories";

function hasChanged(item: IncludedItemLine): boolean {
  if (item.qty !== item.originalQty) return true;
  if (item.type !== undefined && item.type !== item.originalType) return true;
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
    toggleColour,
    setQuantity,
    requestRemoval,
    cancelRemoval,
    cancelChange,
    addItem,
    cancelAdd,
    dismissRequest,
  };
}

export type UseCustomizeWorkshopResult = ReturnType<typeof useCustomizeWorkshop>;
