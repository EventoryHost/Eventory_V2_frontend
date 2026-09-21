import type { RawPackageServiceability } from "@/lib/customerPackageDetailApi";

export type ServiceabilityState =
  | { status: "idle" }
  | { status: "no-pincode" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: RawPackageServiceability };

/**
 * Placeholder UI (design hasn't handed over the real one yet) for whether
 * this vendor serves the customer's event location. Only a confirmed
 * SERVICE_AREA_MATCH is shown as good news — CITY_LEVEL_FALLBACK and
 * NO_AREAS_DECLARED are serviceable but not confirmed local matches, so
 * they show nothing rather than overclaiming.
 */
export default function LocationServiceability({ state }: { state: ServiceabilityState }) {
  if (state.status === "idle" || state.status === "error") return null;
  if (state.status === "loading") {
    return <p className="mt-1.5 font-figtree text-[11px] font-medium text-[#71717B]">Checking availability for your location…</p>;
  }
  if (state.status === "no-pincode") {
    return (
      <p className="mt-1.5 font-figtree text-[11px] font-medium text-[#71717B]">
        Add a 6-digit pincode to check if this vendor serves your area.
      </p>
    );
  }

  const { data } = state;
  if (data.serviceable) {
    return data.basis === "SERVICE_AREA_MATCH" ? (
      <p className="mt-1.5 font-figtree text-[12px] font-medium text-success-700">Available at your location</p>
    ) : null;
  }

  const cities = data.vendorServiceAreas?.cities ?? [];
  const localities = data.vendorServiceAreas?.localities ?? [];
  const isOutsideRegion = data.reason === "OUTSIDE_SERVICE_REGION";

  return (
    <div className="mt-2 rounded-xl border border-[#FCA5A5]/60 bg-[#FEF2F2] p-3">
      <p className="font-figtree text-[13px] leading-[18px] font-semibold text-[#B91C1C]">
        Not available for your location
      </p>
      {isOutsideRegion ? (
        <p className="mt-1 font-figtree text-[12px] leading-[16.5px] text-[#3F3F47]">
          We don&apos;t serve this area yet. Eventory currently covers Delhi NCR — Delhi, Gurugram, Faridabad, Noida,
          Greater Noida and Ghaziabad.
        </p>
      ) : (
        <>
          <p className="mt-1 font-figtree text-[12px] leading-[16.5px] text-[#3F3F47]">
            This vendor serves the following areas:
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[...cities, ...localities].map((area) => (
              <span
                key={area}
                className="rounded-full border border-black/10 bg-white px-2.5 py-1 font-figtree text-[11px] font-medium text-[#3F3F47]"
              >
                {area}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
