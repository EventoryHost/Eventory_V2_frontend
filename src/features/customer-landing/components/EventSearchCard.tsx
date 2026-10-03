"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getPackagesFilters } from "@/lib/customerDiscoveryApi";
import { filterHiddenEventCategories } from "@/lib/eventCategories";
import { toEventTypeDisplay, allowedServicesFor, ALL_SERVICE_OPTIONS } from "../data/eventSearchTaxonomy";
import SearchFieldTrigger from "./SearchFieldTrigger";
import SearchDropdownPanel from "./SearchDropdownPanel";
import SearchDatePicker from "./SearchDatePicker";

type OpenField = "eventType" | "vendorService" | "date" | null;

export default function EventSearchCard() {
  const router = useRouter();
  // Real, live backend categories (same source the pre-redesign dropdown
  // used) — NOT a small curated list. A first pass at this component
  // wrongly hardcoded 4 entries, hiding ~18 other real live categories;
  // see eventSearchTaxonomy.ts's own comment for the fix.
  const [rawEventCategories, setRawEventCategories] = useState<string[]>([]);
  const [eventType, setEventType] = useState("");
  const [vendorService, setVendorService] = useState("");
  const [date, setDate] = useState("");
  // Separate from the committed eventType/vendorService above — real bug
  // fixed 2026-10-03 (PM-reported: "make them textfields, filter dropdown
  // as you type"). Each field is now a real text input; `query` is what's
  // currently typed (used to filter the dropdown rows), while
  // eventType/vendorService only changes once a row is actually picked.
  const [eventTypeQuery, setEventTypeQuery] = useState("");
  const [vendorServiceQuery, setVendorServiceQuery] = useState("");
  const [openField, setOpenField] = useState<OpenField>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPackagesFilters()
      .then((response) => {
        if (!cancelled) setRawEventCategories(response.filters.eventCategories);
      })
      .catch(() => {
        // Best-effort — the Event Type dropdown just stays empty on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const eventTypes = useMemo(
    () => toEventTypeDisplay(filterHiddenEventCategories(rawEventCategories)),
    [rawEventCategories]
  );

  const filteredEventTypes = useMemo(() => {
    const q = eventTypeQuery.trim().toLowerCase();
    if (!q) return eventTypes;
    return eventTypes.filter((type) => type.label.toLowerCase().includes(q));
  }, [eventTypes, eventTypeQuery]);

  // Values this event type doesn't actually offer, by keyword family (see
  // eventSearchTaxonomy.ts). No event type picked yet = every service
  // shown, unfiltered (fields can be filled in any order).
  const allowedServiceIds = eventType ? allowedServicesFor(eventType) : null;
  const serviceOptionsForEventType = allowedServiceIds
    ? ALL_SERVICE_OPTIONS.filter((option) => allowedServiceIds.includes(option.id))
    : ALL_SERVICE_OPTIONS;
  const filteredServiceOptions = useMemo(() => {
    const q = vendorServiceQuery.trim().toLowerCase();
    if (!q) return serviceOptionsForEventType;
    return serviceOptionsForEventType.filter((option) => option.label.toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceOptionsForEventType, vendorServiceQuery]);

  useEffect(() => {
    if (!openField) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenField(null);
        // Nothing matching was picked while a field was open — revert the
        // typed text back to whatever's actually selected, same as the old
        // SearchAutocomplete's own click-outside behaviour.
        setEventTypeQuery(eventType);
        setVendorServiceQuery(vendorServiceLabel());
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openField]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  function vendorServiceLabel() {
    return ALL_SERVICE_OPTIONS.find((option) => option.id === vendorService)?.label ?? "";
  }

  function selectEventType(label: string) {
    setEventType(label);
    setEventTypeQuery(label);
    // Switching event type can make the currently-picked service
    // incompatible with the new one — clear it rather than silently
    // leaving an invalid combination selected.
    const allowed = allowedServicesFor(label);
    if (vendorService && allowed && !allowed.includes(vendorService)) {
      setVendorService("");
      setVendorServiceQuery("");
    }
    // Hand-off: focus moves to the next empty field 120ms later — vendor
    // service if it's still empty, else straight to the date calendar.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    const next: OpenField = vendorService ? (date ? null : "date") : "vendorService";
    if (next) advanceTimer.current = setTimeout(() => setOpenField(next), 120);
    else setOpenField(null);
  }

  function selectVendorService(id: string) {
    setVendorService(id);
    setVendorServiceQuery(ALL_SERVICE_OPTIONS.find((option) => option.id === id)?.label ?? "");
    // Hand-off: picking a vendor service immediately opens the date
    // calendar for the customer to pick a date next — real bug fixed
    // 2026-10-03 (PM-reported: "as soon as i select the vendor service,
    // the date must be focused").
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (!date) advanceTimer.current = setTimeout(() => setOpenField("date"), 120);
    else setOpenField(null);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (eventType) params.set("eventType", eventType);
    if (vendorService) params.set("category", vendorService);
    if (date) params.set("date", date);
    const query = params.toString();
    router.push(query ? `/packages/browse?${query}` : "/packages/browse");
  }

  const isReady = Boolean(eventType || vendorService || date);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-stretch gap-4 rounded-[20px] bg-white p-4 shadow-[0px_8px_40px_0px_rgba(0,0,0,0.06)] sm:flex-row sm:items-end"
    >
      <div className="relative flex min-w-0 flex-1 flex-col gap-2.5 sm:min-w-[220px]">
        <span className="font-figtree text-[14px] font-semibold text-[#030303]">Event Type</span>
        <SearchFieldTrigger
          query={eventTypeQuery}
          onQueryChange={(text) => {
            setEventTypeQuery(text);
            if (eventType && text !== eventType) setEventType("");
            setOpenField("eventType");
          }}
          placeholder="Search your Event type"
          isOpen={openField === "eventType"}
          onFocus={() => setOpenField("eventType")}
        />
        {openField === "eventType" && (
          <SearchDropdownPanel
            header="Popular events"
            rows={filteredEventTypes}
            selectedId={eventType}
            onSelect={selectEventType}
          />
        )}
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-2.5 sm:min-w-[180px]">
        <span className="font-figtree text-[14px] font-semibold text-[#030303]">Choose vendor service</span>
        <SearchFieldTrigger
          query={vendorServiceQuery}
          onQueryChange={(text) => {
            setVendorServiceQuery(text);
            if (vendorService && text !== vendorServiceLabel()) setVendorService("");
            setOpenField("vendorService");
          }}
          placeholder="Type to search service"
          isOpen={openField === "vendorService"}
          onFocus={() => setOpenField("vendorService")}
        />
        {openField === "vendorService" && (
          <SearchDropdownPanel
            header={eventType ? `Services for ${eventType}` : "All services"}
            rows={filteredServiceOptions}
            selectedId={vendorService}
            onSelect={selectVendorService}
          />
        )}
      </div>

      <div className="min-w-0 flex-1 sm:min-w-[180px]">
        <SearchDatePicker
          label="Event Date"
          value={date}
          onChange={setDate}
          placeholder="Dates"
          isOpen={openField === "date"}
          onOpenChange={(open) => setOpenField(open ? "date" : null)}
        />
      </div>

      <button
        type="button"
        onClick={handleSearch}
        className={`flex h-12 shrink-0 items-center justify-center gap-2 rounded-full pr-8 pl-6 font-figtree text-[16px] font-semibold text-white transition-all duration-300 sm:w-auto ${
          isReady ? "bg-[#F0596F] pl-6" : "bg-[#F6A9B6] pl-8"
        }`}
      >
        {isReady && <Search size={18} className="shrink-0" />}
        Search
      </button>
    </div>
  );
}
