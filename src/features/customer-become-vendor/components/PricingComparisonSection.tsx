"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

type FeatureRow = {
  label: string;
  eventory: string;
  eventoryHighlighted: boolean;
  traditional: string;
};

const FEATURES: FeatureRow[] = [
  { label: "Monthly Cost", eventory: "₹0", eventoryHighlighted: false, traditional: "₹5,000-₹15,000" },
  { label: "Customer Acquisition", eventory: "Included", eventoryHighlighted: true, traditional: "Expensive Ads" },
  { label: "Payment Processing", eventory: "Guaranteed", eventoryHighlighted: true, traditional: "Risk of Payments" },
  { label: "Booking Management", eventory: "Automated Platform", eventoryHighlighted: true, traditional: "Manual Tracking" },
  { label: "Customer Support", eventory: "24/7 Included", eventoryHighlighted: true, traditional: "Self Managed" },
  { label: "Commission Charges", eventory: "After booking only", eventoryHighlighted: true, traditional: "Mandatory" },
  { label: "Listing Fees", eventory: "₹0", eventoryHighlighted: false, traditional: "Mandatory" },
];

const TRADITIONAL_COMMISSION = 0.3;
const EVENTORY_MIN_COMMISSION = 0.01;
const EVENTORY_MAX_COMMISSION = 0.05;
const SLIDER_MIN = 10000;
const SLIDER_MAX = 500000;
const SLIDER_STEP = 5000;

