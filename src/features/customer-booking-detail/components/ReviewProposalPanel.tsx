"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { acceptProposal, type RawPricingBreakdown, type RawPricingRow } from "@/lib/customerBookingApi";
import { formatPrice } from "@/features/customer-package-detail/utils/formatPrice";
import { getPackagePanelView, type PackagePanelView, type PanelRequest, type PanelSetup } from "../services/getPackagePanelView";
import ProposalRequestCard, { type ProposalRequestField } from "./ProposalRequestCard";
import ChangeRequestFlow from "./ChangeRequestFlow";

/** The design's own row labels; the vendor's custom discount label is kept as-is. */
const PRICE_ROW_LABEL: Partial<Record<RawPricingRow["key"], string>> = {
  itemsAdded: "Items added",
  addonsAdded: "Add-ons added",
  itemsRemoved: "Items Removed",
  addonsRemoved: "Add-ons removed",
};

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * What a decided request asked for. A change request stores every attribute
 * of the item (not just the edited one), so only the values that actually
 * differ from what the package sold are shown, old value struck through.
 */
function decidedFields(request: PanelRequest): ProposalRequestField[] {
  const isChange = request.requestType === "change";
  const previous = request.previous;
  const fields: ProposalRequestField[] = [];

  const push = (label: string, now: string | null | undefined, was?: string) => {
    if (!now) return;
    if (isChange && was !== undefined && was === now) return;
    fields.push({ label, now, was: isChange ? was : undefined });
  };

  push(previous?.typeLabel ?? "Type", request.type, previous?.type);
  push("Colour", request.colours?.join(", "), previous?.colours?.join(", ") || undefined);
  push("Volume", request.volume, previous?.volume);
  push(
    "Quantity",
    request.quantity != null ? String(request.quantity) : null,
    previous?.qty != null ? String(previous.qty) : undefined
  );
  return fields;
}

function DecidedRequest({ request }: { request: PanelRequest }) {
  const isRemoval = request.requestType === "remove";
  return (
    <ProposalRequestCard
      title={isRemoval ? (request.previous?.category ?? "Item") : request.label}
      fields={isRemoval ? [] : decidedFields(request)}
      removedLabel={isRemoval ? request.label : undefined}
      tag={request.requestType}
      decision={request.status === "Rejected" ? "Rejected" : "Accepted"}
    />
  );
}

function DecisionBox({ tone, requests }: { tone: "accepted" | "rejected"; requests: PanelRequest[] }) {
  if (requests.length === 0) return null;
  const isAccepted = tone === "accepted";

  return (
    <div className={`flex flex-col gap-3 rounded-xl px-4 py-3 ${isAccepted ? "bg-[#F0FDF4]" : "bg-[#FFFBEB]"}`}>
      <span
        className={`self-start rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${
          isAccepted ? "bg-[#008236] text-[#F0FDF4]" : "bg-[#BB4D00] text-[#FFFBEB]"
        }`}
      >
        {isAccepted ? "Accepted Requests" : "Rejected Requests"}
      </span>
      <div className="flex flex-col gap-2">
        {requests.map((request, index) => (
          <DecidedRequest key={request._id ?? `${request.itemId}-${index}`} request={request} />
        ))}
      </div>
    </div>
  );
}

function decidedRequestsOf(setup: PanelSetup) {
  return Object.values(setup.requestsByItemId)
    .flat()
    .filter((request) => request.status !== "Pending");
}

