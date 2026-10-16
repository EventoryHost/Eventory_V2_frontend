"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

const COMPARISON_ROWS = [
  { label: "When", shower: "Before the birth", welcome: "The day the baby comes home" },
  {
    label: "Usually planned by",
    shower: "Sister, mother, in-laws or friends",
    welcome: "Grandparents or siblings, while the parents are at the hospital",
  },
  { label: "Where", shower: "Home, society hall or banquet", welcome: "Home" },
  {
    label: "Decor focus",
    shower: "A backdrop, a seat for the mother-to-be, a gift table",
    welcome: "The entrance, the living room and sometimes the baby's room",
  },
  {
    label: "Main constraint",
    shower: "The mother-to-be's comfort",
    welcome: "An uncertain date and a newborn in the house",
  },
];

const SHOWER_IDEAS = [
  {
    title: "Pastel balloon backdrop",
    text: "A balloon garland in pastels around an “Oh Baby” sign, with a cake or gift table in front. The most popular choice because it photographs softly and suits any space.",
  },
  {
    title: "Floral godh bharai setup",
    text: "Fresh or artificial flowers, a decorated chair or jhoola for the mother-to-be, and space in front for the ceremony. It suits families who want the ritual at the centre of the day.",
  },
  {
    title: "Moon and stars",
    text: "Navy, gold and white with moon and star cutouts and warm lights. A gentle, gender-neutral theme for evening functions.",
  },
  {
    title: "Boho neutral",
    text: "Beige, sage and white with pampas grass and wooden accents. Understated and modern, and it looks good in smaller apartments.",
  },
];

const WELCOME_IDEAS = [
  {
    title: "Entrance door decor",
    text: "A balloon or flower arch around the front door with a “Welcome Home” sign or the baby's name. It is the first thing the family sees, and it is the most photographed spot.",
  },
  {
    title: "Living room welcome",
    text: "A balloon arch, foil letters and a small backdrop where visiting family can take photos with the baby, kept away from where the baby will sleep.",
  },
  {
    title: "Name or footprint board",
    text: "A board with the baby's name, birth date and weight. It stays useful long after the balloons come down.",
  },
];

const NEWBORN_RULES = [
  "Keep balloons out of the baby's room, or well out of reach",
  "Skip glitter, loose confetti and small pieces that can end up on floors and bedding",
  "Avoid strong-scented flowers and sprays near where the baby sleeps",
  "Use LED lights rather than real candles",
  "Agree on when and how the decor will be removed, so it doesn't disturb the baby later",
];

const TIMELINE = [
  {
    step: 1,
    title: "Baby shower",
    text: "Book 2–3 weeks ahead, confirm the hall if you need one, and share the ceremony timing with the decorator.",
  },
  { step: 2, title: "Welcome baby", text: "The date depends on the discharge, so plan for flexibility." },
  {
    step: 3,
    title: "A few weeks before the due date",
    text: "Shortlist a welcome-baby package and ask about date changes and short-notice slots.",
  },
  {
    step: 4,
    title: "When the discharge date is known",
    text: "Confirm the slot and who at home will let the decorator in.",
  },
  {
    step: 5,
    title: "On the day",
    text: "Finish the setup at least an hour before the family is expected, and check every inclusion.",
  },
];

