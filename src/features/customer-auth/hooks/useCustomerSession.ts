"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  setSession as storeSetSession,
  clearSession as storeClearSession,
  type Customer,
} from "@/lib/customerSession";
import { logout as logoutRequest } from "../services/authService";

const SERVER_SNAPSHOT = { accessToken: null, customer: null };

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/**
 * Reactive read/write access to the customer session, backed by the module
 * store in src/lib/customerSession.ts so Navbar, StickyBookingCard, and
 * CartPageContent all see the same state without a Context provider.
 */
export function useCustomerSession() {
  const { accessToken, customer } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback((nextCustomer: Customer, nextAccessToken: string) => {
    storeSetSession(nextCustomer, nextAccessToken);
  }, []);

  const logout = useCallback(() => {
    logoutRequest().catch(() => {
      // Best-effort — clear the local session regardless of network outcome.
    });
    storeClearSession();
  }, []);

  return {
    session: customer,
    isLoggedIn: Boolean(accessToken && customer),
    isHydrated: true,
    login,
    logout,
  };
}
