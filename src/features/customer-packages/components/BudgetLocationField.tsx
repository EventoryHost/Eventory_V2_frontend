"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LocateFixed, Loader2 } from "lucide-react";
import SearchDropdownPanel from "@/features/customer-landing/components/SearchDropdownPanel";

/**
 * Real vendor service-area cities (GET /customer/packages/filters' cities —
 * the cities live packages actually exist in, not a static list) in a
 * type-to-filter dropdown, plus a "use my location" button that reverse-
 * geocodes the browser's GPS position via OpenStreetMap's free Nominatim API
 * (no key needed) and fills the field with whatever city/town name comes
 * back — free text, not required to match one of the dropdown's options,
 * since a customer's real location may not exactly match a vendor's listed
 * service area.
 */
export default function BudgetLocationField({
  cities,
  value,
  onChange,
}: {
  cities: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  const rows = useMemo(() => cities.map((city) => ({ id: city, label: city })), [cities]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.label.toLowerCase().includes(q));
  }, [rows, query]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, value]);

  function commit(next: string) {
    onChange(next);
    setQuery(next);
    setOpen(false);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocateError("Location isn't available on this device");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } }
          );
          const data = await response.json();
          const address = data?.address ?? {};
          const city: string | undefined =
            address.city || address.town || address.village || address.county || address.state_district;
          if (city) commit(city);
          else setLocateError("Couldn't determine your city — type it in instead");
        } catch {
          setLocateError("Couldn't fetch your location — type it in instead");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocateError("Location permission denied — type it in instead");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl border border-[#E4E4E7] bg-white px-4 py-3 transition-colors focus-within:border-brand-primary"
    >
      <span className="block font-figtree text-[13px] text-[#71717B] sm:text-[16px]">Location</span>
      <input
        type="text"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search city"
        className="w-full bg-transparent pr-14 font-figtree text-[14px] font-medium text-[#9F9FA9] outline-none sm:text-[16px]"
      />

      <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          aria-label="Use my current location"
          title="Use my current location"
          className="text-brand-primary"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </button>
        <ChevronDown
          className={`pointer-events-none h-4 w-4 text-brand-950 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {locateError && (
        <p className="mt-1 font-figtree text-[11px] text-red-500">{locateError}</p>
      )}

      {open && (
        <SearchDropdownPanel
          header="Vendor service areas"
          rows={filtered}
          selectedId={value}
          onSelect={commit}
        />
      )}
    </div>
  );
}
