"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import {
  backSupport,
  closeSupport,
  getServerSnapshot,
  getSnapshot,
  navigateSupport,
  openSupport,
  removeContextSlice,
  setContextSlice,
  subscribe,
} from "../store";
import { ticketService } from "../services/ticketService";
import type { SupportContext, Ticket } from "../types";

/** Reactive panel state + merged page context, plus the panel actions. */
export function useSupport() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const override = state.panel.open ? state.panel.contextOverride : undefined;
  const context = useMemo(() => (override ? { ...state.context, ...override } : state.context), [state.context, override]);
  return { panel: state.panel, context, openSupport, closeSupport, navigateSupport, backSupport };
}

/**
 * Registers what this page/component knows for the Help panel. Pass a
 * fresh object each render; it's compared by value so re-renders are cheap.
 * The slice is removed on unmount.
 */
export function useRegisterSupportContext(ctx: SupportContext) {
  const key = useId();
  const serialized = JSON.stringify(ctx);

  useEffect(() => {
    setContextSlice(key, JSON.parse(serialized) as SupportContext);
  }, [key, serialized]);

  useEffect(() => () => removeContextSlice(key), [key]);
}

/** The customer's tickets, kept live via ticketService.subscribe. */
export function useMyTickets() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      ticketService.listMyTickets().then((list) => {
        if (!cancelled) setTickets(list);
      });
    load();
    const unsubscribe = ticketService.subscribe("*", () => {
      load();
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return tickets;
}

/** One ticket, live. */
export function useTicket(id: string | undefined) {
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    ticketService.getTicket(id).then((t) => {
      if (!cancelled) setTicket(t);
    });
    const unsubscribe = ticketService.subscribe(id, (t) => {
      if (!cancelled) setTicket(t);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [id]);

  return id && ticket?.id === id ? ticket : null;
}

/** Ticks every second while `active`, for countdowns. */
export function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}
