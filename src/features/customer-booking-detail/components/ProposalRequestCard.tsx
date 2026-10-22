import Image from "next/image";
import type { RawChangeRequest } from "@/lib/customerBookingApi";

export interface ProposalRequestField {
  label: string;
  /** The value before the request, struck through. */
  was?: string;
  now: string;
}

export const REQUEST_TAG = { change: "Change", add: "Adding", remove: "Removal" } as const;

const DECISION_ICON = {
  Accepted: "/images/customer/proposal/request-accepted.svg",
  Rejected: "/images/customer/proposal/request-rejected.svg",
} as const;

/**
 * One request inside Review Proposal's accepted/rejected boxes (node
 * 2276:15972), and in the setup picker's "Your requests" list (node
 * 2276:16755), where it carries a delete button instead of a decision icon.
 * Both designs put the name on its own row, then the values with the
 * CHANGE / ADDING / REMOVAL tag (and the delete button) down the right.
 */
export default function ProposalRequestCard({
  title,
  fields,
  removedLabel,
  tag,
  decision,
  vendorNote,
  onDelete,
}: {
  title?: string;
  fields: ProposalRequestField[];
  /** Set on a removal: the item name, struck through, in place of fields. */
  removedLabel?: string;
  tag: keyof typeof REQUEST_TAG;
  decision?: keyof typeof DECISION_ICON;
  /**
   * The vendor's reason for rejecting. No design covers it — kept to one
   * muted line under the values, in the card's own type scale.
   */
  vendorNote?: string | null;
  onDelete?: () => void;
}) {
  const icon = decision ? DECISION_ICON[decision] : null;
  // The "Your requests" cards (with a delete button) run a size up.
  const isPending = Boolean(onDelete);
  const fieldText = isPending ? "text-[14px] leading-5" : "text-[12px] leading-[18px]";
  const note = decision === "Rejected" ? vendorNote?.trim() : undefined;

  return (
    <div
      className={`flex w-full flex-col rounded-xl border border-[#E4E4E7] bg-white ${
        isPending ? "gap-0.5 p-3" : "gap-1 px-3 py-2"
      }`}
    >
      {title && <p className="text-[14px] font-semibold leading-5 text-[#030303]">{title}</p>}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-[3px]">
          {removedLabel ? (
            <div className="flex items-center gap-2">
              {icon && <Image src={icon} alt="" width={13} height={13} className="h-[13.333px] w-[13.333px] shrink-0" />}
              <p className="text-[14px] leading-5 text-[#9F9FA9] line-through">{removedLabel}</p>
            </div>
          ) : (
            fields.map((field) => (
              <div key={field.label} className="flex items-center gap-2">
                {icon && <Image src={icon} alt="" width={13} height={13} className="h-[13.333px] w-[13.333px] shrink-0" />}
                <p className={`flex flex-wrap items-center gap-1 ${fieldText}`}>
                  <span className="text-[#3F3F47]">
                    {field.label}:{" "}
                    {field.was && field.was !== field.now && (
                      <span className="text-[#9F9FA9] line-through">{field.was}</span>
                    )}
                  </span>
                  <span className="font-semibold text-[#030303]">{field.now}</span>
                </p>
              </div>
            ))
          )}

          {note && (
            <p className="text-[12px] leading-[18px] text-[#71717B]">
              <span className="font-medium text-[#3F3F47]">Vendor&apos;s note:</span> {note}
            </p>
          )}
        </div>

        <div className={`flex shrink-0 flex-col items-end self-stretch ${isPending ? "justify-between gap-4" : ""}`}>
          <span
            className={`rounded-full bg-[#F4F4F5] px-2 py-0.5 font-medium uppercase leading-[18px] text-[#3F3F47] ${
              isPending ? "text-[12px]" : "text-[9px]"
            }`}
          >
            {REQUEST_TAG[tag]}
          </span>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Remove request for ${title ?? removedLabel ?? "this item"}`}
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#E4E4E7] bg-white transition-colors hover:bg-[#F4F4F5]"
            >
              <Image src="/images/customer/proposal/trash.svg" alt="" width={18} height={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * A request from the older add/remove list (Booking.changeRequests), drawn
 * with the same card. It names an item and a quantity rather than a
 * workshop item, so an addition shows its category and quantity and a
 * removal strikes the item through. No status (it predates the field)
 * reads as decided, same as isProposalAwaitingReview.
 */
export function ChangeRequestCard({ request }: { request: RawChangeRequest }) {
  const isRemoval = request.changeType === "Remove";
  const decision = request.status === "Pending" ? undefined : request.status === "Rejected" ? "Rejected" : "Accepted";
  const item = request.item || "Item";
  const fields: ProposalRequestField[] = [];
  if (!isRemoval) {
    if (request.category) fields.push({ label: "Category", now: request.category });
    if (request.qty != null) fields.push({ label: "Quantity", now: String(request.qty) });
  }

  return (
    <ProposalRequestCard
      title={isRemoval ? (request.category ?? "Item") : item}
      fields={fields}
      removedLabel={isRemoval ? item : undefined}
      tag={isRemoval ? "remove" : "add"}
      decision={decision}
      vendorNote={request.vendorNote}
    />
  );
}
