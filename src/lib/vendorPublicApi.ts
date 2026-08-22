import { apiFetch } from "./apiClient";

// The real cart payload groups items by a bare vendorId ObjectId — no
// business name, no avatar (Eventory_V2_backend customerCartController.js
// never populates it). This calls the customer-facing GET
// /customer/vendors/:vendorId, a server-enforced PUBLIC_VENDOR_FIELDS
// whitelist — never phone/email/bank/KYC fields. Do NOT call the
// vendor-management router's internal GET /vendors/:id instead: without an
// explicit ?select= it returns the vendor's entire document.

export interface RawVendorPublicMinimal {
  id: string;
  businessName?: string;
  isIndividual?: boolean;
  vendorType?: string;
  eventCategories?: string[];
  city?: string;
  state?: string;
  serviceAreas?: string[];
  teamSize?: string;
  bookingsPerYear?: string;
  experience?: string;
  profilePicture?: string;
  description?: string;
  businessPhotos?: string[];
  coverImage?: string;
  isVerified?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
}

export async function getVendorPublic(vendorId: string) {
  return apiFetch<{ status: "SUCCESS"; vendor: RawVendorPublicMinimal }>(`/customer/vendors/${vendorId}`, {
    auth: false,
  });
}
