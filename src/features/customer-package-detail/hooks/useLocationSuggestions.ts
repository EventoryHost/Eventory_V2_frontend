import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { suggestServiceLocations, type LocationSuggestion } from "@/lib/customerDiscoveryApi";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 200;

function titleCase(text: string): string {
  return text.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

/** What goes into the location box when a suggestion is chosen: it carries the pincode the serviceability check needs. */
export function suggestionText(item: LocationSuggestion): string {
  return `${item.area}, ${titleCase(item.district)}, ${item.pincode}`;
}

/**
 * Typeahead for the event-location box. Suggestions load as the customer
 * types (debounced, stale requests cancelled) and a chosen one is written back
 * through `onPick`. The caller wires `handleKeyDown`/`open` to its own input.
 */
export function useLocationSuggestions(text: string, onPick: (value: string) => void) {
  const [items, setItems] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // The text we just wrote ourselves: no need to search for it again.
  const lastPicked = useRef<string | null>(null);

  useEffect(() => {
    const query = text.trim();
    if (query.length < MIN_CHARS || query === lastPicked.current) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      suggestServiceLocations(query, controller.signal)
        .then((result) => {
          setItems(result);
          setActiveIndex(-1);
        })
        .catch(() => {
          // Typeahead is a convenience; a failed lookup just shows nothing.
        });
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  function pick(item: LocationSuggestion) {
    const value = suggestionText(item);
    lastPicked.current = value.trim();
    setItems([]);
    setOpen(false);
    setActiveIndex(-1);
    onPick(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      pick(items[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return {
    items,
    open: open && items.length > 0,
    activeIndex,
    setOpen,
    setActiveIndex,
    pick,
    handleKeyDown,
    /** The customer typed: forget the last pick and show suggestions again. */
    onUserType: () => {
      lastPicked.current = null;
      setOpen(true);
    },
  };
}
