"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, Share2, ChevronDown } from "lucide-react";

type QuestionRow = { question: string; whyItMatters: string; goodAnswer: string };

const QUESTION_GROUPS: { id: string; title: string; rows: QuestionRow[] }[] = [
  {
    id: "whats-included",
    title: "Questions about what's included",
    rows: [
      {
        question: "Can you list every item with quantity and size?",
        whyItMatters: "“Balloon arch” can mean 40 balloons or 200",
        goodAnswer: "“Arch of 100 balloons, 6×4 ft backdrop, 2 foil letters”",
      },
      {
        question: "Are the balloons air-filled or helium?",
        whyItMatters: "Helium is often extra",
        goodAnswer: "A clear yes or no, with the cost if extra",
      },
      {
        question: "Is the cake table, cloth or stand included?",
        whyItMatters: "Commonly missed",
        goodAnswer: "Listed, or priced as an add-on",
      },
      {
        question: "Which add-ons cost extra?",
        whyItMatters: "Neon, LED letters and name boards are often paid add-ons",
        goodAnswer: "A price list, not “we'll see”",
      },
    ],
  },
  {
    id: "timing-and-setup",
    title: "Questions about timing and setup",
    rows: [
      {
        question: "What time will the team arrive, and how long will setup take?",
        whyItMatters: "A surprise fails if setup runs late",
        goodAnswer: "A specific window and duration",
      },
      {
        question: "How many people will come?",
        whyItMatters: "Affects society gate entry and lift booking",
        goodAnswer: "A number, and names for the gate pass if needed",
      },
      {
        question: "What do you need from me?",
        whyItMatters: "Power points, ladder access, wall permission",
        goodAnswer: "A short list",
      },
      {
        question: "Who removes the decor, and when?",
        whyItMatters: "Removal is not always included",
        goodAnswer: "Included, or the cost and timing",
      },
    ],
  },
  {
    id: "price-and-payment",
    title: "Questions about price and payment",
    rows: [
      {
        question: "Is the price final, including travel?",
        whyItMatters: "Distance charges are common outside the vendor's area",
        goodAnswer: "“Final, including travel to your sector”",
      },
      {
        question: "How much advance, and when is the balance due?",
        whyItMatters: "Protects you if something goes wrong",
        goodAnswer: "A clear split and a receipt",
      },
    ],
  },
  {
    id: "proof-and-quality",
    title: "Questions about proof and quality",
    rows: [
      {
        question: "Are these photos of your own past setups?",
        whyItMatters: "Reference images can mislead",
        goodAnswer: "“Yes, from last month in Sector 57”",
      },
      {
        question: "Can I see reviews from recent customers?",
        whyItMatters: "Recent reviews reflect the current team",
        goodAnswer: "Reviews from the last few months",
      },
      {
        question: "What happens if a balloon pops or a light fails during the event?",
        whyItMatters: "Shows how they handle problems",
        goodAnswer: "Spares are left, or a clear answer",
      },
    ],
  },
  {
    id: "changes-and-cancellations",
    title: "Questions about changes and cancellations",
    rows: [
      {
        question: "Can I change colours or the date after booking?",
        whyItMatters: "Plans change",
        goodAnswer: "Up to a clear cut-off time",
      },
      {
        question: "What is your cancellation and refund policy?",
        whyItMatters: "Protects your advance",
        goodAnswer: "A written policy",
      },
    ],
  },
];

const BY_OCCASION = [
  {
    occasion: "Birthday or anniversary room surprise",
    alsoAsk: "Can you finish setup within my window, and can you work quietly late at night?",
  },
  {
    occasion: "Parents’ anniversary party",
    alsoAsk: "Do you handle stage, entrance and seating decor, or only the backdrop?",
  },
  {
    occasion: "Proposal",
    alsoAsk:
      "Have you set up at this venue before, and does the venue allow outside decorators? What is the plan if it rains or gets windy on a rooftop?",
  },
  {
    occasion: "Baby shower or godh bharai",
    alsoAsk: "Can you provide a comfortable decorated chair for the mother-to-be, and gender-neutral design options?",
  },
  {
    occasion: "Welcome baby",
    alsoAsk:
      "Can you set up on short notice around the hospital discharge, and avoid strong scents, glitter and loose confetti near the baby’s room?",
  },
];

