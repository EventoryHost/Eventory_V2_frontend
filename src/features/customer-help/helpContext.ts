"use client";

import { useSyncExternalStore } from "react";

// What the page behind the help panel is about. The panel is mounted once
// in the customer layout, so pages publish their context here (e.g. the
// package detail page sets its name + token) instead of prop-drilling.
export type HelpPageContext = {
  kind: "package";
  packageId: string;
  packageName: string;
  vendorName: string;
  /** 0 when the package has no token / advance configured. */
  tokenAmount: number;
  /** The vendor's own cancellation policy text, when they wrote one. */
  cancellationPolicy?: string;
  /** Titles of the setups this package includes. */
  included: string[];
  /** Selected variant ("Standard"), with its setup/item counts. */
  variant?: { label: string; setupsCount: number; itemsCount: number };
  /** Balance schedule after the token. */
  milestones: { percentage: number; dueLabel: string }[];
  /** Vendor type label for the brief ("Decorator"). */
  vendorType?: string;
  /** This package's own occasions, to pre-fill the brief. */
  eventCategories: string[];
};

/** Fired by the help panel's "Open customise editor"; IncludedItems opens its first setup. */
export const OPEN_CUSTOMISE_EVENT = "eventory:help-open-customise";

let current: HelpPageContext | null = null;
const listeners = new Set<() => void>();

export function setHelpPageContext(ctx: HelpPageContext | null) {
  current = ctx;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useHelpPageContext() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
