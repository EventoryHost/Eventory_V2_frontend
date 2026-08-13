import { apiFetch } from "./apiClient";

// The real cart payload groups items by a bare vendorId ObjectId — no
// business name, no avatar (Eventory_V2_backend customerCartController.js
// never populates it). There's no /customer/vendors/:id endpoint to resolve
// it safely, so this falls back to the vendor-management router's
// unauthenticated GET /vendors/:id, explicitly projected to the same
// public-safe field whitelist the discovery endpoints use via ?select= —
// never KYC/banking/contact fields.

const PUBLIC_SELECT = "id,businessName,isIndividual,profilePicture,isVerified,city";

export interface RawVendorPublicMinimal {
  id: string;
  businessName?: string;
  isIndividual?: boolean;
  profilePicture?: string;
  isVerified?: boolean;
  city?: string;
}

export async function getVendorPublic(vendorId: string) {
  return apiFetch<{ success: boolean; data: RawVendorPublicMinimal }>(
    `/vendors/${vendorId}?select=${PUBLIC_SELECT}`,
    { auth: false }
  );
}
