// Module-level customer session store. Not React Context — nothing wraps the
// app in a provider today, and several unrelated components (Navbar,
// StickyBookingCard, CartPageContent) each need reactive read access
// independently, so a shared external store (useSyncExternalStore) is a
// smaller change than introducing a provider tree.

/** Embedded saved address — mirrors addressSchema.js on the backend. */
export interface CustomerAddress {
  /** Mongo subdocument id. Present on read; stripped by the update validator, so never rely on it surviving a save. */
  _id?: string;
  label?: string;
  /** Recipient for this address — often not the account holder (venue contact). */
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  landmark?: string;
  pincode?: string;
  country?: string;
  mapLink?: string;
  isDefault?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  profilePicture?: string;
  /** Backend enum — the profile form only offers Male/Female, but an account can already hold either of the other two. */
  gender?: "Male" | "Female" | "Other" | "PreferNotToSay";
  addresses?: CustomerAddress[];
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

/**
 * Merges freshly-fetched profile fields into the stored customer without
 * touching the access token — used by useCustomerSession's profile refresh,
 * so a session persisted before a field existed (or before the customer set
 * their name) picks it up instead of staying stale forever.
 *
 * No-ops when there's no customer, and when nothing actually changed, so it
 * can't loop a useSyncExternalStore subscriber via a new object identity.
 */
export function updateCustomer(patch: Partial<Customer>) {
  ensureHydrated();
  if (!state.customer) return;

  const merged = { ...state.customer, ...patch };
  const unchanged = (Object.keys(patch) as (keyof Customer)[]).every(
    (key) => JSON.stringify(state.customer?.[key]) === JSON.stringify(merged[key])
  );
  if (unchanged) return;

  state = { ...state, customer: merged };
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
