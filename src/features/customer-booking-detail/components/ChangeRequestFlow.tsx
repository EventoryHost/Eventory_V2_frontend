"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { addCustomizeRequests } from "@/lib/customerBookingApi";
import { useCustomizeWorkshop } from "@/features/customer-package-detail/hooks/useCustomizeWorkshop";
import CustomizeWorkshopModal from "@/features/customer-package-detail/components/CustomizeWorkshopModal";
import { changedFields, newItemFields } from "@/features/customer-package-detail/components/YourRequestsPanel";
import { toCustomizeRequestPayload } from "@/features/customer-package-detail/utils/customizeRequestPayload";
import { formatPrice } from "@/features/customer-package-detail/utils/formatPrice";
import type { CustomizeRequest, IncludedItemEntry } from "@/features/customer-package-detail/types";
import { OPEN_HELP_EVENT } from "@/features/customer-help/helpContext";
import type { PackagePanelView, PanelRequest } from "../services/getPackagePanelView";
import { setupsWithAcceptedRequests } from "../utils/proposal";
import ProposalRequestCard from "./ProposalRequestCard";

const ICON = "/images/customer/proposal";

/** Image, title, facts and price — the head of every setup card in this flow. */
function SetupSummary({ entry, itemCount }: { entry: IncludedItemEntry; itemCount: number }) {
  // A stand-in setup (the package no longer lists it) has no art to show.
  const hasArt = Boolean(entry.image) || entry.details.length > 0;
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      {hasArt && (
        <div className="relative h-[178px] w-full shrink-0 overflow-hidden rounded-xl bg-[#F4F4F5] sm:w-[216px]">
          {entry.image && <Image src={entry.image} alt={entry.title} fill sizes="216px" className="object-cover" />}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2 self-stretch sm:justify-center">
        <h3 className="text-[20px] font-medium leading-7 text-[#3F3F47]">{entry.title}</h3>
        <dl className="flex flex-col gap-1.5 text-[14px] leading-5">
          {entry.details.map((detail) => (
            <div key={detail.label} className="flex flex-wrap gap-1">
              <dt className="text-[#71717B]">{detail.label}:</dt>
              <dd className="font-medium text-[#3F3F47]">
                {detail.value}
                {detail.moreCount ? <span className="underline">, +{detail.moreCount} more</span> : null}
              </dd>
            </div>
          ))}
          <div className="flex gap-1">
            <dt className="text-[#71717B]">Item count:</dt>
            <dd className="font-medium text-[#3F3F47]">{itemCount}</dd>
          </div>
        </dl>
        {entry.price > 0 && <p className="text-[20px] font-semibold leading-7 text-[#030303]">{formatPrice(entry.price)}</p>}
      </div>
    </div>
  );
}

function DashedDivider() {
  return (
    <span aria-hidden className="relative block h-px w-full">
      <Image src={`${ICON}/dashed-divider.svg`} alt="" fill sizes="712px" className="object-fill" />
    </span>
  );
}

/** A workshop request as a "Your requests" card (node 2276:16755). */
function PendingRequest({ request, onDelete }: { request: CustomizeRequest; onDelete: () => void }) {
  const { item } = request;
  if (request.requestType === "remove") {
    return (
      <ProposalRequestCard
        title={item.category ?? "Item"}
        fields={[]}
        removedLabel={item.label}
        tag="remove"
        onDelete={onDelete}
      />
    );
  }
  const rows = request.requestType === "change" ? changedFields(item) : newItemFields(item);
  return (
    <ProposalRequestCard
      title={item.label}
      fields={rows.map((row) => ({ label: row.label, was: row.from, now: row.to }))}
      tag={request.requestType}
      onDelete={onDelete}
    />
  );
}

/**
 * Review Proposal → "Still Needs Changes" (node 2276:16500 / 2276:16746).
 * "Which Setup is this about?" lists the package's setups with the vendor's
 * decisions so far; picking one opens the same "Customize items" editor the
 * PDP uses (node 2276:17137). Edits start from the agreed state — accepted
 * requests already applied — and collect under "Your requests" until
 * "Update Package" sends them to the vendor (the design's footer reads
 * "Continue" until there is something to send).
 *
 * Sending moves the booking to InDiscussion. On a Confirmed booking that
 * reopens it (the date stays held) until the customer accepts the vendor's
 * next proposal, so the picker says so before they send.
 */
export default function ChangeRequestFlow({
  view,
  onBack,
  onSubmitted,
}: {
  view: PackagePanelView;
  onBack: () => void;
  onSubmitted: () => void;
}) {
  const baseline = useMemo(
    () => setupsWithAcceptedRequests(view.setups.map((setup) => setup.entry), view.proposal.requests),
    [view]
  );
  const workshop = useCustomizeWorkshop(baseline);
  const [editingSetupId, setEditingSetupId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  // A ref, not just state: two taps in the same frame both see isSending false.
  const sendingRef = useRef(false);
  const isConfirmed = view.status === "Confirmed";

  const decisionsBySetup = useMemo(() => {
    const map: Record<string, PanelRequest[]> = {};
    for (const setup of view.setups) map[setup.entry.id] = Object.values(setup.requestsByItemId).flat();
    return map;
  }, [view]);

  const editingSetup = baseline.find((entry) => entry.id === editingSetupId) ?? null;
  const requestCount = workshop.requests.length;

  async function handleUpdatePackage() {
    if (requestCount === 0 || sendingRef.current) return;
    sendingRef.current = true;
    setIsSending(true);
    setSendError(null);
    try {
      await addCustomizeRequests(view.reference, workshop.requests.map(toCustomizeRequestPayload));
      onSubmitted();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Couldn't send your requests. Please try again.");
      sendingRef.current = false;
      setIsSending(false);
    }
  }

  if (editingSetup) {
    return (
      <CustomizeWorkshopModal
        setup={editingSetup}
        items={workshop.itemsBySetup[editingSetup.id] ?? []}
        workshop={workshop}
        onClose={() => setEditingSetupId(null)}
        onBack={() => setEditingSetupId(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Which Setup is this about?">
      <div className="flex max-h-[90vh] w-full max-w-[800px] flex-col overflow-hidden rounded-3xl bg-white">
        <header className="flex items-center gap-3.5 border-b border-[#E4E4E7] px-7 pb-[21px] pt-5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to the proposal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#F4F4F5]"
          >
            <Image src={`${ICON}/arrow-left.svg`} alt="" width={24} height={24} />
          </button>
          <div className="flex flex-col gap-[3px]">
            <h2 className="text-[24px] font-semibold leading-8 text-[#030303]">Which Setup is this about?</h2>
            <p className="text-[14px] leading-5 text-[#71717B]">Pick the setup you want to customize</p>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 py-4">
          {baseline.length === 0 && (
            <p className="py-4 text-[14px] leading-5 text-[#71717B]">
              This package no longer lists its setups, so changes can&apos;t be picked here. Use Help &amp; Support to
              tell us what you need and we&apos;ll pass it on to the vendor.
            </p>
          )}

          <ul className="flex flex-col">
            {baseline.map((entry) => {
              const decided = decisionsBySetup[entry.id] ?? [];
              const accepted = decided.filter((request) => request.status === "Accepted").length;
              const rejected = decided.filter((request) => request.status === "Rejected");

              return (
                <li key={entry.id} className="border-b border-[#E4E4E7] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setEditingSetupId(entry.id)}
                    aria-label={`Customize ${entry.title}`}
                    className="flex w-full flex-col gap-4 rounded-xl px-4 pb-2 pt-[17px] text-left transition-colors hover:bg-[#FAFAFA]"
                  >
                    <SetupSummary entry={entry} itemCount={entry.items.length} />
                    <DashedDivider />

                    <div className="flex flex-col gap-2 pb-3">
                      {(accepted > 0 || rejected.length > 0) && (
                        <div className="flex flex-wrap gap-3">
                          {accepted > 0 && (
                            <span className="flex min-h-8 items-center gap-2 rounded-full bg-[#F0FDF4] pl-3 pr-4 text-[14px] leading-5 text-[#008236]">
                              <Image src={`${ICON}/chip-accepted.svg`} alt="" width={14} height={14} />
                              {accepted} Accepted
                            </span>
                          )}
                          {rejected.length > 0 && (
                            <span className="flex min-h-8 items-center gap-1 rounded-full bg-[#FFF2F1] pl-3 pr-4 text-[14px] leading-5 text-[#C81E0D]">
                              <Image src={`${ICON}/chip-rejected.svg`} alt="" width={14} height={14} />
                              {rejected.length} Rejected
                            </span>
                          )}
                        </div>
                      )}

                      {(entry.items.length > 0 || rejected.length > 0) && (
                        <>
                          <p className="text-[12px] font-medium leading-5 text-[#71717B]">ITEMS</p>
                          <ul className="grid gap-x-3 gap-y-2 sm:grid-cols-2">
                            {entry.items.map((item) => (
                              <li key={item.id} className="flex items-start gap-2 text-[14px] leading-5 text-[#3F3F47]">
                                <span className="flex h-4 w-[14px] shrink-0 items-start pt-0.5">
                                  <Image src={`${ICON}/item-kept.svg`} alt="" width={13} height={13} />
                                </span>
                                {item.label} × {item.qty}
                              </li>
                            ))}
                            {rejected.map((request, index) => (
                              <li
                                key={request._id ?? `rejected-${index}`}
                                className="flex items-start gap-2 text-[14px] leading-5 text-[#3F3F47]"
                              >
                                <span className="flex h-4 w-[14px] shrink-0 items-start pt-0.5">
                                  <Image src={`${ICON}/chip-rejected.svg`} alt="Rejected" width={14} height={14} />
                                </span>
                                {request.label}
                                {request.quantity != null ? ` × ${request.quantity}` : ""}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {requestCount > 0 && (
            <section className="flex flex-col gap-5 rounded-2xl bg-[#FFFBEB] p-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-[16px] font-semibold leading-6 text-[#3F3F47]">Your requests</span>
                  <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#BB4D00] px-1.5 text-[12px] leading-[18px] text-white">
                    {requestCount}
                  </span>
                </div>
                <p className="text-[12px] leading-[18px] text-[#71717B]">
                  {isConfirmed
                    ? "Your booking is confirmed. Sending these reopens it: the vendor will reply with an updated proposal for you to accept, and your date stays held meanwhile."
                    : "The vendor will see these requests and get back to you with an updated proposal."}
                </p>
              </div>

              {baseline.map((entry) => {
                const forSetup = workshop.requests.filter((request) => request.setupId === entry.id);
                if (forSetup.length === 0) return null;
                return (
                  <div key={entry.id} className="flex flex-col gap-4 rounded-xl bg-white p-4">
                    <SetupSummary entry={entry} itemCount={(workshop.itemsBySetup[entry.id] ?? []).length} />
                    <div className="flex flex-col gap-2">
                      {forSetup.map((request) => (
                        <PendingRequest
                          key={request.key}
                          request={request}
                          onDelete={() => workshop.dismissRequest(request)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </div>

        <footer className="flex flex-col gap-2 border-t border-[#E4E4E7] px-7 py-4">
          {sendError && <p className="text-[12px] leading-4 text-[#C81E0D]">{sendError}</p>}
          <div className="flex gap-5">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_HELP_EVENT))}
              className="flex-1 rounded-xl border border-[#EA1D3B] px-7 py-3 text-[16px] leading-6 text-[#EA1D3B] transition-colors hover:bg-[#FEF2F3]"
            >
              Help &amp; Support
            </button>
            <button
              type="button"
              onClick={handleUpdatePackage}
              disabled={requestCount === 0 || isSending}
              title={requestCount === 0 ? "Pick a setup and make a change first" : undefined}
              className="flex-1 rounded-xl bg-brand-primary px-7 py-3 text-[16px] font-semibold leading-6 text-white transition-colors hover:bg-[#E14E64] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? "Sending…" : requestCount > 0 ? "Update Package" : "Continue"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
