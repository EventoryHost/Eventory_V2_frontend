import type { RawPackageSlotsResponse, RawSlotUnavailableReason } from "@/lib/customerPackageDetailApi";

export type SlotsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: RawPackageSlotsResponse };

const UNAVAILABLE_MESSAGES: Record<RawSlotUnavailableReason, string> = {
  BLOCKED_BY_VENDOR: "The vendor isn't available on this date. Please pick another date.",
  NOT_A_WORKING_DAY: "The vendor doesn't work on this day of the week. Please pick another date.",
  OUTSIDE_AVAILABLE_RANGE: "This date is outside the vendor's available dates. Please pick another date.",
  FULLY_BOOKED: "This date is fully booked. Please pick another date.",
  ALL_SLOTS_BOOKED: "All time slots on this date are booked. Please pick another date.",
};

const NOTE = "font-figtree text-[12px] leading-[16.5px] font-medium text-[#71717B]";

/**
 * "Event timing" — the vendor's own slots for the picked date (from
 * GET /customer/packages/:id/slots), shown as selectable chips. Renders
 * nothing for FULL_DAY packages, and a message instead of empty chips when
 * the day itself is unavailable.
 */
export default function EventTimingSlots({
  state,
  selectedValue,
  onSelect,
}: {
  state: SlotsState;
  /** The selected slot's "HH:MM - HH:MM" value. */
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  if (state.status === "idle") return null;
  if (state.status === "loading") return <p className={NOTE}>Checking available time slots…</p>;
  if (state.status === "error") {
    return <p className="font-figtree text-[12px] leading-[16.5px] font-medium text-error-700">Couldn&apos;t load time slots for this date. Try picking the date again.</p>;
  }

  const { data } = state;
  if (data.workMode === "FULL_DAY") return null;
  if (!data.dayAvailable) {
    return (
      <p className="font-figtree text-[12px] leading-[16.5px] font-medium text-error-700">
        {(data.reason && UNAVAILABLE_MESSAGES[data.reason]) || "This date isn't available. Please pick another date."}
      </p>
    );
  }

  return (
    <div className="border-l-[3px] border-[#F0596F] pl-4">
      <h3 className="font-figtree text-[16px] leading-[20px] font-semibold text-[#3F3F47]">Event timing</h3>
      <p className={`mt-1 ${NOTE}`}>Choose a slot from any of these {data.slots.length}</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {data.slots.map((slot) => {
          const isSelected = slot.available && slot.value === selectedValue;
          return (
            <button
              key={slot.value}
              type="button"
              disabled={!slot.available}
              aria-pressed={isSelected}
              onClick={() => onSelect(slot.value)}
              className={`flex h-11 w-full items-center justify-center rounded-lg border p-1 font-figtree text-[13px] leading-[16.5px] tracking-[-0.01em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? "border-[#B4112A] bg-[#FDEEF0] font-medium text-[#B4112A]"
                  : "border-[#E4E4E7] bg-white font-medium text-[#3F3F47] hover:bg-[#F4F4F5]"
              }`}
            >
              {slot.label.replace(/:00/g, "")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
