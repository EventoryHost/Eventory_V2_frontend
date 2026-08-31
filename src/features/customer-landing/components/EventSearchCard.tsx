"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPackagesFilters } from "@/lib/customerDiscoveryApi";
import { VENDOR_CATEGORIES } from "@/features/customer-vendors/data/filterConfig";

const SELECT_CLASSES =
  "w-full rounded-full bg-[#F4F4F5] px-5 py-3 text-[14px] text-[#71717B] outline-none appearance-none";

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
      <div className="flex-1 flex flex-col gap-2">
        <label className="text-[14px] font-semibold text-brand-950">
          Event Type
        </label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">Any event type</option>
          {eventCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <label className="text-[14px] font-semibold text-brand-950">
          Choose vendor service
        </label>
        <select
          value={vendorService}
          onChange={(e) => setVendorService(e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">Any service</option>
          {VENDOR_CATEGORIES.filter((category) => category.id !== "all").map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <label className="text-[14px] font-semibold text-brand-950">
          Event Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-full bg-[#F4F4F5] px-5 py-3 text-[14px] text-[#71717B] outline-none"
        />
      </div>

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
