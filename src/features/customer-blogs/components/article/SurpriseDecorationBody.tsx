"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

type Fit = "best" | "works" | "no";

const FIT_LABEL: Record<Fit, string> = { best: "Best fit", works: "Works", no: "No" };
const FIT_STYLE: Record<Fit, string> = {
  best: "bg-[#FDEEF0] text-[#F0596F]",
  works: "bg-[#FFF0DB] text-[#3C060D]",
  no: "",
};

function FitCell({ fit }: { fit: Fit }) {
  if (fit === "no") {
    return <span className="font-figtree text-[14px] font-medium text-[#9F9FA9]">No</span>;
  }
  return (
    <span className={`w-fit rounded-full px-3 py-1 font-figtree text-[14px] font-semibold ${FIT_STYLE[fit]}`}>
      {FIT_LABEL[fit]}
    </span>
  );
}

const SETUPS = [
  {
    setup: "Midnight balloon room",
    birthday: "best" as Fit,
    anniversary: "works" as Fit,
    proposal: "no" as Fit,
    space: "A bedroom",
  },
  {
    setup: "Fairy lights and LED candle path",
    birthday: "works" as Fit,
    anniversary: "best" as Fit,
    proposal: "best" as Fit,
    space: "Any room",
  },
  {
    setup: "Memory lane photo wall",
    birthday: "works" as Fit,
    anniversary: "best" as Fit,
    proposal: "works" as Fit,
    space: "One free wall",
  },
  {
    setup: "Bed decoration with a message",
    birthday: "best" as Fit,
    anniversary: "best" as Fit,
    proposal: "works" as Fit,
    space: "A bedroom",
  },
  {
    setup: "“Marry Me” letters at home",
    birthday: "no" as Fit,
    anniversary: "no" as Fit,
    proposal: "best" as Fit,
    space: "Living room or balcony",
  },
  {
    setup: "Rooftop or terrace setup",
    birthday: "works" as Fit,
    anniversary: "works" as Fit,
    proposal: "best" as Fit,
    space: "A terrace or booked venue",
  },
  {
    setup: "Morning breakfast setup",
    birthday: "best" as Fit,
    anniversary: "works" as Fit,
    proposal: "no" as Fit,
    space: "A dining table",
  },
];

const IDEAS = [
  {
    title: "1. The midnight balloon room",
    text: "Balloons across the ceiling with ribbons hanging down, a foil “Happy Birthday” and fairy lights. It photographs well in low light and fills a room fast. The classic birthday reveal.",
  },
  {
    title: "2. Fairy lights and an LED candle path",
    text: "Warm string lights, LED candles in a path to the bed or table, and rose petals. Softer and more romantic, which is why it suits anniversaries and proposals. Use LED candles rather than real ones; they look the same in photos and are safer near fabric and petals.",
  },
  {
    title: "3. Memory lane photo wall",
    text: "Printed photos of the two of you on a string with mini clips, arranged by year. For an anniversary, add balloon numbers for the years together. It is the setup people remember longest, because it is personal.",
  },
  {
    title: "4. Bed decoration with a message",
    text: "Petals or balloons arranged on the bed spelling a name, an age, the number of years or a short message, with a balloon frame behind the headboard. It works in smaller rooms with no wall space for a backdrop.",
  },
  {
    title: "5. “Marry Me” letters at home",
    text: "Light-up marquee letters, a candle path and flowers in the living room or on the balcony. A home proposal is private, needs no venue booking and gives you full control over timing.",
  },
  {
    title: "6. Rooftop or terrace setup",
    text: "A canopy of fairy lights, a table for two, flowers and LED candles under the open sky. It works for all three occasions but is especially popular for proposals. It needs the most planning: permission, weather and setup time.",
  },
  {
    title: "7. Morning breakfast setup",
    text: "For partners who are asleep by eleven: a balloon arrangement around a breakfast table, a banner and a small cake, set up early morning while they are asleep or out on a walk.",
  },
];

