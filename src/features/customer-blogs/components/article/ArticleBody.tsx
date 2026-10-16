"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, ArrowRight } from "lucide-react";

const KEY_DATES = [
  { number: 1, title: "Sunday, 8 November", text: "Diwali (Lakshmi Puja)." },
  { number: 2, title: "Saturday, 7 November", text: "Choti Diwali." },
  {
    number: 3,
    title: "Thursday 5 or Friday 6 November",
    text: "The most likely office celebration days.",
  },
  { number: 4, title: "By Friday, 23 October", text: "Decor vendor booked and design approved." },
  { number: 5, title: "By Wednesday, 28 October", text: "Building or facility approvals in hand." },
];

const ZONES = [
  {
    title: "Reception and entrance",
    text: "This is where the budget earns the most. A marigold-and-mango-leaf toran over the main door, a flower or ready-made rangoli at the entrance, and a cluster of LED diyas or brass urlis with floating flowers will set the tone for everyone, including visiting clients.",
  },
  {
    title: "Cafeteria or town-hall area",
    text: "If you are hosting the celebration, puja or lunch here, this zone needs a focal point: a floral or fabric backdrop behind the stage area, hanging lanterns and warm string lights. Keep walkways clear; this is where the most people gather at once.",
  },
  {
    title: "A photo corner",
    text: "A simple backdrop with a “Happy Diwali” sign, lanterns and a few props gives people a reason to take photos, which tend to end up on LinkedIn and internal channels. Place it near natural light or add a ring light.",
  },
  {
    title: "Workstations",
    text: "Desk decor works best as a team activity rather than something a vendor does. Give each team a small kit (torans, LED tea lights, rangoli stencils) and run a best-decorated-bay contest. It costs little and gets people involved.",
  },
  {
    title: "Puja corner",
    text: "If your office holds a Lakshmi-Ganesh puja, set aside a quiet corner with a low table, cloth, flowers and lamps. Keep participation optional; a mixed team appreciates being invited, not expected.",
  },
];

const RULES = [
  {
    label: "Open flames:",
    text: "Many managed buildings restrict real diyas and candles. Plan for LED diyas unless you have written permission.",
  },
  {
    label: "Setup hours:",
    text: "vendors may need to work before or after office hours, with a gate pass or visitor entry for each person.",
  },
  {
    label: "Fixing to walls and ceilings:",
    text: "tape, nails and hooks may not be allowed. Ask the vendor for free-standing frames instead.",
  },
  {
    label: "Floor protection:",
    text: "rangoli colours and flower petals can stain. Mats or ready-made rangoli avoid the problem.",
  },
  {
    label: "Removal:",
    text: "decide who removes the decor and when, especially if the floor is shared.",
  },
];

const TIMELINE = [
  {
    step: 1,
    title: "Week of 5 Oct",
    text: "Agree on budget, zones and celebration day. Ask facility management for their rules.",
  },
  {
    step: 2,
    title: "Week of 12 Oct",
    text: "Shortlist two or three decor packages and compare inclusions line by line.",
  },
  {
    step: 3,
    title: "Week of 19 Oct",
    text: "Book the vendor, approve the design and share building rules with them.",
  },
  {
    step: 4,
    title: "Week of 26 Oct",
    text: "Get approvals and gate passes; send desk kits to team leads.",
  },
  {
    step: 5,
    title: "5 or 6 Nov",
    text: "Setup early morning or the previous evening; removal agreed for after the event.",
  },
];

const BUDGET_CHECKS = ["GST invoice", "Advance / completion split", "Setup and removal"];

