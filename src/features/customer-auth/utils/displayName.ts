import type { Customer } from "@/lib/customerSession";

/**
 * How a customer is addressed across the customer-facing UI.
 *
 * `name` is optional on the backend Customer model (a phone-OTP signup can
 * create an account without one), so this falls back through the other
 * identifiers the account actually has rather than to a generic greeting —
 * the email's local part, then the phone number. Only a customer with none
 * of the three gets the neutral label, and that's a customer the backend
 * genuinely knows nothing else about.
 */
export function customerDisplayName(customer: Customer | null | undefined): string {
  const name = customer?.name?.trim();
  if (name) return name;

  const emailLocalPart = customer?.email?.trim().split("@")[0];
  if (emailLocalPart) return emailLocalPart;

  const phone = customer?.phone?.trim();
  if (phone) return phone;

  return "My Account";
}

/** First word of the display name — the navbar's compact "Hi, Vyom" form. */
export function customerFirstName(customer: Customer | null | undefined): string {
  return customerDisplayName(customer).split(/\s+/)[0];
}
