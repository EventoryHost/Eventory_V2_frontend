"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, CircleMinus } from "lucide-react";
import Breadcrumb from "@/components/customer/Breadcrumb";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import {
  updateCartItem,
  removeCartItem,
  moveCartItemToWishlist,
  clearCart,
  getCartQuote,
  type RawCartAddOn,
  type RawCartPayload,
  type RawCartQuote,
} from "@/lib/customerCartApi";
import { ApiError } from "@/lib/apiClient";
import type { AppliedCoupon, CartPageData, CartVendor, RecommendedAddon } from "../types";
import { getCartPageData, mapCartPayload, type VendorCardMeta } from "../services/getCartPageData";
import { buildCartPaymentSummary } from "../services/getCartPaymentSummary";
import { mockCartPageData, mockRecommendedAddons } from "../data/mockCartData";
import { applyCouponCode, removeCouponCode } from "../services/applyCouponCode";
import { getRecommendedAddons } from "../services/getRecommendedAddons";
import { startCheckout } from "../services/startCheckout";
import VendorGroupCard from "./VendorGroupCard";
import PaymentSummary from "./PaymentSummary";
import LoggedInPaymentSummary from "@/features/customer-booking/components/PaymentSummary";
import PaymentScheduleDialog from "@/features/customer-booking/components/PaymentScheduleDialog";

type AuthIntent =
  | { type: "continue" }
  | { type: "wishlist"; itemId: string }
  | { type: "wishlist-all" }
  | null;

function toRawAddOns(addons: CartVendor["addons"]): RawCartAddOn[] {
  return addons.map((addon) => ({ addOnId: addon.id, name: addon.title, price: addon.price, quantity: addon.quantity }));
}