function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export default function PricingComparisonSection() {
  const [bookingAmount, setBookingAmount] = useState(80000);

  const traditionalCost = bookingAmount * TRADITIONAL_COMMISSION;
  const eventoryMin = bookingAmount * EVENTORY_MIN_COMMISSION;
  const eventoryMax = bookingAmount * EVENTORY_MAX_COMMISSION;
  const savings = traditionalCost - eventoryMax;
  const sliderPercent = ((bookingAmount - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  return (
    <section className="w-full bg-white px-4 py-16 sm:px-6 lg:px-16">
      <div className="mx-auto max-w-[1312px]">
        <p className="font-figtree text-[13px] leading-[18px] font-semibold tracking-[0.05em] text-[#EA1D3B] uppercase">
          Simple, transparent pricing
        </p>
        <h2 className="mt-2 font-figtree text-[36px] leading-[44px] font-bold tracking-[-0.72px] text-[#030303]">
          Pay only when booked, no fees
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Comparison table */}
          <div className="grid grid-cols-3 overflow-hidden rounded-[20px] border border-[#E4E4E7]">
            <div className="border-r border-[#E4E4E7]">
              <div className="flex h-[60px] items-center bg-[#FAFAFA] px-5">
                <span className="font-figtree text-[14px] leading-[20px] font-semibold text-[#71717B]">FEATURES</span>
              </div>
            </div>
            <div className="border-r border-[#FCDEE2] bg-[#FDEEF0]">
              <div className="flex h-[60px] items-center justify-center px-5">
                <span className="font-figtree text-[14px] leading-[20px] font-bold text-brand-primary">EVENTORY</span>
              </div>
            </div>
            <div>
              <div className="flex h-[60px] items-center bg-[#FAFAFA] px-5">
                <span className="font-figtree text-[14px] leading-[20px] font-semibold text-[#71717B]">
                  TRADITIONAL PLATFORMS
                </span>
              </div>
            </div>

            {FEATURES.map((row) => (
              <div key={row.label} className="contents">
                <div className="flex items-center border-t border-r border-[#E4E4E7] px-5 py-4">
                  <span className="font-figtree text-[16px] leading-[24px] font-medium text-[#3F3F47]">
                    {row.label}
                  </span>
                </div>
                <div className="flex items-center justify-center border-t border-r border-[#FCDEE2] px-5 py-4">
                  {row.eventoryHighlighted ? (
                    <span className="flex h-8 items-center gap-1.5 rounded-full border border-[#F9BDC5] bg-[#FFFAFA] px-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-primary" />
                      <span className="font-figtree text-[14px] leading-[20px] font-medium whitespace-nowrap text-[#030303]">
                        {row.eventory}
                      </span>
                    </span>
                  ) : (
                    <span className="flex h-8 items-center rounded-full border border-[#F9BDC5] bg-[#FFFAFA] px-2.5">
                      <span className="font-figtree text-[14px] leading-[20px] font-medium text-[#030303]">
                        {row.eventory}
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex items-center border-t border-[#E4E4E7] px-5 py-4">
                  <span className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
                    {row.traditional}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Promo badge + calculator */}
          <div className="flex flex-col gap-4">
            <div className="relative overflow-visible rounded-[20px] bg-[#FDECEF] p-5">
              <p className="font-figtree">
                <span className="text-[40px] leading-[48px] font-normal text-[#030303] line-through">30%</span>{" "}
                <span className="text-[40px] leading-[48px] font-normal text-brand-primary sm:text-[48px] sm:leading-[56px]">
                  Only 1-5%
                </span>
              </p>
              <p className="mt-1 font-figtree text-[16px] leading-[24px] font-medium text-[#262626]">
                Afterwards Commission per booking
              </p>

              <div className="absolute top-[-28px] right-[8px] flex h-[88px] w-[88px] -rotate-6 items-center justify-center">
                <img
                  src="/images/customer/become/pricing-star-badge.svg"
                  alt=""
                  className="absolute inset-0 h-full w-full"
                />
                <span className="relative flex flex-col items-center font-figtree leading-none font-bold text-white">
                  <span className="text-[26px]">5</span>
                  <span className="mt-0.5 text-center text-[10px] leading-[12px]">
                    Free
                    <br />
                    Bookings
                  </span>
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white">
              <div className="flex flex-col gap-6 border-b border-[#E4E4E7] bg-[#FAFAFA] px-4 py-5">
                <div className="flex flex-col gap-3">
                  <span className="font-figtree text-[14px] leading-[20px] font-semibold text-[#030303]">
                    Booking Amount
                  </span>
                  <div className="flex h-10 items-center rounded-full border border-[#E4E4E7] bg-white px-4">
                    <span className="font-figtree text-[16px] leading-[24px] font-semibold text-[#030303]">
                      {formatINR(bookingAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative flex h-5 items-center">
                    <div className="h-2 w-full rounded-full bg-[#D4D4D8]">
                      <div
                        className="h-2 rounded-full bg-brand-primary"
                        style={{ width: `${sliderPercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={SLIDER_MIN}
                      max={SLIDER_MAX}
                      step={SLIDER_STEP}
                      value={bookingAmount}
                      onChange={(e) => setBookingAmount(Number(e.target.value))}
                      aria-label="Booking amount"
                      className="absolute inset-0 h-5 w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[1.875px] [&::-moz-range-thumb]:border-brand-primary [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[1.875px] [&::-webkit-slider-thumb]:border-brand-primary [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
                    />
                  </div>
                  <p className="font-figtree text-[12px] leading-[18px] font-medium text-[#71717B]">
                    Use the slider to select booking value
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-figtree text-[14px] leading-[20px] font-semibold text-[#030303]">
                    Traditional Platforms
                  </p>
                  <p className="font-figtree text-[11px] leading-[16px] font-medium text-[#71717B]">
                    Up to 30% commission on booking value
                  </p>
                </div>
                <span className="font-figtree text-[14px] leading-[20px] font-semibold whitespace-nowrap text-[#030303]">
                  upto {formatINR(traditionalCost)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-y border-dashed border-[#F9BDC5] bg-[#FFF5F6] px-4 py-5">
                <div>
                  <p className="font-figtree text-[14px] leading-[20px] font-semibold text-brand-primary">
                    Eventory Platform
                  </p>
                  <p className="font-figtree text-[11px] leading-[16px] font-medium text-[#71717B]">
                    1-5% of booking value, <span className="text-[#030303]">after booking only</span>
                  </p>
                </div>
                <span className="font-figtree text-[14px] leading-[20px] font-semibold whitespace-nowrap text-[#EA1D3B]">
                  Just {formatINR(eventoryMin)}-{formatINR(eventoryMax)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-4">
                <span className="font-figtree text-[16px] leading-[24px] font-bold text-[#030303]">You Save</span>
                <span className="font-figtree text-[16px] leading-[24px] font-bold whitespace-nowrap text-[#00A63E]">
                  Just {formatINR(savings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