const LOGISTICS = [
  {
    title: "Get your partner out of the house",
    text: "Most setups need time without your partner at home. Plan a reason for them to be away: dinner with friends, a movie, or an errand a friend is in on. Ask the vendor exactly how long setup takes and add a buffer.",
  },
  {
    title: "Handle society security",
    text: "In gated societies across Gurgaon, Noida and Greater Noida, visitors usually need approval at the gate, often through a visitor-management app. If your partner gets the app notifications too, pre-approve the decorator from your own phone or ask the guard to call you directly.",
  },
  {
    title: "Check the space beforehand",
    text: "Note the free wall space, the ceiling height and the power points. Fairy lights, marquee letters and neon signs need sockets, and some walls do not take tape well.",
  },
  {
    title: "Plan the reveal",
    text: "Decide who opens the door and who is filming. Turn the lights on before your partner arrives; the first look should be the full setup, not someone hunting for a switch.",
  },
];

const PROPOSAL_RULES = [
  {
    label: "Venue permission:",
    text: "rooftops, restaurants and hotels may charge for the space or for allowing an outside decorator. Confirm in writing before you book the decor.",
  },
  {
    label: "Weather:",
    text: "for an open-air setup, check the forecast and agree on an indoor backup with the venue.",
  },
  {
    label: "A hidden photographer:",
    text: "you will want the moment on camera. Brief them on where to stand and when you plan to kneel.",
  },
  { label: "The ring:", text: "keep it on you, not in the setup." },
  {
    label: "Light timing:",
    text: "candles and fairy lights look best just after sunset; plan the arrival for then.",
  },
];

const TIMELINE = [
  {
    step: 1,
    title: "7 days before",
    text: "Pick the setup, check the cost guide and shortlist packages. Allow 2–3 weeks for a venue proposal.",
  },
  {
    step: 2,
    title: "5 days before",
    text: "Book the package and a time slot; share space photos and any wall or venue restrictions with the vendor.",
  },
  { step: 3, title: "3 days before", text: "Print photos for a memory wall; order the cake or flowers." },
  {
    step: 4,
    title: "1 day before",
    text: "Confirm arrival time, team size and gate entry; set up the reason for your partner to be away.",
  },
  {
    step: 5,
    title: "On the day",
    text: "Let the vendor in, check every inclusion against the booking, and have everything lit before your partner arrives.",
  },
];

const MISTAKES = [
  "Booking the latest possible slot for a midnight surprise, with no buffer for traffic",
  "Forgetting the society gate notification",
  "Choosing a large backdrop for a small bedroom",
  "Using real candles near balloons, fabric or petals",
  "Booking a rooftop proposal setup before confirming the venue allows outside decorators",
];