export default function CartPageContent() {
  const router = useRouter();
  const [data, setData] = useState<CartPageData | null>(null);
  const [recommendedAddons, setRecommendedAddons] = useState<RecommendedAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showingFallbackData, setShowingFallbackData] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [continueLoading, setContinueLoading] = useState(false);
  const [continueMessage, setContinueMessage] = useState<string | null>(null);

  const [authIntent, setAuthIntent] = useState<AuthIntent>(null);
  const { isLoggedIn } = useCustomerSession();

  // Only fetched for a logged-in customer — GET /customer/cart/quote is the
  // exact same shape as a checkout session's lockedQuote (see
  // getCartPaymentSummary.ts), which is what lets the logged-in Payment
  // Summary here render identically to Review's, before any checkout
  // session even exists.
  const [cartQuote, setCartQuote] = useState<RawCartQuote | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const vendorNamesRef = useRef(new Map<string, VendorCardMeta>());

  async function applyPayload(payload: RawCartPayload) {
    const mapped = mapCartPayload(payload, vendorNamesRef.current);
    setShowingFallbackData(false);
    setData(mapped);
    getRecommendedAddons(mapped.vendors)
      .then(setRecommendedAddons)
      .catch(() => setRecommendedAddons([]));
  }

  async function refreshCart() {
    setLoadError(null);
    try {
      const mapped = await getCartPageData();
      const isFallback = mapped === mockCartPageData;
      setShowingFallbackData(isFallback);
      mapped.vendors.forEach((v) => {
        if (!vendorNamesRef.current.has(v.vendorId)) {
          vendorNamesRef.current.set(v.vendorId, {
            name: v.vendorName,
            initial: v.avatarInitial,
            avatar: v.avatar,
            rating: v.rating,
            reviewCount: v.reviewCount,
            eventsOnEventory: v.eventsOnEventory,
          });
        }
      });
      setData(mapped);
      if (isFallback) {
        setRecommendedAddons(mockRecommendedAddons);
      } else {
        const addons = await getRecommendedAddons(mapped.vendors).catch(() => []);
        setRecommendedAddons(addons);
      }
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't load your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetched whenever the cart itself changes (data) so the token
  // amount/rows stay in sync with every add/remove/quantity/coupon change —
  // logged-out visitors never fetch this at all.
  useEffect(() => {
    if (!isLoggedIn) {
      setCartQuote(null);
      return;
    }
    let cancelled = false;
    getCartQuote()
      .then((response) => {
        if (!cancelled) setCartQuote(response.quote);
      })
      .catch(() => {
        if (!cancelled) setCartQuote(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, data]);

  const vendors = data?.vendors ?? [];
  const selectedVendors = useMemo(() => vendors.filter((v) => v.selected), [vendors]);
  const cartPaymentSummary = useMemo(() => buildCartPaymentSummary(cartQuote, vendors), [cartQuote, vendors]);

  // The real cart is vendor-grouped (a vendor can have several packages in
  // it) — `vendors` here is a flat item list (see types.ts's doc comment on
  // CartVendor), so group it back by vendorId for rendering, preserving each
  // vendor's first-appearance order.
  const vendorGroups = useMemo(() => {
    const order: string[] = [];
    const byVendorId = new Map<string, CartVendor[]>();
    for (const item of vendors) {
      if (!byVendorId.has(item.vendorId)) {
        byVendorId.set(item.vendorId, []);
        order.push(item.vendorId);
      }
      byVendorId.get(item.vendorId)!.push(item);
    }
    return order.map((vendorId) => ({ vendorId, items: byVendorId.get(vendorId)! }));
  }, [vendors]);

  async function handleToggleSelected(itemId: string) {
    const item = vendors.find((v) => v.id === itemId);
    if (!item) return;
    try {
      // Unchecking only excludes the item from the checkout total —
      // selectedForCheckout is a plain toggle, the item stays in the cart
      // either way. cartPricingService.js only sums selectedForCheckout:true
      // items, so the backend already reflects this correctly with no
      // change needed there.
      const payload = await updateCartItem(itemId, { selectedForCheckout: !item.selected });
      await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't update that item.");
    }
  }

  /** Select/deselect every package under one vendor at once (the header checkbox). */
  async function handleToggleVendorSelected(itemIds: string[], nextSelected: boolean) {
    try {
      let payload: RawCartPayload | null = null;
      // Sequential, not Promise.all — each PATCH returns the full cart
      // snapshot, so overlapping writes could have one response clobber
      // another's; awaiting one at a time keeps the final `payload` correct.
      for (const itemId of itemIds) {
        payload = await updateCartItem(itemId, { selectedForCheckout: nextSelected });
      }
      if (payload) await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't update those items.");
    }
  }

  async function handleRemove(itemId: string) {
    try {
      const payload = await removeCartItem(itemId);
      await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't remove that item.");
    }
  }

  async function moveToWishlistNow(itemId: string) {
    try {
      const payload = await moveCartItemToWishlist(itemId);
      await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't move that item to your wishlist.");
    }
  }

  function handleMoveToWishlist(itemId: string) {
    if (!isLoggedIn) {
      setAuthIntent({ type: "wishlist", itemId });
      return;
    }
    void moveToWishlistNow(itemId);
  }

  async function moveAllToWishlistNow() {
    try {
      let payload: RawCartPayload | null = null;
      // Sequential — each request returns the full cart snapshot, so
      // overlapping writes could have one response clobber another's.
      for (const item of vendors) {
        payload = await moveCartItemToWishlist(item.id);
      }
      if (payload) await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't move everything to your wishlist.");
    }
  }

  function handleWishlistAll() {
    if (vendors.length === 0) return;
    if (!isLoggedIn) {
      setAuthIntent({ type: "wishlist-all" });
      return;
    }
    void moveAllToWishlistNow();
  }

  async function handleRemoveAll() {
    if (vendors.length === 0) return;
    if (!window.confirm("Remove every package from your cart? This can't be undone.")) return;
    try {
      // clearCart's response is just {status,message,count} — not the full
      // cart payload every other mutation returns — so re-fetch instead of
      // applyPayload.
      await clearCart();
      await refreshCart();
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't clear your cart.");
    }
  }

  async function handleAddRecommendedAddon(addon: RecommendedAddon) {
    const item = vendors.find((v) => v.id === addon.itemId);
    if (!item) return;
    const nextAddOns = [...toRawAddOns(item.addons), { addOnId: addon.id, name: addon.title, price: addon.price, quantity: 1 }];
    try {
      const payload = await updateCartItem(item.id, { selectedAddOns: nextAddOns });
      await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't add that add-on.");
    }
  }

  async function handleIncrementAddon(itemId: string, addonId: string) {
    const item = vendors.find((v) => v.id === itemId);
    if (!item) return;
    const nextAddOns = toRawAddOns(item.addons).map((a) =>
      a.addOnId === addonId ? { ...a, quantity: a.quantity + 1 } : a
    );
    try {
      const payload = await updateCartItem(itemId, { selectedAddOns: nextAddOns });
      await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't update that add-on.");
    }
  }

  async function handleDecrementAddon(itemId: string, addonId: string) {
    const item = vendors.find((v) => v.id === itemId);
    if (!item) return;
    const nextAddOns = toRawAddOns(item.addons).map((a) =>
      a.addOnId === addonId ? { ...a, quantity: Math.max(1, a.quantity - 1) } : a
    );
    try {
      const payload = await updateCartItem(itemId, { selectedAddOns: nextAddOns });
      await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't update that add-on.");
    }
  }

  async function handleRemoveAddon(itemId: string, addonId: string) {
    const item = vendors.find((v) => v.id === itemId);
    if (!item) return;
    const nextAddOns = toRawAddOns(item.addons).filter((a) => a.addOnId !== addonId);
    try {
      const payload = await updateCartItem(itemId, { selectedAddOns: nextAddOns });
      await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't remove that add-on.");
    }
  }

  // codeOverride: the logged-in Payment Summary (customer-booking's
  // PaymentSummary) manages its own input and calls onApplyCoupon(code)
  // directly, instead of reading the couponCode state this component itself
  // uses for the logged-out variant's own coupon input.
  async function handleApplyCoupon(codeOverride?: string) {
    const code = codeOverride ?? couponCode;
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await applyCouponCode(code);
      setAppliedCoupon(result);
      setCouponCode("");
      await refreshCart();
    } catch (error) {
      setCouponError(error instanceof ApiError ? error.message : "Something went wrong.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleRemoveCoupon() {
    try {
      await removeCouponCode();
    } finally {
      setAppliedCoupon(null);
      await refreshCart();
    }
  }

  async function proceedToCheckout() {
    setContinueLoading(true);
    setContinueMessage(null);
    try {
      const result = await startCheckout({
        vendorIds: selectedVendors.map((v) => v.id),
        addonIds: selectedVendors.flatMap((v) => v.addons.map((a) => a.id)),
        couponCode: appliedCoupon?.code,
      });
      if (result.redirectHref) {
        router.push(result.redirectHref);
        return;
      }
      setContinueMessage("Your cart is ready — checkout will open here once it's live.");
    } finally {
      setContinueLoading(false);
    }
  }

  function handleContinue() {
    if (!isLoggedIn) {
      setAuthIntent({ type: "continue" });
      return;
    }
    void proceedToCheckout();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="font-figtree text-[14px] text-neutral-secondary">Loading your cart…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-2 pb-10 sm:px-6 sm:pb-12">
      <div className="mb-8">
        <Breadcrumb items={data?.breadcrumb ?? [{ label: "Home", href: "/" }, { label: "Cart" }]} />
      </div>

      {/* lg:w-2/3 matches the vendor-cards column below, so this row (and
          the buttons inside it) ends flush with the cards' right edge
          instead of spanning the full page width past where Payment
          summary starts on wide screens. */}
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4 lg:w-2/3">
        <div className="flex flex-col gap-[5px]">
          <h1 className="font-figtree text-[28px] leading-[36px] font-semibold tracking-[-0.42px] text-[#030303]">
            Cart
          </h1>
          <p className="font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
            Open a package to see its pricing breakdown, or view full details.
          </p>
        </div>

        {vendors.length > 0 && (
          <div className="flex shrink-0 items-center gap-4 pt-1.5">
            <button
              type="button"
              onClick={handleWishlistAll}
              className="flex items-center gap-1.5 font-figtree text-[13px] font-medium text-black transition-opacity hover:opacity-70"
            >
              <Bookmark className="h-4 w-4" /> Wishlist All
            </button>
            <span className="h-4 w-px bg-neutral-subtle" aria-hidden="true" />
            <button
              type="button"
              onClick={handleRemoveAll}
              className="flex items-center gap-1.5 font-figtree text-[13px] font-medium text-black transition-opacity hover:opacity-70"
            >
              <CircleMinus className="h-4 w-4" /> Remove All
            </button>
          </div>
        )}
      </div>

      {loadError && (
        <div className="mb-6 rounded-2xl border border-error-700/20 bg-error-subtle px-5 py-4 font-figtree text-[13px] text-error-700">
          {loadError}
        </div>
      )}

      {showingFallbackData && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-50 px-5 py-4 font-figtree text-[13px] text-amber-800">
          We couldn&apos;t reach your cart right now, so we&apos;re showing example data. Refresh to try loading your real cart again.
        </div>
      )}

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <div className="flex w-full flex-grow flex-col gap-10 lg:w-2/3">
          {vendorGroups.map((group, index) => (
            <div key={group.vendorId} className="flex flex-col gap-10">
              {index > 0 && <hr className="border-neutral-subtle/70" />}
              <VendorGroupCard
                vendorName={group.items[0].vendorName}
                avatarInitial={group.items[0].avatarInitial}
                avatar={group.items[0].avatar}
                rating={group.items[0].rating}
                reviewCount={group.items[0].reviewCount}
                eventsOnEventory={group.items[0].eventsOnEventory}
                items={group.items}
                recommendedAddons={recommendedAddons.filter((a) => group.items.some((item) => item.id === a.itemId))}
                onToggleSelected={handleToggleSelected}
                onToggleVendorSelected={handleToggleVendorSelected}
                onRemove={handleRemove}
                onMoveToWishlist={handleMoveToWishlist}
                onIncrementAddon={handleIncrementAddon}
                onDecrementAddon={handleDecrementAddon}
                onRemoveAddon={handleRemoveAddon}
                onAddRecommendedAddon={handleAddRecommendedAddon}
              />
            </div>
          ))}

          {vendorGroups.length === 0 && (
            <div className="rounded-3xl border border-neutral-subtle bg-white p-10 text-center">
              <p className="font-figtree text-[15px] text-neutral-secondary">
                Your cart is empty. Explore packages to add vendors.
              </p>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-6 lg:sticky lg:top-24 lg:w-1/3">
          {isLoggedIn ? (
            <LoggedInPaymentSummary
              vendorCount={data?.vendorCount ?? 0}
              packageCount={data?.itemCount ?? 0}
              rows={cartPaymentSummary.rows}
              grandTotal={cartPaymentSummary.grandTotal}
              tokenAmount={cartPaymentSummary.tokenAmount}
              payInFull={cartPaymentSummary.payInFull}
              isFreeCheckout={cartPaymentSummary.isFreeCheckout}
              cancellationNote={cartPaymentSummary.cancellationNote}
              ctaLabel="Continue to Details"
              onCtaClick={handleContinue}
              ctaLoading={continueLoading}
              ctaDisabled={selectedVendors.length === 0}
              onApplyCoupon={handleApplyCoupon}
              couponLoading={couponLoading}
              couponFeedback={couponError}
              appliedCouponCode={appliedCoupon?.code ?? null}
              onViewSchedule={() => setIsScheduleOpen(true)}
            />
          ) : (
            <PaymentSummary
              vendorCount={data?.vendorCount ?? 0}
              itemCount={data?.itemCount ?? 0}
              subtotal={data?.subtotal ?? 0}
              discount={data?.discount ?? 0}
              total={data?.total ?? 0}
              couponCode={couponCode}
              onCouponCodeChange={setCouponCode}
              onApplyCoupon={handleApplyCoupon}
              couponLoading={couponLoading}
              couponError={couponError}
              appliedCoupon={appliedCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onContinue={handleContinue}
              continueLoading={continueLoading}
              continueDisabled={selectedVendors.length === 0}
              continueMessage={continueMessage}
              isLoggedIn={isLoggedIn}
            />
          )}
        </div>
      </div>

      <PaymentScheduleDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        milestones={cartPaymentSummary.milestones}
      />

      <AuthModal
        isOpen={authIntent !== null}
        onClose={() => setAuthIntent(null)}
        onAuthenticated={() => {
          const intent = authIntent;
          setAuthIntent(null);
          if (!intent) return;
          if (intent.type === "continue") void proceedToCheckout();
          else if (intent.type === "wishlist-all") void moveAllToWishlistNow();
          else void moveToWishlistNow(intent.itemId);
        }}
      />
    </div>
  );
}