/** One setup with its decided requests (node 2276:15972's "Article"). */
function ProposalSetup({ setup }: { setup: PanelSetup }) {
  const { entry } = setup;
  // Pending ones (a follow-up round the vendor hasn't answered) aren't part of
  // this proposal; no status at all predates the field and reads as accepted.
  const requests = decidedRequestsOf(setup);
  const accepted = requests.filter((request) => request.status !== "Rejected");
  const rejected = requests.filter((request) => request.status === "Rejected");

  return (
    <section className="flex flex-col">
      <p className="flex min-h-12 items-center gap-2 py-4 text-[15px] leading-[22.5px]">
        <span className="font-semibold text-[#030303]">Items Customization requests</span>
        <span className="text-[#71717B]">({plural(requests.length, "request")})</span>
      </p>

      <article className="flex flex-col gap-4 rounded-3xl border border-[#E4E4E7] p-[21px]">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative h-[134px] w-full shrink-0 overflow-hidden rounded-2xl bg-[#F4F4F5] sm:w-[179px]">
            {entry.image && <Image src={entry.image} alt={entry.title} fill sizes="179px" className="object-cover" />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h4 className="text-[16px] font-semibold leading-6 text-[#030303]">{entry.title}</h4>
            <dl className="flex flex-col gap-0.5">
              {entry.details.map((detail) => (
                <div key={detail.label} className="flex flex-wrap items-baseline gap-1 text-[14px] leading-6">
                  <dt className="text-[#71717B]">{detail.label}:</dt>
                  <dd className="text-[#3F3F47]">
                    {detail.value}
                    {detail.moreCount ? <span className="underline">, +{detail.moreCount} more</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {entry.items.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-[#E4E4E7] pt-[9px]">
            <p className="text-[12px] font-medium leading-5 text-[#71717B]">
              ITEMS ( {plural(entry.items.length, "Item")} )
            </p>
            <div className="flex flex-col gap-4">
              {entry.items.map((line) => {
                const spec = [line.category, line.type, line.volume].filter(Boolean).join(" · ");
                return (
                  <div key={line.id} className="flex flex-col gap-0.5">
                    <p className="text-[14px] font-semibold leading-5 text-[#030303]">
                      {line.label} <span className="text-[#3F3F47]">×{line.qty}</span>
                    </p>
                    {spec && <p className="text-[14px] leading-5 text-[#3F3F47]">{spec}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <DecisionBox tone="accepted" requests={accepted} />
          <DecisionBox tone="rejected" requests={rejected} />
        </div>
      </article>
    </section>
  );
}

function PriceRow({ label, amount, tone = "default" }: { label: string; amount: number; tone?: "default" | "deduction" }) {
  const colour = tone === "deduction" ? "text-[#008236]" : "text-[#030303]";
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className={`text-[16px] leading-6 ${colour}`}>{label}</span>
      <span className={`text-right text-[16px] font-medium leading-6 ${colour}`}>
        {amount < 0 ? `-${formatPrice(Math.abs(amount))}` : formatPrice(amount)}
      </span>
    </div>
  );
}

/** "Price breakdown" (node 2276:15972's "Dialog - Price breakdown"), built from the vendor's keyed pricing rows. */
function PriceBreakdown({ breakdown }: { breakdown: RawPricingBreakdown }) {
  return (
    <section className="flex flex-col rounded-2xl bg-white">
      <h3 className="px-6 pb-4 pt-6 text-[24px] font-semibold leading-8 text-[#030303]">Price breakdown</h3>
      <div className="flex flex-col gap-3 px-6">
        <div className="flex items-baseline justify-between border-t border-[#E4E4E7] pt-[17px] text-[18px] font-semibold text-[#030303]">
          <span>Original Package Price</span>
          <span>{formatPrice(breakdown.originalPackagePrice)}</span>
        </div>

        {(breakdown.additions.length > 0 || breakdown.deductions.length > 0) && (
          <div className="flex flex-col">
            {breakdown.additions.map((row) => (
              <PriceRow key={row.key} label={PRICE_ROW_LABEL[row.key] ?? row.label} amount={row.amount} />
            ))}
            {breakdown.deductions.map((row) => (
              <PriceRow key={row.key} label={PRICE_ROW_LABEL[row.key] ?? row.label} amount={row.amount} tone="deduction" />
            ))}
          </div>
        )}

        {breakdown.tax.amount > 0 && (
          <div className="flex items-center justify-between border-t border-[#E4E4E7] pb-2 pt-[17px]">
            <span className="flex items-center gap-1.5 text-[16px] text-[#3F3F47]">
              GST {breakdown.tax.ratePct}%
              <span
                title="Government tax on event services, charged on the subtotal."
                className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-[#9F9FA9] text-[10px] text-[#3F3F47]"
              >
                i
              </span>
            </span>
            <span className="text-[16px] text-[#3F3F47]">{formatPrice(breakdown.tax.amount)}</span>
          </div>
        )}

        <div className="flex items-baseline justify-between border-t border-[#E4E4E7] pb-6 pt-[17px] font-semibold text-[#030303]">
          <span className="text-[20px]">Final Amount</span>
          <span className="text-[28px]">{formatPrice(breakdown.finalAmount)}</span>
        </div>
      </div>
    </section>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Review Proposal (node 2276:15962): the vendor's answer to the customer's
 * "Customize items" requests — what was accepted, what was rejected, and
 * what it now costs. The customer accepts it, or sends more changes through
 * the "Which Setup is this about?" flow.
 */
export default function ReviewProposalPanel({
  bookingReference,
  onClose,
  onResolved,
}: {
  bookingReference: string;
  onClose: () => void;
  /** The customer answered — the page behind should reload its booking. */
  onResolved: () => void;
}) {
  const [view, setView] = useState<PackagePanelView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSettled, setHasSettled] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPackagePanelView(bookingReference)
      .then((next) => {
        if (!cancelled) setView(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load this proposal");
      })
      .finally(() => {
        if (!cancelled) setHasSettled(true);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingReference]);

  // Escape closes (unless the change flow, which has its own, is open), and
  // the page behind shouldn't scroll while this is open.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isChanging) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, isChanging]);

  const copyReference = useCallback(() => {
    navigator.clipboard?.writeText(bookingReference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [bookingReference]);

  async function handleAccept() {
    setIsAccepting(true);
    setActionError(null);
    try {
      await acceptProposal(bookingReference);
      onResolved();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Couldn't accept this proposal. Please try again.");
      setIsAccepting(false);
    }
  }

  if (isChanging && view) {
    return (
      <ChangeRequestFlow
        view={view}
        onBack={() => setIsChanging(false)}
        onSubmitted={onResolved}
      />
    );
  }

  const setupsWithRequests = view?.setups.filter((setup) => decidedRequestsOf(setup).length > 0) ?? [];
  const response = view?.proposal.response;
  const respondedOn = formatDate(response?.respondedAt ?? null);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true" aria-label="Review Proposal">
      <button type="button" aria-label="Close" className="flex-1 cursor-default" onClick={onClose} />

      <div className="flex h-full w-full max-w-[640px] flex-col bg-white">
        <header className="flex items-start justify-between gap-4 border-b border-[#E4E4E7] px-7 pb-[21px] pt-5">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={copyReference}
              className="flex items-center gap-2 text-[14px] leading-5 text-[#71717B]"
              aria-label={`Copy booking reference ${bookingReference}`}
            >
              {bookingReference}
              <Image src="/images/customer/proposal/copy.svg" alt="" width={16} height={16} />
              {copied && <span className="text-[12px] text-[#008236]">Copied</span>}
            </button>
            <h2 className="text-[24px] font-semibold leading-8 text-[#030303]">Review Proposal</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review proposal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#F4F4F5]"
          >
            <Image src="/images/customer/proposal/close.svg" alt="" width={16} height={16} />
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 pb-6">
          {!hasSettled ? (
            <p className="pt-6 text-[14px] leading-5 text-[#71717B]">Loading the proposal…</p>
          ) : error || !view ? (
            <p className="pt-6 text-[14px] leading-5 text-[#C81E0D]">{error ?? "Could not load this proposal"}</p>
          ) : (
            <>
              {setupsWithRequests.length === 0 ? (
                <p className="pt-6 text-[14px] leading-5 text-[#71717B]">There are no customization requests on this booking.</p>
              ) : (
                setupsWithRequests.map((setup) => <ProposalSetup key={setup.entry.id} setup={setup} />)
              )}

              {view.addOns.length > 0 && (
                <section className="flex flex-col">
                  <p className="flex min-h-12 items-center gap-2 py-4 text-[15px] leading-[22.5px]">
                    <span className="font-semibold text-[#030303]">Added Add-ons</span>
                    <span className="text-[#71717B]">({view.addOns.length})</span>
                  </p>
                  <ul className="flex flex-col gap-4 rounded-3xl border border-[#E4E4E7] p-[21px]">
                    {view.addOns.map((addOn) => (
                      <li key={addOn.id} className="flex gap-3">
                        <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-[#F4F4F5]">
                          {addOn.image && <Image src={addOn.image} alt={addOn.name} fill sizes="84px" className="object-cover" />}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <div className="flex items-start justify-between gap-3 text-[14px] font-semibold leading-5 text-[#030303]">
                            <p className="truncate">
                              {addOn.name} <span className="text-[#3F3F47]">×{addOn.quantity}</span>
                            </p>
                            <span className="shrink-0">{formatPrice(addOn.price * addOn.quantity)}</span>
                          </div>
                          {addOn.categoryLabel && (
                            <p className="pb-1.5 text-[12px] leading-5 text-[#71717B]">{addOn.categoryLabel}</p>
                          )}
                          {addOn.colourLabel && (
                            <p className="rounded-xl bg-[#F4F4F5] px-3 py-2 text-[12px] font-semibold leading-[18px] text-[#030303]">
                              Color: {addOn.colourLabel}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {view.proposal.pricingBreakdown && (
                <div className="border-t border-[#E4E4E7]">
                  <PriceBreakdown breakdown={view.proposal.pricingBreakdown} />
                </div>
              )}
            </>
          )}
        </div>

        {view && (
          <footer className="flex flex-col gap-2 border-t border-[#E4E4E7] px-7 py-4">
            {actionError && <p className="text-[12px] leading-4 text-[#C81E0D]">{actionError}</p>}
            {view.proposal.awaitingReview ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsChanging(true)}
                  disabled={isAccepting}
                  className="flex-1 rounded-xl border border-[#EA1D3B] px-7 py-3 text-[16px] leading-6 text-[#EA1D3B] transition-colors hover:bg-[#FEF2F3] disabled:opacity-60"
                >
                  Still Needs Changes
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="flex-1 rounded-xl bg-brand-primary px-7 py-3 text-[16px] font-semibold leading-6 text-white transition-colors hover:bg-[#E14E64] disabled:opacity-60"
                >
                  {isAccepting ? "Accepting…" : "Accept Proposal"}
                </button>
              </div>
            ) : (
              <p className="text-[14px] leading-5 text-[#71717B]">
                {response?.status === "Accepted"
                  ? `You accepted this proposal${respondedOn ? ` on ${respondedOn}` : ""}.`
                  : response?.status === "ChangesRequested"
                    ? "You asked for more changes. The vendor will get back to you."
                    : "The vendor is still working on your requests."}
              </p>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
