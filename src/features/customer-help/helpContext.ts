"use client";

import { useSyncExternalStore } from "react";

// What the page behind the help panel is about. The panel is mounted once
// in the customer layout, so pages publish their context here (e.g. the
// package detail page sets its name + token) instead of prop-drilling.
export type HelpPageContext = HelpPackageContext | HelpBookingContext;

export type HelpPackageContext = {
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

/**
 * A booking page (v6f9 "Help with your booking"): the event and its
 * packages — one Booking each in backend terms. The help panel loads each
 * package's detail itself (amounts, policy, Event Manager).
 */
export type HelpBookingContext = {
  kind: "booking";
  /** The booking the page was opened with. */
  reference: string;
  eventTitle: string;
  /** ISO date of the event. */
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  guestsLabel?: string;
  packages: {
    reference: string;
    name: string;
    vendorName?: string;
    variantLabel?: string;
    image?: string;
    vendorType?: string;
    statusLabel: string;
    statusTone: "pending" | "confirmed" | "cancelled" | "completed";
  }[];
  /** Packages whose revised proposal waits for the customer. */
  proposalsAwaitingReview: string[];
};

/**
 * Booking page actions the help panel hands back to the page (detail =
 * booking reference): open a package's panel (customise), its Review
 * Proposal, or the payments section.
 */
export const OPEN_BOOKING_PACKAGE_EVENT = "eventory:help-open-booking-package";
export const OPEN_BOOKING_PROPOSAL_EVENT = "eventory:help-open-booking-proposal";
export const OPEN_BOOKING_PAYMENTS_EVENT = "eventory:help-open-booking-payments";
/** The help panel changed the booking (e.g. cancelled a package): reload it. */
export const BOOKING_CHANGED_EVENT = "eventory:help-booking-changed";

/** Fired by the help panel's "Open customise editor"; IncludedItems opens its first setup. */
export const OPEN_CUSTOMISE_EVENT = "eventory:help-open-customise";

/** Fired by pages with their own "Help & Support" button (e.g. Review Proposal); HelpWidget opens on it. */
export const OPEN_HELP_EVENT = "eventory:help-open";

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