const FAQS = [
  {
    question: "How long does a surprise room decoration take to set up?",
    answer: "It depends on the package; ask the vendor and add a buffer of 30 minutes or more.",
  },
  {
    question: "What is the best decoration for an anniversary surprise at home?",
    answer: "A fairy-light and LED-candle setup with a photo wall of your years together is a reliable choice.",
  },
  {
    question: "Where can I propose with decoration in Delhi NCR?",
    answer: "At home, on a terrace or rooftop, or at a restaurant that allows outside decorators.",
  },
  {
    question: "Can a decorator set up at midnight?",
    answer: "Some vendors offer late-night slots.",
  },
  {
    question: "How do I keep the decorator’s visit secret in a gated society?",
    answer: "Pre-approve the visit from your own phone, or ask security to call you instead of sending an app notification.",
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

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-29235 (Article column only — share rail is ArticleShareRail.tsx)
export default function SurpriseDecorationBody() {
  return (
    <article className="flex w-full max-w-[844px] flex-col items-start gap-12">
      {/* Intro */}
      <div className="flex flex-col items-start gap-5">
        <p className="font-figtree text-[22px] leading-[32px] font-normal text-[#1E0306] sm:text-[24px]">
          A surprise works because of the moment the door opens, whether it is a birthday, your anniversary or the
          moment you ask the question. The decoration matters, but so does everything around it: when it is set
          up, how the decorator gets in, and whether your partner finds out from a society-app notification ten
          minutes early.
        </p>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          Here are seven setups that work in Delhi NCR homes and venues, which occasion each suits best, and the
          planning that makes them land.
        </p>
      </div>

      {/* Pick a setup */}
      <section id="pick-a-setup" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Pick a setup by occasion</SectionHeading>
        <div className="flex w-full flex-col items-start overflow-x-auto rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1]">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
                  SETUP
                </th>
                <th className="px-3 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
                  BIRTHDAY
                </th>
                <th className="px-3 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
                  ANNIVERSARY
                </th>
                <th className="px-3 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
                  PROPOSAL
                </th>
                <th className="px-6 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
                  SPACE NEEDED
                </th>
              </tr>
            </thead>
            <tbody>
              {SETUPS.map((row) => (
                <tr key={row.setup} className="border-t border-[#FFEBCC]">
                  <td className="px-6 py-4 align-middle font-figtree text-[16px] font-semibold whitespace-nowrap text-[#1E0306]">
                    {row.setup}
                  </td>
                  <td className="px-3 py-4 align-middle">
                    <FitCell fit={row.birthday} />
                  </td>
                  <td className="px-3 py-4 align-middle">
                    <FitCell fit={row.anniversary} />
                  </td>
                  <td className="px-3 py-4 align-middle">
                    <FitCell fit={row.proposal} />
                  </td>
                  <td className="px-6 py-4 align-middle font-figtree text-[16px] font-medium text-[#3F3F47]">
                    {row.space}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7 ideas */}
      <section id="seven-ideas" className="flex w-full scroll-mt-24 flex-col items-start gap-8">
        <SectionHeading>7 surprise decoration ideas</SectionHeading>
        {IDEAS.map((idea) => (
          <div key={idea.title} className="flex w-full flex-col items-start gap-2">
            <p className="font-figtree text-[22px] leading-[32px] font-medium text-[#1E0306] sm:text-[24px]">
              {idea.title}
            </p>
            <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">{idea.text}</p>
          </div>
        ))}
      </section>

      {/* Pull quote */}
      <div className="flex w-full items-start gap-7 rounded-[20px] border-l-4 border-[#F0596F] bg-[#FFF2F4] py-6 pr-8 pl-7">
        <div className="flex flex-1 flex-col items-start gap-4">
          <p className="font-figtree text-[22px] leading-[32px] font-medium text-[#3C060D] italic sm:text-[24px]">
            The decoration gets the photo. The timing gets the reaction.
          </p>
          <p className="font-figtree text-[16px] font-medium text-[#F0596F]">&mdash; Eventory</p>
        </div>
      </div>

      {/* Setup summary grid */}
      <figure className="flex w-full flex-col items-start gap-3.5">
        <div className="flex w-full flex-col items-start gap-7 rounded-[28px] border border-[#FFEBCC] bg-gradient-to-b from-[#FFFAF1] to-[#FFEEF0] p-6 sm:p-10">
          <div className="flex flex-col items-start gap-2.5">
            <p className="font-figtree text-[26px] leading-[1.12] font-semibold tracking-[-0.4px] text-[#1E0306] sm:text-[32px]">
              Seven{" "}
              <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
                surprise setups
              </span>
            </p>
            <p className="font-figtree text-[16px] font-medium text-[#3F3F47]">
              For birthdays, anniversaries and proposals
            </p>
          </div>

          <div className="h-px w-full bg-[#FFEBCC]" />

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SETUPS.map((row, index) => {
              const bestFor = [
                row.birthday !== "no" && "Birthdays",
                row.anniversary !== "no" && "Anniversaries",
                row.proposal !== "no" && "Proposals",
              ]
                .filter(Boolean)
                .join(", ");
              return (
                <div
                  key={row.setup}
                  className="flex flex-col items-start gap-2.5 rounded-2xl border border-[#FFEBCC] bg-white p-4"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0DB]">
                    <span className="font-figtree text-[14px] font-semibold text-[#3C060D]">{index + 1}</span>
                  </div>
                  <p className="font-figtree text-[16px] leading-[22px] font-semibold text-[#1E0306]">
                    {row.setup}
                  </p>
                  <div className="flex flex-col items-start gap-0.5">
                    <p className="font-figtree text-[11px] font-bold tracking-[0.66px] text-[#790B1A] uppercase">
                      Best for
                    </p>
                    <p className="font-figtree text-[14px] font-medium text-[#3F3F47]">{bestFor}</p>
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <p className="font-figtree text-[11px] font-bold tracking-[0.66px] text-[#790B1A] uppercase">
                      Space
                    </p>
                    <p className="font-figtree text-[14px] font-medium text-[#3F3F47]">{row.space}</p>
                  </div>
                </div>
              );
            })}
            <div className="flex flex-col items-start justify-center gap-2 rounded-2xl bg-[#F0596F] p-4 text-white">
              <p className="font-figtree text-[20px] leading-[1.15] font-medium italic" style={{ fontFamily: "var(--font-lora)" }}>
                Pick the one that fits
              </p>
              <p className="font-figtree text-[14px] font-medium">the occasion, the space and your partner&rsquo;s routine.</p>
            </div>
          </div>
        </div>
        <figcaption className="font-figtree text-[14px] font-medium text-[#9F9FA9]">
          Pick the one that fits the occasion, the space and your partner&rsquo;s routine.
        </figcaption>
      </figure>

      {/* Inline image */}
      <div className="relative h-[260px] w-full overflow-hidden rounded-[20px] sm:h-[480px]">
        <Image
          src="/images/customer/blogs/article-surprise-decoration/inline-image.png"
          alt="A fully styled decoration setup with backdrop, lights and props"
          fill
          className="object-cover"
        />
      </div>

      {/* Logistics */}
      <section id="logistics" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>The surprise logistics nobody tells you about</SectionHeading>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {LOGISTICS.map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-start gap-2.5 rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1] p-6"
            >
              <p className="font-figtree text-[20px] leading-[28px] font-semibold text-[#1E0306]">{card.title}</p>
              <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#3F3F47]">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* If you're proposing */}
      <section id="if-youre-proposing" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>If you&rsquo;re proposing</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          A proposal has more moving parts than a birthday or anniversary surprise, and there is only one take.
        </p>
        <div className="flex w-full flex-col items-start gap-3.5 pl-2">
          {PROPOSAL_RULES.map((rule) => (
            <div key={rule.label} className="flex w-full items-start gap-4">
              <Image
                src="/images/customer/blogs/article-surprise-decoration/bullet.svg"
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
        <SectionHeading>Planning timeline</SectionHeading>
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

      {/* Common mistakes */}
      <section id="common-mistakes" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Common mistakes to avoid</SectionHeading>
        <div className="flex w-full flex-col items-start gap-3.5 pl-2">
          {MISTAKES.map((mistake) => (
            <div key={mistake} className="flex w-full items-start gap-4">
              <Image
                src="/images/customer/blogs/article-surprise-decoration/bullet.svg"
                alt=""
                width={8}
                height={19}
                className="mt-0.5 shrink-0"
              />
              <p className="flex-1 font-figtree text-[16px] font-normal text-[#3F3F47]">{mistake}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Book on Eventory */}
      <section
        id="booking-on-eventory"
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
          Book a surprise setup on Eventory
        </p>
        <p className="relative font-figtree text-[16px] leading-[24px] font-medium text-white">
          On Eventory, you can browse birthday, anniversary and proposal decor packages from verified vendors,
          compare what each includes and pick a date and time slot that works for the surprise. Add personal
          touches where the vendor offers them.
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
            src="/images/customer/blogs/article-surprise-decoration/author-ruchi.png"
            alt="Ruchi"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col items-start gap-2">
          <p className="font-figtree text-[20px] font-semibold text-[#1E0306]">Ruchi, Business Head</p>
          <p className="font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
            Steering strategic growth, vendor operations, and monetization initiatives. Her focus is on scaling
            marketplace supply, optimizing ecosystem economics, and identifying high-impact expansion
            opportunities.
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
                src="/images/customer/blogs/article-surprise-decoration/icon-twitter.svg"
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
