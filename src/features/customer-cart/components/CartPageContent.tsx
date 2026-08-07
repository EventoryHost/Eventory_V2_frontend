"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/customer/Breadcrumb";
import type { AppliedCoupon, CartPageData, EventDetails as EventDetailsData } from "../types";
import { applyCouponCode } from "../services/applyCouponCode";
import { startCheckout } from "../services/startCheckout";
import VendorCard from "./VendorCard";
import AddonSection from "./AddonSection";
import PaymentSummary from "./PaymentSummary";
import WarningCard from "./WarningCard";

export default function CartPageContent({ data }: { data: CartPageData }) {
  const router = useRouter();
  const [vendors, setVendors] = useState(data.vendors);
  const [addons, setAddons] = useState(data.addons);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [continueLoading, setContinueLoading] = useState(false);
  const [continueMessage, setContinueMessage] = useState<string | null>(null);

  const selectedVendors = useMemo(
    () => vendors.filter((vendor) => vendor.selected),
    [vendors]
  );

  const vendorSubtotal = useMemo(
    () => selectedVendors.reduce((sum, vendor) => sum + vendor.package.price, 0),
    [selectedVendors]
  );

  const addonSubtotal = useMemo(
    () => addons.filter((addon) => addon.added).reduce((sum, addon) => sum + addon.price, 0),
    [addons]
  );

  const rawSubtotal = vendorSubtotal + addonSubtotal;

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountPercent) {
      return Math.round((rawSubtotal * appliedCoupon.discountPercent) / 100);
    }
    return appliedCoupon.discountFlat ?? 0;
  }, [appliedCoupon, rawSubtotal]);

  const subtotal = Math.max(0, rawSubtotal - discountAmount);

  const hasMissingEventDetails = selectedVendors.some(
    (vendor) =>
      !vendor.eventDetails.date ||
      !vendor.eventDetails.timeRange ||
      !vendor.eventDetails.guestCount ||
      !vendor.eventDetails.location
  );

  function handleToggleSelected(id: string) {
    setVendors((prev) =>
      prev.map((vendor) => (vendor.id === id ? { ...vendor, selected: !vendor.selected } : vendor))
    );
  }

  function handleRemove(id: string) {
    setVendors((prev) => prev.filter((vendor) => vendor.id !== id));
  }

  function handleMoveToWishlist(id: string) {
    setVendors((prev) => prev.filter((vendor) => vendor.id !== id));
  }

  function handleSaveEventDetails(id: string, details: EventDetailsData) {
    setVendors((prev) =>
      prev.map((vendor) => (vendor.id === id ? { ...vendor, eventDetails: details } : vendor))
    );
  }

  function handleToggleAddon(id: string) {
    setAddons((prev) =>
      prev.map((addon) => (addon.id === id ? { ...addon, added: !addon.added } : addon))
    );
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await applyCouponCode(couponCode);
      setAppliedCoupon(result);
      setCouponCode("");
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleContinue() {
    setContinueLoading(true);
    setContinueMessage(null);
    try {
      const result = await startCheckout({
        vendorIds: selectedVendors.map((vendor) => vendor.id),
        addonIds: addons.filter((addon) => addon.added).map((addon) => addon.id),
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Breadcrumb items={data.breadcrumb} />
      </div>

      <h1 className="mb-10 font-figtree text-[32px] font-bold text-neutral-primary sm:text-[36px]">
        My Cart
      </h1>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[7fr_3fr]">
        <div className="flex flex-col gap-8">
          {vendors.map((vendor, index) => (
            <Fragment key={vendor.id}>
              <VendorCard
                vendor={vendor}
                onToggleSelected={handleToggleSelected}
                onRemove={handleRemove}
                onMoveToWishlist={handleMoveToWishlist}
                onSaveEventDetails={handleSaveEventDetails}
              />
              {index === 0 && <AddonSection addons={addons} onToggle={handleToggleAddon} />}
            </Fragment>
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
            vendorCount={selectedVendors.length}
            subtotal={subtotal}
            couponCode={couponCode}
            onCouponCodeChange={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            couponLoading={couponLoading}
            couponError={couponError}
            appliedCoupon={appliedCoupon}
            onRemoveCoupon={() => setAppliedCoupon(null)}
            onContinue={handleContinue}
            continueLoading={continueLoading}
            continueDisabled={selectedVendors.length === 0}
            continueMessage={continueMessage}
          />

          {hasMissingEventDetails && <WarningCard />}
        </div>
      </div>
    </div>
  );
}
