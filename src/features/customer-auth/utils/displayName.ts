import type { Customer } from "@/lib/customerSession";

/**
 * How a customer is addressed across the customer-facing UI.
 *
 * `name` is optional on the backend Customer model (a phone-OTP signup can
 * create an account without one), so this falls back through the other
 * identifiers the account has: the email's local part, then a neutral label.
 */
export function customerDisplayName(customer: Customer | null | undefined): string {
  const name = customer?.name?.trim();
  if (name) return name;

  const emailLocalPart = customer?.email?.trim().split("@")[0];
  if (emailLocalPart) return emailLocalPart;

  // Never fall back to the phone number: a phone-OTP account that hasn't set a
  // name yet (or whose profile is still loading) used to show its raw number
  // in the navbar and sidebar.
  return "My Account";
}

/** First word of the display name, the navbar's compact "Hi, Vyom" form. */
export function customerFirstName(customer: Customer | null | undefined): string {
  const name = customer?.name?.trim() || customer?.email?.trim().split("@")[0];
  return name ? name.split(/\s+/)[0] : "Account";
}