const FAQS = [
  {
    question: "Can a baby shower be a gender reveal in India?",
    answer:
      "No. Sex determination before birth is prohibited by law in India, so baby shower decor uses neutral themes.",
  },
  {
    question: "When is a godh bharai usually held?",
    answer: "Commonly in the seventh or eighth month of pregnancy, though families follow their own customs.",
  },
  {
    question: "Can welcome baby decoration be done on short notice?",
    answer: "Often yes, depending on the vendor. Ask about short-notice slots when you shortlist.",
  },
  {
    question: "What should welcome baby decoration include?",
    answer:
      "Usually an entrance arch or door decor, a welcome sign or name board, and some living-room decor. Keep the baby's room simple.",
  },
  {
    question: "Is it safe to have balloons around a newborn?",
    answer:
      "Keep balloons out of the baby's reach and out of the room where the baby sleeps, and clear burst pieces straight away.",
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

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-29872 (Article column only — share rail is ArticleShareRail.tsx)
export default function BabyShowerWelcomeBody() {
  return (
    <article className="flex w-full max-w-[844px] flex-col items-start gap-12">
      {/* Intro */}
      <div className="flex flex-col items-start gap-5">
        <p className="font-figtree text-[22px] leading-[32px] font-normal text-[#1E0306] sm:text-[24px]">
          A baby shower and a welcome-baby homecoming are a few months apart, but they are very different
          decorating jobs. One is a celebration built around the mother-to-be and the family; the other is a
          quiet, warm welcome for a newborn who has just come home.
        </p>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          This guide covers decor ideas for both, the details that keep the mother-to-be comfortable, and how to
          time a welcome-baby setup around the hospital discharge.
        </p>
      </div>

      {/* Shower vs welcome baby */}
      <section id="shower-vs-welcome-baby" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Baby shower vs welcome baby: what&rsquo;s different</SectionHeading>
        <div className="flex w-full flex-col items-start overflow-x-auto rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1]">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left" />
                <th className="px-3 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
                  BABY SHOWER OR GODH BHARAI
                </th>
                <th className="px-6 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
                  WELCOME BABY
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="border-t border-[#FFEBCC]">
                  <td className="px-6 py-4 align-top font-figtree text-[16px] font-semibold whitespace-nowrap text-[#1E0306]">
                    {row.label}
                  </td>
                  <td className="px-3 py-4 align-top font-figtree text-[16px] font-medium text-[#3F3F47]">
                    {row.shower}
                  </td>
                  <td className="px-6 py-4 align-top font-figtree text-[16px] font-medium text-[#3F3F47]">
                    {row.welcome}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Baby shower ideas */}
      <section id="baby-shower-ideas" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Baby shower decoration ideas</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          In India, sex determination before birth is prohibited by law, so baby showers are not gender reveals.
          Keep the colours and signs neutral: &ldquo;Oh Baby&rdquo;, &ldquo;Baby on the Way&rdquo; or the
          family&rsquo;s name work well.
        </p>
        <div className="flex w-full flex-col items-start gap-8">
          {SHOWER_IDEAS.map((idea) => (
            <div key={idea.title} className="flex w-full flex-col items-start gap-2">
              <p className="font-figtree text-[22px] leading-[32px] font-medium text-[#1E0306] sm:text-[24px]">
                {idea.title}
              </p>
              <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">{idea.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mother-to-be comfort */}
      <section id="mother-to-be-comfort" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Keep the mother-to-be comfortable</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          The decor is for her, so plan around her. Give her a seat with back support rather than a decorative
          stool, place it near a washroom and away from heat or direct sun, and keep the ceremony short enough
          that she is not sitting or standing for too long. Ask her beforehand about strong fragrances, since
          heavily scented flowers can bother some people during pregnancy.
        </p>
      </section>

      {/* Pull quote */}
      <div className="flex w-full items-start gap-7 rounded-[20px] border-l-4 border-[#F0596F] bg-[#FFF2F4] py-6 pr-8 pl-7">
        <div className="flex flex-1 flex-col items-start gap-4">
          <p className="font-figtree text-[22px] leading-[32px] font-medium text-[#3C060D] italic sm:text-[24px]">
            Plan the baby shower around the mother-to-be&rsquo;s comfort, and the welcome-baby setup around the
            newborn&rsquo;s safety. The photos follow.
          </p>
          <p className="font-figtree text-[16px] font-medium text-[#F0596F]">&mdash; Eventory</p>
        </div>
      </div>

      {/* Before and after the birth */}
      <figure className="flex w-full flex-col items-start gap-3.5">
        <div className="flex w-full flex-col items-start gap-7 rounded-[28px] border border-[#FFEBCC] bg-gradient-to-b from-[#FFFAF1] to-[#FFEEF0] p-6 sm:p-10">
          <div className="flex flex-col items-start gap-2.5">
            <p className="font-figtree text-[26px] leading-[1.12] font-semibold tracking-[-0.4px] text-[#1E0306] sm:text-[32px]">
              Before and{" "}
              <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
                after
              </span>{" "}
              the birth
            </p>
            <p className="font-figtree text-[16px] font-medium text-[#3F3F47]">Two very different decorating jobs</p>
          </div>

          <div className="h-px w-full bg-[#FFEBCC]" />

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-start gap-2.5 rounded-2xl border border-[#FFEBCC] bg-white p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0DB]">
                <span className="font-figtree text-[14px] font-semibold text-[#3C060D]">1</span>
              </div>
              <p className="font-figtree text-[16px] leading-[22px] font-semibold text-[#1E0306]">Baby shower</p>
              <div className="flex flex-col items-start gap-0.5">
                <p className="font-figtree text-[11px] font-bold tracking-[0.66px] text-[#790B1A] uppercase">
                  When
                </p>
                <p className="font-figtree text-[14px] font-medium text-[#3F3F47]">Before the birth</p>
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <p className="font-figtree text-[11px] font-bold tracking-[0.66px] text-[#790B1A] uppercase">
                  Backdrop
                </p>
                <p className="font-figtree text-[14px] font-medium text-[#3F3F47]">
                  Pastel balloons around an &ldquo;Oh Baby&rdquo; sign
                </p>
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <p className="font-figtree text-[11px] font-bold tracking-[0.66px] text-[#790B1A] uppercase">
                  Seat
                </p>
                <p className="font-figtree text-[14px] font-medium text-[#3F3F47]">
                  A supported chair for the mother-to-be
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2.5 rounded-2xl border border-[#FFEBCC] bg-white p-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0DB]">
                <span className="font-figtree text-[14px] font-semibold text-[#3C060D]">2</span>
              </div>
              <p className="font-figtree text-[16px] leading-[22px] font-semibold text-[#1E0306]">Welcome baby</p>
              <div className="flex flex-col items-start gap-0.5">
                <p className="font-figtree text-[11px] font-bold tracking-[0.66px] text-[#790B1A] uppercase">
                  When
                </p>
                <p className="font-figtree text-[14px] font-medium text-[#3F3F47]">
                  The day the baby comes home
                </p>
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <p className="font-figtree text-[11px] font-bold tracking-[0.66px] text-[#790B1A] uppercase">
                  Door
                </p>
                <p className="font-figtree text-[14px] font-medium text-[#3F3F47]">
                  Balloon or flower arch with a &ldquo;Welcome Home&rdquo; sign
                </p>
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <p className="font-figtree text-[11px] font-bold tracking-[0.66px] text-[#790B1A] uppercase">
                  Inside
                </p>
                <p className="font-figtree text-[14px] font-medium text-[#3F3F47]">
                  A name board, away from where the baby sleeps
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start justify-center gap-2 rounded-2xl bg-[#F0596F] p-4 text-white">
              <p
                className="font-figtree text-[20px] leading-[1.15] font-medium italic"
                style={{ fontFamily: "var(--font-lora)" }}
              >
                Comfort, then safety
              </p>
              <p className="font-figtree text-[14px] font-medium">
                The mother-to-be&rsquo;s at the shower, the newborn&rsquo;s once they are home.
              </p>
            </div>
          </div>
        </div>
        <figcaption className="font-figtree text-[14px] font-medium text-[#9F9FA9]">
          A celebration before, a quiet welcome after.
        </figcaption>
      </figure>

      {/* Inline image */}
      <div className="relative h-[260px] w-full overflow-hidden rounded-[20px] sm:h-[480px]">
        <Image
          src="/images/customer/blogs/article-baby-shower-welcome/inline-image.png"
          alt="A fully styled decoration setup with backdrop, lights and props"
          fill
          className="object-cover"
        />
      </div>

      {/* Welcome baby ideas */}
      <section id="welcome-baby-ideas" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Welcome baby decoration ideas</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          After the birth, &ldquo;It&rsquo;s a Girl&rdquo; or &ldquo;It&rsquo;s a Boy&rdquo; signs, name boards
          and the baby&rsquo;s colours all come into play.
        </p>
        <div className="flex w-full flex-col items-start gap-8">
          {WELCOME_IDEAS.map((idea) => (
            <div key={idea.title} className="flex w-full flex-col items-start gap-2">
              <p className="font-figtree text-[22px] leading-[32px] font-medium text-[#1E0306] sm:text-[24px]">
                {idea.title}
              </p>
              <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">{idea.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newborn-safe decor */}
      <section id="newborn-safe-decor" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Newborn-safe decor</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          A newborn changes what is sensible to put up. Ask the decorator to:
        </p>
        <div className="flex w-full flex-col items-start gap-3.5 pl-2">
          {NEWBORN_RULES.map((rule) => (
            <div key={rule} className="flex w-full items-start gap-4">
              <Image
                src="/images/customer/blogs/article-baby-shower-welcome/bullet.svg"
                alt=""
                width={8}
                height={19}
                className="mt-0.5 shrink-0"
              />
              <p className="flex-1 font-figtree text-[16px] font-normal text-[#3F3F47]">{rule}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timing it right */}
      <section id="timing-it-right" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Timing it right</SectionHeading>
        <div className="flex w-full flex-col items-start rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1] px-6">
          {TIMELINE.map((item, index) => (
            <div key={item.step} className="flex w-full flex-col">
              {index > 0 && <div className="h-px w-full bg-[#FFEBCC]" />}
              <div className="flex w-full flex-col gap-2 py-4.5 sm:flex-row sm:items-center sm:gap-5">
                <div className="flex shrink-0 items-center gap-3 sm:w-[220px]">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0DB]">
                    <span className="font-figtree text-[14px] font-semibold text-[#3C060D]">{item.step}</span>
                  </div>
                  <p className="font-figtree text-[16px] font-semibold text-[#1E0306]">{item.title}</p>
                </div>
                <p className="flex-1 font-figtree text-[16px] font-medium text-[#3F3F47]">{item.text}</p>
              </div>
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
          Book baby shower and welcome baby decor on Eventory
        </p>
        <p className="relative font-figtree text-[16px] leading-[24px] font-medium text-white">
          On Eventory, you can browse baby shower and welcome-baby decor packages from verified vendors, compare
          inclusions and prices side by side, and book the setup for your date. If you also need a photographer
          for the baby shower, you can find one on the same platform.
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
            src="/images/customer/blogs/article-baby-shower-welcome/author-amit.png"
            alt="Amit Rai"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col items-start gap-2">
          <p className="font-figtree text-[20px] font-semibold text-[#1E0306]">Amit Rai, Head of Product</p>
          <p className="font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
            Spearheading end-to-end product vision, UX strategy, and platform innovation. His team focuses on
            turning complex workflows into seamless, intuitive tools that make finding, comparing, and managing
            event vendors effortless.
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
                src="/images/customer/blogs/article-baby-shower-welcome/icon-twitter.svg"
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
