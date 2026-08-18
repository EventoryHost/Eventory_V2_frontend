// Anchor-nav targets for the PDP sticky sub-nav. Order here is the tab order
// and the scroll-spy priority order (last section whose top has passed the
// scroll-spy line wins).
export const PDP_SECTIONS: { id: string; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "about", label: "About" },
  { id: "included", label: "What's included" },
  { id: "not-included", label: "Not included" },
  { id: "addons", label: "Add-ons" },
  { id: "venue-needs", label: "Venue needs" },
  { id: "event-day", label: "Event day" },
  { id: "reviews", label: "Reviews" },
  { id: "vendor", label: "Vendor" },
  { id: "policies", label: "Policies" },
];