const RED_FLAGS = [
  "No inclusions list, only a photo and a price",
  "Refuses to say whether photos are their own work",
  "Asks for full payment upfront with no receipt",
  "Vague arrival times such as “evening” for a surprise setup",
  "Price changes after you share your address",
];

const FAQS = [
  {
    question: "What should I check before booking a birthday decorator?",
    answer:
      "Inclusions with quantities, setup time, what costs extra, payment terms, proof of past work and the cancellation policy.",
  },
  {
    question: "Should I pay the full amount in advance?",
    answer: "Prefer a split between an advance and the balance on completion, with a receipt for each payment.",
  },
  {
    question: "How do I know if decorator photos are real?",
    answer: "Ask directly, and look for the same setups in recent customer reviews with photos.",
  },
  {
    question: "What if the setup looks different from the photo?",
    answer:
      "Raise it before the vendor leaves, with photos. Agreeing on inclusions in writing beforehand makes this much easier.",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-figtree text-[28px] leading-[1.1] font-semibold tracking-[-0.5px] text-[#1E0306] sm:text-[36px]">
      {children}
    </p>
  );
}

function QuestionTable({ rows }: { rows: QuestionRow[] }) {
  return (
    <div className="flex w-full flex-col items-start rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1] px-6">
      <div className="hidden w-full gap-5 py-3 sm:flex">
        <p className="w-[32%] font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">QUESTION</p>
        <p className="w-[32%] font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
          WHY IT MATTERS
        </p>
        <p className="flex-1 font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
          A GOOD ANSWER SOUNDS LIKE
        </p>
      </div>
      {rows.map((row, index) => (
        <div key={row.question} className="flex w-full flex-col">
          {index > 0 && <div className="h-px w-full bg-[#FFEBCC]" />}
          <div className="flex w-full flex-col gap-3 py-4.5 sm:flex-row sm:gap-5">
            <div className="flex w-full items-start gap-3 sm:w-[32%]">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0DB]">
                <span className="font-figtree text-[14px] font-semibold text-[#3C060D]">{index + 1}</span>
              </div>
              <p className="font-figtree text-[16px] font-semibold text-[#1E0306]">{row.question}</p>
            </div>
            <p className="w-full font-figtree text-[16px] font-medium text-[#3F3F47] sm:w-[32%]">
              {row.whyItMatters}
            </p>
            <p className="flex-1 font-figtree text-[16px] font-medium text-[#3C060D] italic">{row.goodAnswer}</p>
          </div>
        </div>
      ))}
    </div>
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

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-28601 (Article column only — share rail is ArticleShareRail.tsx)
export default function DecoratorQuestionsBody() {
  return (
    <article className="flex w-full max-w-[844px] flex-col items-start gap-12">
      {/* Intro */}
      <div className="flex flex-col items-start gap-5">
        <p className="font-figtree text-[22px] leading-[32px] font-normal text-[#1E0306] sm:text-[24px]">
          Most decoration disappointments do not come from bad decorators. They come from questions nobody asked:
          whether helium was included, what time setup would start, or whether the photo was of a real past setup.
        </p>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          Here are the 15 questions worth asking before you pay anything, grouped by what they protect you from.
          Copy them into your chat with the vendor.
        </p>
      </div>

      {/* Question groups */}
      {QUESTION_GROUPS.map((group) => (
        <section key={group.id} id={group.id} className="flex w-full scroll-mt-24 flex-col items-start gap-6">
          <SectionHeading>{group.title}</SectionHeading>
          <QuestionTable rows={group.rows} />
        </section>
      ))}

      {/* Pull quote */}
      <div className="flex w-full items-start gap-7 rounded-[20px] border-l-4 border-[#F0596F] bg-[#FFF2F4] py-6 pr-8 pl-7">
        <div className="flex flex-1 flex-col items-start gap-4">
          <p className="font-figtree text-[22px] leading-[32px] font-medium text-[#3C060D] italic sm:text-[24px]">
            A decorator who answers in specifics before you pay will usually deliver in specifics on the day.
          </p>
          <p className="font-figtree text-[16px] font-medium text-[#F0596F]">&mdash; Eventory</p>
        </div>
      </div>

      {/* By occasion */}
      <section id="by-occasion" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Extra questions for specific occasions</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          The 15 questions above apply to any booking. Each occasion also has one or two questions that matter more
          than the rest.
        </p>
        <div className="flex w-full flex-col items-start rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1] px-6">
          <div className="hidden w-full gap-8 py-3 sm:flex">
            <p className="w-[220px] font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">
              OCCASION
            </p>
            <p className="flex-1 font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A]">ALSO ASK</p>
          </div>
          {BY_OCCASION.map((row, index) => (
            <div key={row.occasion} className="flex w-full flex-col">
              {index > 0 && <div className="h-px w-full bg-[#FFEBCC]" />}
              <div className="flex w-full flex-col gap-2 py-4.5 sm:flex-row sm:gap-8">
                <span className="flex w-[220px] shrink-0 items-center gap-2 font-figtree text-[16px] font-semibold text-[#F0596F]">
                  {row.occasion}
                  <ArrowRight size={16} className="shrink-0" />
                </span>
                <p className="flex-1 font-figtree text-[16px] font-medium text-[#3F3F47]">{row.alsoAsk}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Red flags */}
      <section id="red-flags" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Red flags to walk away from</SectionHeading>
        <div className="flex w-full flex-col items-start gap-3.5 pl-2">
          {RED_FLAGS.map((flag) => (
            <div key={flag} className="flex w-full items-start gap-4">
              <Image
                src="/images/customer/blogs/article-decorator-questions/bullet.svg"
                alt=""
                width={8}
                height={19}
                className="mt-0.5 shrink-0"
              />
              <p className="flex-1 font-figtree text-[16px] font-normal text-[#3F3F47]">{flag}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <figure className="flex w-full flex-col items-start gap-3.5">
        <div className="flex w-full flex-col items-start gap-7 rounded-[28px] border border-[#FFEBCC] bg-gradient-to-b from-[#FFFAF1] to-[#FFEEF0] p-6 sm:p-10">
          <div className="flex flex-col items-start gap-2.5">
            <p className="font-figtree text-[26px] leading-[1.12] font-semibold tracking-[-0.4px] text-[#1E0306] sm:text-[32px]">
              Decorator{" "}
              <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
                booking checklist
              </span>
            </p>
            <p className="font-figtree text-[16px] font-medium text-[#3F3F47]">
              Copy-and-send questions for any decor booking
            </p>
          </div>

          <div className="h-px w-full bg-[#FFEBCC]" />

          <div className="grid w-full grid-cols-1 gap-7 sm:grid-cols-2">
            {QUESTION_GROUPS.map((group) => (
              <div key={group.id} className="flex flex-col items-start gap-3.5">
                <p className="font-figtree text-[12px] font-bold tracking-[0.72px] text-[#790B1A] uppercase">
                  {group.title.replace("Questions about ", "")}
                </p>
                {group.rows.map((row) => (
                  <label key={row.question} className="flex w-full items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-[22px] shrink-0 rounded-[6px] border-[1.5px] border-[#F0596F] accent-[#F0596F]"
                    />
                    <span className="font-figtree text-[15px] leading-[22px] font-medium text-[#1E0306]">
                      {row.question}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
        <figcaption className="font-figtree text-[14px] font-medium text-[#9F9FA9]">
          Save this list and send it to every vendor you shortlist.
        </figcaption>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#F0596F] py-3 pr-[22px] pl-5 font-figtree text-[15px] font-semibold text-white"
          >
            <Download size={18} />
            Download checklist
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border-[1.5px] border-[#F0596F] bg-white py-3 pr-[22px] pl-5 font-figtree text-[15px] font-semibold text-[#F0596F]"
          >
            <Share2 size={18} />
            Share on WhatsApp
          </button>
        </div>
      </figure>

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
          Skip half the questions on Eventory
        </p>
        <p className="relative font-figtree text-[16px] leading-[24px] font-medium text-white">
          Eventory decorator packages list the inclusions, price and reviews before you book, and you pick your
          date and time slot when you check out. That answers most of the first ten questions upfront, so your
          chat with the vendor can focus on the details that are specific to your event.
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
            src="/images/customer/blogs/article-decorator-questions/author-keshav.png"
            alt="Keshav"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col items-start gap-2">
          <p className="font-figtree text-[20px] font-semibold text-[#1E0306]">Keshav, Event Manager</p>
          <p className="font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
            Ensuring real-time resolution, proactive coordination, and high client satisfaction. His team serves
            as the dedicated bridge between organizers and vendors, providing rapid operational support whenever
            questions or issues arise.
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
                src="/images/customer/blogs/article-decorator-questions/icon-twitter.svg"
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
