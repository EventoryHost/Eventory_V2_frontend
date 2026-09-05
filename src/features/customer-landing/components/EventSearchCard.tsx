"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPackagesFilters } from "@/lib/customerDiscoveryApi";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";
import SearchDropdown from "./SearchDropdown";
import SearchDatePicker from "./SearchDatePicker";

export default function EventSearchCard() {
  const router = useRouter();
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  const [eventType, setEventType] = useState("");
  const [vendorService, setVendorService] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    let cancelled = false;
    getPackagesFilters()
      .then((response) => {
        if (!cancelled) setEventCategories(response.filters.eventCategories);
      })
      .catch(() => {
        // Best-effort — the Event Type dropdown just stays empty on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();
    if (eventType) params.set("eventType", eventType);
    if (vendorService) params.set("category", vendorService);
    if (date) params.set("date", date);
    const query = params.toString();
    router.push(query ? `/vendors?${query}` : "/vendors");
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4 rounded-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] px-6 py-6">
      <SearchDropdown
        label="Event Type"
        value={eventType}
        onChange={setEventType}
        placeholder="Any event type"
        options={eventCategories.map((category) => ({ value: category, label: category }))}
      />

      <SearchDropdown
        label="Choose vendor service"
        value={vendorService}
        onChange={setVendorService}
        placeholder="Any service"
        options={VENDOR_CATEGORIES.filter((category) => category.id !== "all").map((category) => ({
          value: category.id,
          label: category.label,
        }))}
      />

      <SearchDatePicker label="Event Date" value={date} onChange={setDate} placeholder="Select date" />

      <button
        type="button"
        onClick={handleSearch}
        className="shrink-0 rounded-full bg-brand-primary px-10 py-3 text-[15px] font-semibold text-white sm:w-auto w-full"
      >
        Search
      </button>
    </div>
  );
}
