import { apiFetch } from "./apiClient";

export interface VendorLeadPayload {
  name: string;
  vendorType: string;
  /** Digits only, no country code — the form's own fixed +91 prefix is not part of this value. */
  phone: string;
}

interface VendorLeadResponse {
  success: boolean;
  data: { leadId: string; name: string };
}

/** POST /customer/become-vendor/leads — public, no customer account/login required. */
export async function createVendorLead(payload: VendorLeadPayload): Promise<VendorLeadResponse["data"]> {
  const response = await apiFetch<VendorLeadResponse>("/customer/become-vendor/leads", {
    method: "POST",
    body: payload,
    auth: false,
    credentials: "omit",
  });
  return response.data;
}
