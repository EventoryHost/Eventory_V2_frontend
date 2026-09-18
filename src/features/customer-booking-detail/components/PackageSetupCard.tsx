import Image from "next/image";
import { formatAmount } from "@/features/customer-account/utils/groupBookings";
import type { PanelRequest, PanelSetup } from "../services/getPackagePanelView";

const REQUEST_BADGE: Record<PanelRequest["requestType"], string> = {
  change: "Change",
  add: "Adding",
  remove: "Removal",
};

/** "Colour: ~~White~~ Maroon" — the old value struck out, the new one bold. */
function RequestLine({ label, was, now }: { label: string; was?: string; now?: string }) {
  if (!now && !was) return null;
  return (
    <div className="flex items-start gap-1 text-[12px] leading-[18px]">
      <span className="text-[#3F3F47]">
        {label}:{" "}
        {was && was !== now && <span className="text-[#9F9FA9] line-through">{was}</span>}
      </span>
      {now && <span className="font-semibold text-[#030303]">{now}</span>}
    </div>
  );
}

function RequestCard({ request }: { request: PanelRequest }) {
  const colours = request.colours?.join(", ");
  const previousColours = request.previous?.colours?.join(", ");
  const isRemoval = request.requestType === "remove";

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-[#E4E4E7] bg-white px-3 py-2">
      {isRemoval ? (
        <p className="flex-1 px-1 text-[14px] leading-5 text-[#9F9FA9] line-through">{request.label}</p>
      ) : (
        <div className="flex flex-1 flex-col gap-1 py-[3px]">
          {/* The label leads when the request isn't about one named attribute. */}
          {request.requestType === "add" && (
            <p className="text-[12px] font-semibold leading-[18px] text-[#030303]">{request.label}</p>
          )}
          <RequestLine label="Type" was={request.previous?.type} now={request.type ?? undefined} />
          <RequestLine label="Colour" was={previousColours} now={colours || undefined} />
          <RequestLine label="Volume" was={request.previous?.volume} now={request.volume ?? undefined} />
          {request.quantity != null && (
            <RequestLine label="Quantity" now={String(request.quantity)} />
          )}
        </div>
      )}

      <span className="shrink-0 rounded-full bg-[#F4F4F5] px-2 py-0.5 text-[9px] font-medium uppercase leading-[18px] text-[#3F3F47]">
        {REQUEST_BADGE[request.requestType]}
      </span>
    </div>
  );
}

function RequestsBox({ requests }: { requests: PanelRequest[] }) {
  if (requests.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-[#F4F4F5] px-2 pb-3 pt-2">
      <p className="text-[14px] font-medium leading-5 text-[#1447E6]">Requests</p>
      <div className="flex flex-col gap-2">
        {requests.map((request, index) => (
          <RequestCard key={`${request.itemId}-${request.requestType}-${index}`} request={request} />
        ))}
      </div>
    </div>
  );
}

/** One setup inside the package panel (node 1629:9319). */
export default function PackageSetupCard({ setup }: { setup: PanelSetup }) {
  const { entry, requestsByItemId } = setup;
  const looseRequests = requestsByItemId[""] ?? [];

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-5">
      <div className="flex gap-4">
        <div className="relative h-[134px] w-[179px] shrink-0 overflow-hidden rounded-xl bg-[#F4F4F5]">
          {entry.image && <Image src={entry.image} alt={entry.title} fill sizes="179px" className="object-cover" />}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-[16px] font-semibold leading-6 text-[#030303]">{entry.title}</h4>
            {entry.price > 0 && (
              <span className="shrink-0 text-[14px] font-semibold leading-5 text-[#030303]">
                {formatAmount(entry.price)}
              </span>
            )}
          </div>

          <dl className="flex flex-col gap-1">
            {entry.details.map((detail) => (
              <div key={detail.label} className="flex flex-wrap items-baseline gap-1 text-[14px] leading-6">
                <dt className="text-[#71717B]">{detail.label}:</dt>
                <dd className="text-[#030303]">
                  {detail.value}
                  {detail.moreCount ? (
                    <span className="text-[#3F3F47] underline"> +{detail.moreCount} more</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {entry.items.length > 0 && (
        <>
          <span aria-hidden className="h-px w-full bg-[#E4E4E7]" />

          <div className="flex flex-col gap-4">
            <p className="text-[14px] leading-5 text-[#3F3F47]">
              ITEMS <span className="text-[#71717B]">( {entry.items.length} Items )</span>
            </p>

            {entry.items.map((line) => {
              const spec = [line.category, line.type, line.colours?.join(" + "), line.volume]
                .filter(Boolean)
                .join(" · ");

              return (
                <div key={line.id} className="flex flex-col gap-2">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[14px] font-semibold leading-5 text-[#030303]">
                      {line.label} ×{line.qty}
                    </p>
                    {spec && <p className="text-[14px] leading-5 text-[#71717B]">{spec}</p>}
                  </div>
                  <RequestsBox requests={requestsByItemId[line.id] ?? []} />
                </div>
              );
            })}

            {/* Requests the package's current items no longer account for. */}
            <RequestsBox requests={looseRequests} />
          </div>
        </>
      )}
    </article>
  );
}
