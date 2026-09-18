"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  setSession as storeSetSession,
  clearSession as storeClearSession,
  updateCustomer as storeUpdateCustomer,
  type Customer,
} from "@/lib/customerSession";
import { logout as logoutRequest, getCustomerProfile } from "../services/authService";

const SERVER_SNAPSHOT = { accessToken: null, customer: null };

// The session persisted in localStorage is whatever the login response
// happened to contain, and it never changes again on its own — so a
// customer who set their name after signing up (or signed up by phone OTP
// with no name at all) would keep rendering a stale/blank name for the life
// of that token. Re-read the profile once per page load to fix that.
//
// Module-level rather than per-hook: useCustomerSession is mounted by the
// navbar, the sidebar, the cart and the PDP simultaneously, and this must
// fire one request, not one per consumer.
let profileRefreshedFor: string | null = null;

function refreshProfileOnce(customerId: string) {
  if (profileRefreshedFor === customerId) return;
  profileRefreshedFor = customerId;

  getCustomerProfile(customerId)
    .then((profile) => {
      storeUpdateCustomer(profile);
    })
    .catch(() => {
      // Offline, 403, or the backend not running — keep showing whatever
      // the login response gave us rather than blanking the name. Cleared
      // so a later mount can try again.
      profileRefreshedFor = null;
    });
}

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

  const customerId = customer?.id;
  useEffect(() => {
    if (!accessToken || !customerId) return;
    refreshProfileOnce(customerId);
  }, [accessToken, customerId]);

  const login = useCallback((nextCustomer: Customer, nextAccessToken: string) => {
    storeSetSession(nextCustomer, nextAccessToken);
  }, []);

  const logout = useCallback(() => {
    // Let the next signed-in session re-fetch its own profile.
    profileRefreshedFor = null;
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
