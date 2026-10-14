"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

// Only the first question/answer pair was in the Figma handoff — the other
// five answers below are placeholder copy drafted to stay consistent with
// what's already established elsewhere on this page (PricingComparisonSection's
// ₹0 monthly cost / 1-5% commission, the real vendor categories in
// CATEGORY_META), NOT official copy. Review/replace before shipping.
const FAQS = [
  {
    question: "How do I register as a vendor on Eventory?",
    answer:
      "Simply click 'Sign Up as Vendor' and fill out our quick registration form. It takes less than 5 minutes. Once submitted, our team will review your application and you'll be live within 24 hours.",
  },
  {
    question: "What types of vendors can join Eventory?",
    answer:
      "Decorators, caterers, photographers, DJ artists, venue providers, and makeup artists — any event service business can apply.",
  },
  {
    question: "How much does it cost to join?",
    answer:
      "Joining and listing on Eventory is free — ₹0 monthly cost. We only take a small 1-5% commission, and only after you actually get a booking.",
  },
  {
    question: "How do payments work?",
    answer:
      "Customers pay through Eventory's secure checkout, and payouts are released to you on a milestone schedule tied to the booking's event date — no chasing clients for payment.",
  },
  {
    question: "Can I set my own prices?",
    answer: "Yes — you set your own package pricing, variants, and add-ons. Eventory never dictates what you charge.",
  },
  {
    question: "How do I get more bookings?",
    answer:
      "Complete your profile, add high-quality portfolio photos, respond quickly to inquiries, and keep your availability calendar up to date.",
  },
];

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2438-21995
// Two-column layout — header pinned on the left, accordion list on the
// right — replacing the previous full-width-header-on-top version. Open
// item gets a subtle grey card (#FAFAFA) with an X; closed items are plain
// rows with a "+".
export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="w-full bg-white px-4 py-12 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-10 lg:flex-row lg:items-start lg:gap-11">
        <div className="flex flex-col gap-2 lg:sticky lg:top-24 lg:max-w-[460px] lg:shrink-0">
          <p className="font-figtree text-[16px] leading-[24px] font-semibold text-[#EA1D3B] uppercase [text-shadow:0_0_4px_rgba(0,0,0,0.1)]">
            FAQs
          </p>
          <h2 className="font-figtree text-[28px] leading-[1.1] font-bold tracking-[-0.5px] text-[#030303] sm:text-[36px]">
            Everything vendors need to know
          </h2>
          <p className="mt-1 font-figtree text-[16px] leading-[24px] font-medium text-[#71717B]">
            From booking and payments to event-day support, find quick answers to the questions we hear most often.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {FAQS.map((faq, i) => {
            const isOpen = i === openIndex;
            return (
              <div
                key={faq.question}
                className={`rounded-[20px] px-5 py-3 transition ${isOpen ? "bg-[#FAFAFA]" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`font-figtree text-[16px] leading-[24px] ${
                      isOpen ? "font-semibold text-[#030303]" : "font-medium text-[#3F3F47]"
                    }`}
                  >
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <X className="h-5 w-5 shrink-0 text-[#030303]" />
                  ) : (
                    <Plus className="h-5 w-5 shrink-0 text-[#9F9FA9]" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-3 font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
