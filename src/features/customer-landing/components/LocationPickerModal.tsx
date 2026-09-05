"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, Loader2, MapPin, X } from "lucide-react";
import { detectCurrentLocation, searchIndianLocations, type LocationSuggestion } from "@/lib/geocoding";

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
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="absolute left-0 top-full z-30 mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-black/5 bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-950" />
          <h3 className="font-figtree text-[15px] leading-[20px] font-bold text-brand-950">
            Let&apos;s Personalize Your Experience!
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 text-neutral-tertiary transition-colors hover:text-brand-950"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <button
        type="button"
        onClick={handleAutoDetect}
        disabled={isDetecting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-brand-primary px-4 py-3 font-figtree text-[14px] font-semibold text-brand-primary transition-colors hover:bg-brand-subtle disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDetecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed className="h-4 w-4" />
        )}
        {isDetecting ? "Detecting your location…" : "Auto-detect my location"}
      </button>
      {detectError && (
        <p className="mt-2 font-figtree text-[12px] text-error-700">{detectError}</p>
      )}

      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Enter pincode, locality, etc"
        className="mt-3 w-full rounded-full border border-black/10 px-4 py-3 font-figtree text-[14px] text-brand-950 outline-none focus:border-brand-primary"
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
