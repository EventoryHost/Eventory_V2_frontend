import type { BookingJourneyStep } from "../types";

function formatStepDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * The event journey (nodes 1629:6665 onward): a marker per step joined by a
 * connector, the reached steps in full colour and the rest muted.
 */
export default function BookingJourney({ steps }: { steps: BookingJourneyStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => {
        const isReached = step.state !== "upcoming";
        const isLast = index === steps.length - 1;
        const date = step.date ? formatStepDate(step.date) : null;

        return (
          <li key={step.id} className="flex gap-2">
            {/* Marker + connector */}
            <div className="flex w-8 shrink-0 flex-col items-center">
              <span
                className={`mt-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 ${
                  step.state === "current"
                    ? "border-brand-primary"
                    : step.state === "done"
                      ? "border-brand-primary bg-brand-primary"
                      : "border-[#E4E4E7]"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    step.state === "current" ? "bg-brand-primary" : "bg-white"
                  }`}
                />
              </span>
              {!isLast && (
                <span
                  aria-hidden
                  className={`w-px flex-1 ${step.state === "done" ? "bg-brand-primary" : "bg-[#E4E4E7]"}`}
                />
              )}
            </div>

            <div className={`flex flex-1 flex-col gap-1.5 pt-1 ${isLast ? "" : "pb-8"}`}>
              <div className="flex items-baseline justify-between gap-4">
                <p
                  className={`text-[16px] font-semibold leading-[23px] ${
                    isReached ? "text-[#030303]" : "text-[#71717B]"
                  }`}
                >
                  {step.title}
                </p>
                {date && <span className="shrink-0 text-[14px] leading-5 text-[#9F9FA9]">{date}</span>}
              </div>
              <p className={`text-[14px] leading-5 ${isReached ? "text-[#71717B]" : "text-[#9F9FA9]"}`}>
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
