// Module-level customer session store. Not React Context — nothing wraps the
// app in a provider today, and several unrelated components (Navbar,
// StickyBookingCard, CartPageContent) each need reactive read access
// independently, so a shared external store (useSyncExternalStore) is a
// smaller change than introducing a provider tree.

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  profilePicture?: string;
  verificationStatus?: "Unverified" | "EmailVerified" | "PhoneVerified" | "FullyVerified";
  /** Present when the account has a "local" entry, i.e. a password is set — used to decide whether to offer phone+password login. */
  authProviders?: { provider: string; providerId: string | null; linkedAt: string }[];
}

interface SessionState {
  accessToken: string | null;
  customer: Customer | null;
}

const STORAGE_KEY = "eventory_customer_session";

function readStoredState(): SessionState {
  if (typeof window === "undefined") return { accessToken: null, customer: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, customer: null };
    const parsed = JSON.parse(raw) as SessionState;
    return { accessToken: parsed.accessToken ?? null, customer: parsed.customer ?? null };
  } catch {
    return { accessToken: null, customer: null };
  }
}

let state: SessionState = { accessToken: null, customer: null };
let hydrated = false;
const listeners = new Set<() => void>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  state = readStoredState();
  hydrated = true;
}

function persist() {
  if (typeof window === "undefined") return;
  if (state.accessToken && state.customer) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): SessionState {
  ensureHydrated();
  return state;
}

export function setSession(customer: Customer, accessToken: string) {
  ensureHydrated();
  state = { accessToken, customer };
  persist();
  notify();
}

export function clearSession() {
  ensureHydrated();
  state = { accessToken: null, customer: null };
  persist();
  notify();
}

export function getAccessToken(): string | null {
  return getSnapshot().accessToken;
}
