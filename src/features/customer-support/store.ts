import type { SupportContext, TicketType } from "./types";

/**
 * Module-level store for the Help panel and page context — same pattern as
 * src/lib/customerSession.ts (useSyncExternalStore, no provider tree), so
 * any component on any page can register context or open the panel.
 */

export type SupportScreen = "home" | "categories" | "compose" | "ticket" | "tickets";

export interface PanelState {
  open: boolean;
  screen: SupportScreen;
  type?: TicketType;
  category?: string;
  topic?: string;
  ticketId?: string;
  /** Context for this opening only (e.g. one booking card on a list page), layered over the page's. */
  contextOverride?: SupportContext;
  /** Screen stack for the header back button. */
  history: Omit<PanelState, "open" | "history" | "contextOverride">[];
}

export interface SupportState {
  panel: PanelState;
  /** Merged page context, in mount order. */
  context: SupportContext;
}

const CLOSED: PanelState = { open: false, screen: "home", history: [] };

let slices: { key: string; ctx: SupportContext }[] = [];
let state: SupportState = { panel: CLOSED, context: {} };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

function setState(next: Partial<SupportState>) {
  state = { ...state, ...next };
  notify();
}

function merge(): SupportContext {
  return slices.reduce<SupportContext>((acc, { ctx }) => {
    const defined = Object.fromEntries(Object.entries(ctx).filter(([, v]) => v !== undefined && v !== ""));
    return { ...acc, ...defined };
  }, {});
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getSnapshot() {
  return state;
}

const SERVER_STATE: SupportState = { panel: CLOSED, context: {} };
export function getServerSnapshot() {
  return SERVER_STATE;
}

export function setContextSlice(key: string, ctx: SupportContext) {
  const index = slices.findIndex((s) => s.key === key);
  if (index === -1) slices = [...slices, { key, ctx }];
  else slices = slices.map((s, i) => (i === index ? { key, ctx } : s));
  setState({ context: merge() });
}

export function removeContextSlice(key: string) {
  slices = slices.filter((s) => s.key !== key);
  setState({ context: merge() });
}

export interface OpenSupportOptions {
  /** Jump straight into a ticket type (compose, or its category list when it has several). */
  type?: TicketType;
  category?: string;
  topic?: string;
  ticketId?: string;
  screen?: SupportScreen;
  context?: SupportContext;
}

export function openSupport(options: OpenSupportOptions = {}) {
  const screen: SupportScreen =
    options.screen ?? (options.ticketId ? "ticket" : options.type ? (options.category ? "compose" : "categories") : "home");
  // Deep links still get a way back to the panel's home.
  const history = screen === "home" ? [] : [{ screen: "home" as const }];
  setState({
    panel: {
      open: true,
      screen,
      type: options.type,
      category: options.category,
      topic: options.topic,
      ticketId: options.ticketId,
      contextOverride: options.context,
      history,
    },
  });
}

type PanelLocation = Omit<PanelState, "open" | "history" | "contextOverride">;

export function navigateSupport(next: PanelLocation, replace = false) {
  const { history, contextOverride, screen, type, category, topic, ticketId } = state.panel;
  const current: PanelLocation = { screen, type, category, topic, ticketId };
  setState({
    panel: { open: true, ...next, contextOverride, history: replace ? history : [...history, current] },
  });
}

export function backSupport() {
  const history = [...state.panel.history];
  const previous = history.pop();
  if (!previous) return;
  setState({ panel: { open: true, ...previous, contextOverride: state.panel.contextOverride, history } });
}

export function closeSupport() {
  setState({ panel: { ...state.panel, open: false } });
}
