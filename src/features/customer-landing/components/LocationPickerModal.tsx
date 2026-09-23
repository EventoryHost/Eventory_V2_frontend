"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Contact, LocateFixed, Loader2, MapPin, X } from "lucide-react";
import { detectCurrentLocation, searchIndianLocations, type LocationSuggestion } from "@/lib/geocoding";
import { getServiceableCities } from "@/lib/customerDiscoveryApi";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import type { CustomerAddress } from "@/lib/customerSession";

function addressLine(address: CustomerAddress) {
  return [address.line1, address.line2, address.pincode, address.city, address.state].filter(Boolean).join(", ");
}

const DETECT_ERROR_MESSAGES: Record<string, string> = {
  imprecise: "Couldn't get a precise enough fix — try searching instead.",
  denied: "Location access was denied — allow it in your browser, or search instead.",
  unsupported: "Your browser doesn't support location detection — search instead.",
  error: "Couldn't detect your location — try searching instead.",
};

export default function LocationPickerModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (label: string) => void;
}) {
  const { session } = useCustomerSession();
  const savedAddresses = session?.addresses ?? [];

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [isSavedOpen, setIsSavedOpen] = useState(savedAddresses.length > 0);
  const [cities, setCities] = useState<string[]>([]);
  const [cityQuery, setCityQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getServiceableCities()
      .then(setCities)
      .catch(() => {
        // No fallback list — an empty dropdown is honest; a hardcoded one
        // would silently drift from the real serviceable region.
      });
  }, []);

  useEffect(() => {
    if (!isCityOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) setIsCityOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCityOpen]);

  async function handleAutoDetect() {
    setIsDetecting(true);
    setDetectError(null);
    const outcome = await detectCurrentLocation();
    setIsDetecting(false);
    if (outcome.status === "success") {
      onSelect(outcome.label);
      onClose();
      return;
    }
    setDetectError(DETECT_ERROR_MESSAGES[outcome.status]);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelected(null);
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    // Short debounce (not 0) so a fast typist still collapses to one
    // request per pause instead of one per keystroke, while still updating
    // on every character typed rather than waiting for a 3-char minimum.
    const debounce = setTimeout(() => {
      searchIndianLocations(trimmed, controller.signal)
        .then(setSuggestions)
        .catch(() => {
          // Aborted by a newer keystroke, or a network hiccup — either way
          // just leave the list as it was.
        })
        .finally(() => setIsLoading(false));
    }, 150);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  function handleConfirm() {
    if (!selected) return;
    onSelect(selected);
    onClose();
  }

  return (
    <div className="absolute left-0 top-full z-30 mt-2 w-[460px] max-w-[calc(100vw-2rem)] rounded-2xl border border-black/5 bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-figtree text-[16px] leading-none font-semibold text-[#030303]">
            Where are you located
          </h3>
          <p className="mt-1 font-figtree text-[12px] leading-none font-normal text-[#71717B]">
            Helps us to find packages in your location
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-6 w-6 shrink-0 items-center justify-center text-[#030303]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {savedAddresses.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#E4E4E7] pt-3 pr-1.5 pb-3 pl-3">
          <button
            type="button"
            onClick={() => setIsSavedOpen((open) => !open)}
            aria-expanded={isSavedOpen}
            className="flex w-full items-center justify-between pr-1.5"
          >
            <span className="flex items-center gap-2 font-figtree text-[16px] font-semibold text-[#030303]">
              <Contact className="h-5 w-5 shrink-0" />
              Saved addresses
            </span>
            {isSavedOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-[#030303]" />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-[#030303]" />
            )}
          </button>

          {isSavedOpen && (
            <div className="mt-3 max-h-[190px] overflow-y-auto pr-1.5">
              {savedAddresses.map((address, index) => {
                const line = addressLine(address);
                if (!line) return null;
                const isSelected = selected === line;
                return (
                  <button
                    key={address._id ?? index}
                    type="button"
                    onClick={() => setSelected(line)}
                    className="flex w-full items-start gap-3 border-t border-black/10 py-4 text-left transition-colors first:border-t-0 first:pt-0 hover:bg-black/[0.02]"
                  >
                    <div className="flex-1">
                      <p className="font-figtree text-[16px] font-semibold text-[#030303]">
                        {address.label || "Address"}
                      </p>
                      <p
                        className="mt-1 font-figtree font-normal text-[#71717B]"
                        style={{
                          fontSize: "var(--S-Font-size, 14px)",
                          lineHeight: "var(--S-Line-height, 20px)",
                          letterSpacing: "var(--S-Letter-spacing, 0)",
                        }}
                      >
                        {line}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected ? "border-brand-primary" : "border-[#9F9FA9]"
                      }`}
                    >
                      {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-brand-primary" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div ref={cityRef} className="relative mt-4">
        <div className="flex w-full items-center rounded-xl border border-black/10 focus-within:border-brand-primary">
          <input
            value={isCityOpen ? cityQuery : (selectedCity ?? cityQuery)}
            onChange={(event) => {
              setCityQuery(event.target.value);
              setSelectedCity(null);
              setIsCityOpen(true);
            }}
            onFocus={() => setIsCityOpen(true)}
            placeholder="Select district"
            className="w-full rounded-l-xl bg-transparent px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none placeholder:text-neutral-tertiary"
          />
          <button
            type="button"
            onClick={() => setIsCityOpen((open) => !open)}
            aria-expanded={isCityOpen}
            aria-label="Toggle district list"
            className="flex h-full shrink-0 items-center px-4"
          >
            {isCityOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-[#9F9FA9]" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-[#9F9FA9]" />
            )}
          </button>
        </div>

        {isCityOpen && (
          <div className="absolute left-0 top-full z-10 mt-1 max-h-[220px] w-full overflow-y-auto rounded-2xl border border-black/5 bg-white shadow-lg">
            {(() => {
              const matches = cities.filter((cityOption) =>
                cityOption.toLowerCase().includes(cityQuery.trim().toLowerCase())
              );
              if (cities.length === 0) {
                return <p className="px-4 py-3 font-figtree text-[13px] text-neutral-tertiary">Loading…</p>;
              }
              if (matches.length === 0) {
                return <p className="px-4 py-3 font-figtree text-[13px] text-neutral-tertiary">No matches found</p>;
              }
              return matches.map((cityOption) => (
                <button
                  key={cityOption}
                  type="button"
                  onClick={() => {
                    setSelectedCity(cityOption);
                    setCityQuery("");
                    setSelected(cityOption);
                    setIsCityOpen(false);
                  }}
                  className={`flex w-full items-center border-b border-black/5 px-4 py-3 text-left font-figtree text-[14px] transition-colors last:border-b-0 ${
                    selectedCity === cityOption ? "bg-brand-subtle text-brand-950" : "text-brand-950 hover:bg-black/[0.03]"
                  }`}
                >
                  {cityOption}
                </button>
              ));
            })()}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search pincode, area, locality, or colony.."
        className="mt-3 w-full rounded-xl border border-black/10 px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
      />

      {query.trim().length >= 1 && (
        <div className="mt-2 max-h-[240px] overflow-y-auto rounded-2xl border border-black/5">
          {isLoading && suggestions.length === 0 ? (
            <p className="px-4 py-3 font-figtree text-[13px] text-neutral-tertiary">Searching…</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 font-figtree text-[13px] text-neutral-tertiary">No matches found</p>
          ) : (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => setSelected(suggestion.label)}
                className={`flex w-full items-center gap-3 border-b border-black/5 px-4 py-3 text-left transition-colors last:border-b-0 ${
                  selected === suggestion.label ? "bg-brand-subtle" : "hover:bg-black/[0.03]"
                }`}
              >
                <MapPin className="h-4 w-4 shrink-0 text-brand-950" />
                <span className="truncate font-figtree text-[13px] text-brand-950">
                  {suggestion.label}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-black/10" />
        <span className="font-figtree text-[12px] font-medium text-neutral-tertiary">or</span>
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <button
        type="button"
        onClick={handleAutoDetect}
        disabled={isDetecting}
        className="mt-4 flex w-full items-center justify-center gap-2 font-figtree text-[14px] font-semibold text-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDetecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed className="h-4 w-4" />
        )}
        {isDetecting ? "Detecting your location…" : "Detect my location"}
      </button>
      {detectError && (
        <p className="mt-2 text-center font-figtree text-[12px] text-error-700">{detectError}</p>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selected}
        className={`mt-4 w-full rounded-full py-3 font-figtree text-[14px] font-bold text-white transition-colors ${
          selected ? "bg-brand-primary" : "cursor-not-allowed bg-black/10 text-white/70"
        }`}
      >
        Confirm
      </button>
    </div>
  );
}
