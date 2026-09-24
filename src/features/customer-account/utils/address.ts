import type { CustomerAddress } from "@/lib/customerSession";

/**
 * The address as display lines, skipping whatever the customer left blank.
 * Order and composition follow the card in Figma node 1414:9505 — street,
 * area, landmark, then "City, State". Pincode and country are stored and
 * editable but aren't shown on the card.
 */
export function formatAddressLines(address: CustomerAddress): string[] {
  const cityLine = [address.city, address.state].filter(Boolean).join(", ");
  return [address.line1, address.line2, address.landmark, cityLine].filter(
    (line): line is string => Boolean(line && line.trim())
  );
}

/** True when there's nothing worth saving — stops an empty card being created. */
export function isAddressEmpty(address: CustomerAddress): boolean {
  return formatAddressLines(address).length === 0;
}
