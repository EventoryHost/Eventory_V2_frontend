"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/customer/Breadcrumb";
import AuthModal from "@/features/customer-auth/components/AuthModal";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import {
  updateCartItem,
  removeCartItem,
  moveCartItemToWishlist,
  type RawCartAddOn,
  type RawCartPayload,
} from "@/lib/customerCartApi";
import { ApiError } from "@/lib/apiClient";
import type { AppliedCoupon, CartPageData, CartVendor, RecommendedAddon, EventDetails as EventDetailsData } from "../types";
import { getCartPageData, mapCartPayload } from "../services/getCartPageData";
import { applyCouponCode, removeCouponCode } from "../services/applyCouponCode";
import { getRecommendedAddons } from "../services/getRecommendedAddons";
import { startCheckout } from "../services/startCheckout";
import VendorCard from "./VendorCard";
import AddonSection from "./AddonSection";
import PaymentSummary from "./PaymentSummary";
import WarningCard from "./WarningCard";

type AuthIntent = { type: "continue" } | { type: "wishlist"; itemId: string } | null;

function toRawAddOns(addons: CartVendor["addons"]): RawCartAddOn[] {
  return addons.map((addon) => ({ addOnId: addon.id, name: addon.title, price: addon.price, quantity: addon.quantity }));
}

export default function CartPageContent() {
  const router = useRouter();
  const [data, setData] = useState<CartPageData | null>(null);
  const [recommendedAddons, setRecommendedAddons] = useState<RecommendedAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [continueLoading, setContinueLoading] = useState(false);
  const [continueMessage, setContinueMessage] = useState<string | null>(null);

  const [authIntent, setAuthIntent] = useState<AuthIntent>(null);
  const { isLoggedIn } = useCustomerSession();

  const vendorNamesRef = useRef(new Map<string, { name: string; initial: string }>());

  async function applyPayload(payload: RawCartPayload) {
    const mapped = mapCartPayload(payload, vendorNamesRef.current);
    setData(mapped);
    getRecommendedAddons(mapped.vendors)
      .then(setRecommendedAddons)
      .catch(() => setRecommendedAddons([]));
  }

  async function refreshCart() {
    setLoadError(null);
    try {
      const mapped = await getCartPageData();
      mapped.vendors.forEach((v) => {
        if (!vendorNamesRef.current.has(v.vendorId)) {
          vendorNamesRef.current.set(v.vendorId, { name: v.vendorName, initial: v.avatarInitial });
        }
      });
      setData(mapped);
      const addons = await getRecommendedAddons(mapped.vendors).catch(() => []);
      setRecommendedAddons(addons);
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

  const vendors = data?.vendors ?? [];
  const selectedVendors = useMemo(() => vendors.filter((v) => v.selected), [vendors]);

  const hasMissingEventDetails = selectedVendors.some(
    (vendor) =>
      !vendor.eventDetails.date ||
      !vendor.eventDetails.timeRange ||
      !vendor.eventDetails.guestCount ||
      !vendor.eventDetails.location
  );

  async function handleToggleSelected(itemId: string) {
    const item = vendors.find((v) => v.id === itemId);
    if (!item) return;
    try {
      const payload = await updateCartItem(itemId, { selectedForCheckout: !item.selected });
      await applyPayload(payload);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't update that item.");
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

  async function handleSaveEventDetails(itemId: string, details: EventDetailsData) {
    const payload: Parameters<typeof updateCartItem>[1] = {};
    if (details.date) payload.date = details.date;
    if (details.timeRange) payload.timeSlot = details.timeRange;
    if (details.guestCount != null) payload.guests = details.guestCount;
    if (details.location) payload.location = details.location;
    try {
      const result = await updateCartItem(itemId, payload);
      await applyPayload(result);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : "Couldn't save event details.");
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

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await applyCouponCode(couponCode);
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Breadcrumb items={data?.breadcrumb ?? [{ label: "Home", href: "/" }, { label: "Cart" }]} />
      </div>

      <h1 className="mb-10 font-figtree text-[32px] font-bold text-neutral-primary sm:text-[36px]">
        My Cart
      </h1>

      {loadError && (
        <div className="mb-6 rounded-2xl border border-error-700/20 bg-error-subtle px-5 py-4 font-figtree text-[13px] text-error-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[7fr_3fr]">
        <div className="flex flex-col gap-8">
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onToggleSelected={handleToggleSelected}
              onRemove={handleRemove}
              onMoveToWishlist={handleMoveToWishlist}
              onSaveEventDetails={handleSaveEventDetails}
              onIncrementAddon={handleIncrementAddon}
              onDecrementAddon={handleDecrementAddon}
              onRemoveAddon={handleRemoveAddon}
            />
          ))}

          {vendors.length === 0 && (
            <div className="rounded-3xl border border-neutral-subtle bg-white p-10 text-center">
              <p className="font-figtree text-[15px] text-neutral-secondary">
                Your cart is empty. Explore packages to add vendors.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
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
          />

          {hasMissingEventDetails && <WarningCard />}
        </div>
      </div>

      <AddonSection addons={recommendedAddons} onAdd={handleAddRecommendedAddon} />

      <AuthModal
        isOpen={authIntent !== null}
        onClose={() => setAuthIntent(null)}
        onAuthenticated={() => {
          const intent = authIntent;
          setAuthIntent(null);
          if (!intent) return;
          if (intent.type === "continue") void proceedToCheckout();
          else void moveToWishlistNow(intent.itemId);
        }}
      />
    </div>
  );
}
