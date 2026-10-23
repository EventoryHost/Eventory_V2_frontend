"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ContactUsModal from "./ContactUsModal";
import ContactSuccessModal from "./ContactSuccessModal";
import { browseVendors } from "@/lib/customerDiscoveryApi";

// Static fallback shown until the real count loads (or if the request
// fails) — there's no dedicated vendor-count endpoint, so this reads
// `.total` off an unfiltered, 1-result GET /customer/vendors call, which the
// backend already computes as the full matching-vendor count regardless of
// `limit`.
const FALLBACK_TOTAL_VENDORS = "4503";

export default function HeroSection() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [totalVendors, setTotalVendors] = useState(FALLBACK_TOTAL_VENDORS);

  useEffect(() => {
    let cancelled = false;
    browseVendors({ limit: 1 })
      .then((response) => {
        if (!cancelled) setTotalVendors(response.total.toLocaleString("en-IN"));
      })
      .catch(() => {
        // Keep the static fallback on failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    // w-full bg-white overrides the customer layout's bg-customer-bg
    // (#FAF9F6, a pale cream) that would otherwise show through this
    // section specifically, since it previously had no background of its
    // own. No bottom padding on the inner row — the next section (Why
    // Choose Eventory) starts flush against wherever the hero image ends,
    // with zero gap. Top alignment is lg:items-start (not centered/bottom)
    // specifically so the image's own top offset below can be set
    // precisely, independent of the text column's height.
    <section className="w-full bg-white">
      <div className="mx-auto flex max-w-[1760px] flex-col items-center gap-10 px-4 sm:pl-16 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="flex max-w-[520px] shrink-0 flex-col items-start gap-6 pt-14 text-center lg:pt-20 lg:text-left">
          <div className="flex flex-col items-start gap-3">
            {/* Gradient border via a two-layer trick: the outer layer IS the
                gradient "border" (1px padding reveals it), the inner layer
                holds the actual pink→white background at radius-1. Plain
                `border` + `border-image` ignores border-radius in most
                browsers, so it can't be used for a rounded gradient border. */}
            <div className="rounded-[49px] bg-[linear-gradient(90deg,_#FFE0E4_0%,_#FFFFFF_100%)] p-px">
              <div className="flex items-center gap-1 rounded-[48px] bg-[linear-gradient(90deg,_#FFF0F2_0%,_#FFFFFF_100%)] px-[9px] py-[7px]">
                <span className="font-figtree text-[14px] leading-[16px] font-semibold tracking-[-0.56px] text-[#030303]">
                  Total Number of Vendors on Eventory:
                </span>
                <span className="font-figtree text-[14px] leading-[16px] font-bold tracking-[-0.56px] text-[#EA1D3B]">
                  {totalVendors}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1">
              <h1 className="font-figtree text-[36px] leading-[1.05] font-medium tracking-[-1.8px] text-[#1E0306] sm:text-[44px] lg:text-[56px]">
                Where Inquiries turn into{" "}
                <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
                  memories
                </span>
                .
              </h1>

              <p className="font-figtree text-[16px] leading-[1.35] font-normal tracking-[-0.32px] text-[#636363]">
                Get verified leads, manage every inquiry in one place, and turn them into confirmed events.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/register"
              className="flex h-11 w-[140px] items-center justify-center rounded-[52px] bg-[#F0596F] font-figtree text-[15px] font-semibold text-white transition hover:bg-rose-600"
            >
              Register Now
            </Link>
            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="flex h-11 w-[123px] items-center justify-center rounded-[52px] bg-[#FDEEF0] font-figtree text-[15px] font-semibold text-[#F0596F] transition hover:bg-[#FBE0E5]"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Figma node 2438:21553 — the same 6-vendor cutout as the About Us
            hero, but rendered large and filling the row's remaining width
            (flex-1, no max-w cap) instead of boxed down small. The
            container is locked to the image's own aspect ratio (2752x1536,
            matching Figma's 1097x612 box almost exactly) so object-cover
            never needs to crop anything. lg:mt-[20px] = the navbar's own
            fixed height + gap, so the image's top edge sits just below the
            navbar on desktop — mobile/tablet stack it below the text
            instead, so this offset doesn't apply there. */}
        <div className="relative aspect-[2752/1536] w-full flex-1 lg:mt-[20px]">
          <Image
            src="/images/customer/about-us-hero-vendors.png"
            alt="Six Eventory vendors — a chef, an event planner, a DJ, a makeup artist, a florist, and a photographer — each holding tools of their trade"
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <ContactUsModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          onSubmitted={(name) => {
            setIsContactOpen(false);
            setSuccessName(name);
          }}
        />
        <ContactSuccessModal
          isOpen={successName !== null}
          onClose={() => setSuccessName(null)}
          name={successName ?? ""}
        />
      </div>
    </section>
  );
}