const FAQS = [
  {
    question: "When should an office book Diwali decoration?",
    answer:
      "Aim to book by 23 October 2026. Diwali week is the busiest period for decorators, and approvals from building management can take several days.",
  },
  {
    question: "Can we use real diyas in the office?",
    answer:
      "Only if your building allows open flames. Many commercial buildings do not, so LED diyas are the safer default.",
  },
  {
    question: "What is the best area to decorate if the budget is small?",
    answer:
      "The reception or entrance. Everyone passes through it, including visitors, so it gives the most visible return.",
  },
  {
    question: "How long does an office Diwali setup take?",
    answer: "It depends on size. Ask each vendor for setup time and whether they can work after office hours.",
  },
  {
    question: "Who removes the decoration?",
    answer: "It varies by vendor. Confirm removal and timing before you book.",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-figtree text-[28px] leading-[1.1] font-semibold tracking-[-0.5px] text-[#1E0306] sm:text-[36px]">
      {children}
    </p>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex w-full flex-col gap-3 rounded-[20px] bg-[#FAFAFA] p-5">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="font-figtree text-[16px] font-semibold text-[#030303]">{question}</span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-[#3F3F47] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">{answer}</p>}
    </div>
  );
}

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-28152 (Article column only — share rail is ArticleShareRail.tsx)
export default function ArticleBody() {
  return (
    <article className="flex w-full max-w-[844px] flex-col items-start gap-12">
      {/* Intro */}
      <div className="flex flex-col items-start gap-5">
        <p className="font-figtree text-[22px] leading-[32px] font-normal text-[#1E0306] sm:text-[24px]">
          Diwali falls on Sunday, 8 November 2026, which means most offices will celebrate on Thursday 5 or Friday 6
          November. That leaves less time than it looks. Between approvals from building management, finalising a
          budget and booking a decorator during the busiest week of the year, the decor needs to be locked by the
          third week of October.
        </p>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          This guide gives you decoration ideas for every part of the office, then the practical side: what building
          managers usually ask for, what to check with a vendor, and a week-by-week timeline.
        </p>
      </div>

      {/* Key dates */}
      <section id="key-dates" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Diwali 2026 key dates for office planning</SectionHeading>
        <div className="flex w-full flex-col items-start rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1] px-6">
          {KEY_DATES.map((date, index) => (
            <div key={date.number} className="flex w-full flex-col">
              {index > 0 && <div className="h-px w-full bg-[#FFEBCC]" />}
              <div className="flex w-full flex-col items-start gap-2 py-4.5 sm:flex-row sm:items-center sm:gap-4.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFF0DB]">
                  <span className="font-figtree text-[16px] font-semibold text-[#3C060D]">{date.number}</span>
                </div>
                <p className="w-full shrink-0 font-figtree text-[18px] font-semibold tracking-[-0.18px] text-[#1E0306] sm:w-[290px]">
                  {date.title}
                </p>
                <p className="flex-1 font-figtree text-[16px] font-medium text-[#3F3F47]">{date.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ideas by zone */}
      <section id="ideas-by-zone" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Office Diwali decoration ideas, zone by zone</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          Think of the office as four or five zones, each with a different job. Reception creates the first
          impression, the cafeteria hosts the celebration, and desks give teams something to participate in.
        </p>
        <div className="flex w-full flex-col items-start gap-8">
          {ZONES.map((zone) => (
            <div key={zone.title} className="flex w-full flex-col items-start gap-2.5">
              <p className="font-figtree text-[22px] leading-[32px] font-medium text-[#1E0306] sm:text-[24px]">
                {zone.title}
              </p>
              <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">{zone.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <div className="flex w-full items-start gap-7 rounded-[20px] border-l-4 border-[#F0596F] bg-[#FFF2F4] py-6 pr-8 pl-7">
        <div className="flex flex-1 flex-col items-start gap-4">
          <p className="font-figtree text-[22px] leading-[32px] font-medium text-[#3C060D] italic sm:text-[24px]">
            Spend most of your decor budget where everyone walks in and where everyone gathers. Desks are where
            people participate, not where vendors decorate.
          </p>
          <p className="font-figtree text-[16px] font-medium text-[#F0596F]">&mdash; Eventory</p>
        </div>
      </div>

      {/* Inline image */}
      <figure className="flex w-full flex-col items-start gap-3.5">
        <div className="relative h-[260px] w-full overflow-hidden rounded-[20px] sm:h-[480px]">
          <Image
            src="/images/customer/blogs/article-diwali-office/inline-image.png"
            alt="Warm string lights and a festive gathering in a shared office space"
            fill
            className="object-cover"
          />
        </div>
        <figcaption className="font-figtree text-[14px] font-medium text-[#9F9FA9]">
          Spend where people walk in and where they gather: the entrance and the main celebration space.
        </figcaption>
      </figure>

      {/* Rules to check */}
      <section id="rules-to-check" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Office rules to check before you book anything</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          Commercial buildings in Gurgaon&rsquo;s Cyber City and Udyog Vihar, or Noida&rsquo;s IT parks, often have
          rules a home celebration never runs into. Ask your facility or building management team about these first:
        </p>
        <div className="flex w-full flex-col items-start gap-3.5 pl-2">
          {RULES.map((rule) => (
            <div key={rule.label} className="flex w-full items-start gap-4">
              <Image
                src="/images/customer/blogs/article-diwali-office/bullet.svg"
                alt=""
                width={8}
                height={19}
                className="mt-0.5 shrink-0"
              />
              <p className="flex-1 font-figtree text-[16px] font-medium text-[#3F3F47]">
                <span className="font-figtree text-[18px] font-semibold text-[#1E0306]">{rule.label}</span>{" "}
                {rule.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>A 4-week planning timeline</SectionHeading>
        <div className="flex w-full flex-col items-start rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1] px-8 pt-8 pb-2">
          {TIMELINE.map((item, index) => (
            <div key={item.step} className="flex w-full items-start gap-5">
              <div className="flex shrink-0 flex-col items-center self-stretch">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                    index === TIMELINE.length - 1 ? "bg-[#FCDEE2]" : "bg-[#F0596F]"
                  }`}
                >
                  <span className="font-figtree text-[15px] font-bold text-white">{item.step}</span>
                </div>
                {index < TIMELINE.length - 1 && <div className="w-0.5 flex-1 bg-[#FFD3DA]" />}
              </div>
              <div
                className={`flex flex-1 flex-col items-start gap-1 pt-1.5 ${
                  index === TIMELINE.length - 1 ? "pb-6" : "pb-7"
                }`}
              >
                <p className="font-figtree text-[18px] font-semibold tracking-[-0.18px] text-[#1E0306]">
                  {item.title}
                </p>
                <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Budget */}
      <section id="budget" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>How to plan the budget</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          Budget by zone, not as one number. Reception and the main gathering area should take most of the spend;
          desk kits and the photo corner take the rest. When you compare quotes, ask each vendor to list materials,
          sizes and quantities, so you are comparing the same setup rather than the same price.
        </p>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          Before you approve, confirm whether the vendor can issue a GST invoice, how payment is split between
          advance and completion, and whether setup and removal are included.
        </p>
        <div className="flex flex-wrap items-start gap-3">
          {BUDGET_CHECKS.map((check) => (
            <div
              key={check}
              className="flex items-center gap-2 rounded-full bg-[#FDEEF0] py-2.5 pr-[18px] pl-3.5"
            >
              <Check size={16} className="shrink-0 text-[#B4112A]" />
              <span className="font-figtree text-[14px] font-semibold text-[#B4112A]">{check}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Book on Eventory */}
      <section
        id="book-on-eventory"
        className="relative flex w-full scroll-mt-24 flex-col items-start gap-5 overflow-hidden rounded-[28px] bg-[#F0596F] px-6 py-9 sm:px-12 sm:py-11"
      >
        <Image
          aria-hidden
          src="/images/customer/blogs/article-diwali-office/decor-circle-1.svg"
          alt=""
          width={260}
          height={260}
          className="pointer-events-none absolute -top-[90px] -right-10 hidden sm:right-[200px] sm:block"
        />
        <Image
          aria-hidden
          src="/images/customer/blogs/article-diwali-office/decor-circle-2.svg"
          alt=""
          width={140}
          height={140}
          className="pointer-events-none absolute top-[160px] right-0 hidden sm:right-[120px] sm:block"
        />
        <p className="relative font-figtree text-[24px] leading-[1.12] font-semibold tracking-[-0.4px] text-white sm:text-[32px]">
          Booking office Diwali decor through Eventory
        </p>
        <p className="relative font-figtree text-[16px] leading-[24px] font-medium text-white">
          If you would rather not chase five vendors for quotes, Eventory lets you browse decor packages from
          verified vendors, compare what each one includes and book online.
        </p>
        <Link
          href="/packages/browse"
          className="relative flex items-center gap-2.5 rounded-full bg-white px-8 py-4 font-figtree text-[16px] font-semibold text-[#F0596F]"
        >
          Browse Packages
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section id="faqs" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>FAQs</SectionHeading>
        <div className="flex w-full flex-col items-start gap-4">
          {FAQS.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Author box */}
      <div className="flex w-full flex-col items-start gap-6 rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1] p-6 sm:flex-row">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full">
          <Image
            src="/images/customer/blogs/article-diwali-office/author-prathmesh.png"
            alt="Prathmesh"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col items-start gap-2">
          <p className="font-figtree text-[20px] font-semibold text-[#1E0306]">Prathmesh, Founder of Eventory</p>
          <p className="font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
            Building a better way for people to discover, compare and book event services online. His vision is to
            building a commerce-first marketplace that helps customers discover, compare and book event services
            while enabling vendors to showcase and manage their offerings online.
          </p>
          <div className="flex items-start gap-2.5">
            <a
              href="#"
              aria-label="LinkedIn"
              className="flex size-9 items-center justify-center rounded-full border border-[#E4E4E7] bg-white"
            >
              <Image src="/images/customer/linkedin.svg" alt="" width={16} height={16} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="flex size-9 items-center justify-center rounded-full border border-[#E4E4E7] bg-white"
            >
              <Image
                src="/images/customer/blogs/article-diwali-office/icon-twitter.svg"
                alt=""
                width={16}
                height={16}
              />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
