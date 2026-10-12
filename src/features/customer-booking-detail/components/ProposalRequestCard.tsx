import Image from "next/image";

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
 */
export default function ProposalRequestCard({
  title,
  fields,
  removedLabel,
  tag,
  decision,
  onDelete,
}: {
  title: string;
  fields: ProposalRequestField[];
  /** Set on a removal: the item name, struck through, in place of fields. */
  removedLabel?: string;
  tag: keyof typeof REQUEST_TAG;
  decision?: keyof typeof DECISION_ICON;
  onDelete?: () => void;
}) {
  const icon = decision ? DECISION_ICON[decision] : null;
  // The "Your requests" cards (with a delete button) run a size up.
  const isPending = Boolean(onDelete);
  const fieldText = isPending ? "text-[14px] leading-5" : "text-[12px] leading-[18px]";

  return (
    <div className={`flex w-full flex-col gap-1 rounded-xl border border-[#E4E4E7] bg-white px-3 ${isPending ? "py-3" : "py-2"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14px] font-semibold leading-5 text-[#030303]">{title}</p>
        <span
          className={`shrink-0 rounded-full bg-[#F4F4F5] px-2 py-0.5 font-medium uppercase leading-[18px] text-[#3F3F47] ${
            isPending ? "text-[12px]" : "text-[9px]"
          }`}
        >
          {REQUEST_TAG[tag]}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
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
        </div>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Remove request for ${title}`}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#E4E4E7] bg-white transition-colors hover:bg-[#F4F4F5]"
          >
            <Image src="/images/customer/proposal/trash.svg" alt="" width={18} height={18} />
          </button>
        )}
      </div>
    </div>
  );
}
