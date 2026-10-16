"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X, Check, ChevronDown } from "lucide-react";

const PRICE_ROWS = [
  {
    occasion: "Birthday",
    setup: "Balloon wall or arch, foil letters, lights, cake table",
    heldAt: "Home, terrace, society hall",
    startingFrom: "₹2,000",
  },
  {
    occasion: "Anniversary",
    setup: "Room surprise for two, or a family party backdrop",
    heldAt: "Bedroom, home, banquet",
    startingFrom: "₹2,000",
  },
  {
    occasion: "Proposal",
    setup: "Candle-lit setup, flowers, “Marry Me” letters",
    heldAt: "Rooftop, terrace, restaurant, home",
    startingFrom: "₹2,000",
  },
  {
    occasion: "Baby shower",
    setup: "Themed backdrop, seating for the mother-to-be, signage",
    heldAt: "Home, banquet, society hall",
    startingFrom: "₹2,000",
  },
  {
    occasion: "Welcome baby",
    setup: "Entrance and room decor for the homecoming",
    heldAt: "Home",
    startingFrom: "₹2,000",
  },
];

const OCCASIONS = [
  {
    title: "Birthday decoration price",
    text: "A simple birthday setup is a balloon wall or bunch with foil letters and fairy lights. Mid-range adds a balloon arch or backdrop frame, a neon or name sign and a cake table. Premium setups bring a themed backdrop, custom cutouts and entrance decor. The biggest price jumps come from the backdrop and from switching plain latex balloons to chrome, confetti or large foil balloons.",
    linkLabel: "View birthday packages",
  },
  {
    title: "Anniversary decoration price",
    text: "Anniversary decor splits into two very different jobs. A room surprise for your partner costs about the same as a birthday room setup, with more candles, petals and heart elements. A parents’ anniversary party is closer to a small event, with a stage backdrop, entrance decor and seating, so it costs more and needs more setup time.",
    linkLabel: "View anniversary packages",
  },
  {
    title: "Proposal decoration price",
    text: "Proposal setups are priced on atmosphere: LED candles, flower arrangements, “Marry Me” marquee letters and fairy-light canopies. The venue often costs more than the decor. A rooftop, hotel or restaurant may charge separately for the space or for allowing an outside decorator, so ask before you book either.",
    linkLabel: "View proposal packages",
  },
  {
    title: "Baby shower decoration price",
    text: "A baby shower (or godh bharai) setup usually includes a backdrop with signage, a decorated chair for the mother-to-be, a cake or gift table, and a balloon arch in soft colours. Price rises with the backdrop size, fresh flowers and whether it is at home or in a hall that needs more coverage.",
    linkLabel: "View baby shower packages",
  },
  {
    title: "Welcome baby decoration price",
    text: "Welcome-baby decor is usually smaller: the entrance door, the living room and sometimes the baby’s room, done while the family is at the hospital. Price depends on how many areas are decorated and on timing, since the setup has to fit around the discharge.",
    linkLabel: "View welcome-baby packages",
  },
];

const PRICE_DRIVERS = [
  {
    number: "01",
    title: "Balloon type and count",
    text: "Chrome, pastel, confetti and foil balloons cost more than plain latex.",
  },
  {
    number: "02",
    title: "Backdrop",
    text: "Usually the most expensive single element (ring frame, printed sunboard, neon sign, floral wall).",
  },
  {
    number: "03",
    title: "Fresh vs artificial flowers",
    text: "Fresh flowers cost more and wilt; artificial ones last.",
  },
  {
    number: "04",
    title: "Lights",
    text: "Fairy lights are standard; neon signs and LED letters are often add-ons.",
  },
  {
    number: "05",
    title: "Location",
    text: "Setups outside a vendor’s usual area may carry a travel charge.",
  },
  {
    number: "06",
    title: "Timing",
    text: "Midnight, same-day and peak dates (Valentine’s Day, New Year’s Eve, festive weekends) can cost more.",
  },
  {
    number: "07",
    title: "Space",
    text: "A bedroom, a rooftop and a banquet hall need very different amounts of material.",
  },
];

const NOT_INCLUDED = [
  "Helium (balloons that float need it; air-filled ones are taped or framed)",
  "Cake, cake table or table cloth",
  "Venue charges for rooftops, restaurants or banquet halls",
  "Removal of the decor after the event",
  "Travel beyond the vendor’s service area",
  "Custom printing such as name boards or photo cutouts",
];

const FAQS = [
  {
    question: "How much does birthday decoration at home cost in Noida?",
    answer:
      "Simple setups start around 2000, mid-range setups fall around 2000-4000, and premium themed setups run 5000 and above.",
  },
  {
    question: "How much does a proposal decoration cost?",
    answer:
      "The decor itself is typically 2000; venue charges for a rooftop or restaurant are usually separate.",
  },
  {
    question: "Is a baby shower more expensive to decorate than a birthday?",
    answer:
      "It depends on the setup, but baby showers often include extras like a decorated chair for the mother-to-be and a gift table.",
  },
  {
    question: "Can welcome baby decoration be done before we come home from the hospital?",
    answer: "Usually yes, if someone can let the decorator in. Share your expected discharge time when you book.",
  },
  {
    question: "Is helium included?",
    answer: "Not always. Check the inclusions list.",
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

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-30369 (Article column only — share rail is ArticleShareRail.tsx)
export default function DecorationCostBody() {
  return (
    <article className="flex w-full max-w-[844px] flex-col items-start gap-12">
      {/* Intro */}
      <div className="flex flex-col items-start gap-5">
        <p className="font-figtree text-[22px] leading-[32px] font-normal text-[#1E0306] sm:text-[24px]">
          Ask three decorators for a quote and you will get three very different prices, partly because
          &ldquo;decoration&rdquo; means very different things for different celebrations. A birthday room
          surprise, a rooftop proposal and a baby shower in a banquet hall are three separate jobs.
        </p>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          This guide breaks down what each type of setup costs in Delhi, Gurgaon and Noida in 2026, what drives
          the price, and how to compare packages so you pay for what you see.
        </p>
      </div>

      {/* Prices at a glance */}
      <section id="prices-at-a-glance" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>Decoration prices at a glance</SectionHeading>
        <div className="flex w-full flex-col items-start overflow-x-auto rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1]">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-[#FFF0DB]">
                <th className="px-6 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#3C060D]">
                  OCCASION
                </th>
                <th className="px-6 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#3C060D]">
                  TYPICAL SETUP
                </th>
                <th className="px-6 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#3C060D]">
                  USUALLY HELD AT
                </th>
                <th className="px-6 py-4 text-left font-figtree text-[12px] font-bold tracking-[0.72px] text-[#3C060D]">
                  STARTING FROM
                </th>
              </tr>
            </thead>
            <tbody>
              {PRICE_ROWS.map((row, index) => (
                <tr key={row.occasion} className={index % 2 === 1 ? "bg-[#FFFDFA]" : undefined}>
                  <td className="px-6 py-5 align-top">
                    <span className="flex items-center gap-1.5 font-figtree text-[16px] font-semibold whitespace-nowrap text-[#F0596F]">
                      {row.occasion}
                      <ArrowRight size={14} />
                    </span>
                  </td>
                  <td className="px-6 py-5 align-top font-figtree text-[16px] font-medium text-[#3F3F47]">
                    {row.setup}
                  </td>
                  <td className="px-6 py-5 align-top font-figtree text-[16px] font-medium text-[#3F3F47]">
                    {row.heldAt}
                  </td>
                  <td className="px-6 py-5 align-top font-figtree text-[18px] font-semibold tracking-[-0.18px] whitespace-nowrap text-[#1E0306]">
                    {row.startingFrom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* By occasion */}
      <div className="flex w-full flex-col items-start gap-12">
        {OCCASIONS.map((occasion) => (
          <div key={occasion.title} className="flex w-full flex-col items-start gap-6">
            <SectionHeading>{occasion.title}</SectionHeading>
            <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">{occasion.text}</p>
            <Link
              href="/packages/browse"
              className="flex items-center gap-2 font-figtree text-[16px] font-semibold text-[#F0596F]"
            >
              {occasion.linkLabel}
              <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      {/* Pull quote */}
      <div className="flex w-full items-start gap-7 rounded-[20px] border-l-4 border-[#F0596F] bg-[#FFF2F4] py-6 pr-8 pl-7">
        <div className="flex flex-1 flex-col items-start gap-4">
          <p className="font-figtree text-[22px] leading-[32px] font-medium text-[#3C060D] italic sm:text-[24px]">
            Two packages at the same price can be very different setups. Compare what&rsquo;s included, not what
            it&rsquo;s called.
          </p>
          <p className="font-figtree text-[16px] font-medium text-[#F0596F]">&mdash; Eventory</p>
        </div>
      </div>

      {/* What drives the price */}
      <section id="what-drives-the-price" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>What drives the price for any occasion</SectionHeading>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {PRICE_DRIVERS.map((driver) => (
            <div
              key={driver.number}
              className="flex flex-col items-start gap-2 rounded-[20px] border border-[#FFEBCC] bg-[#FFFAF1] px-6 pt-5.5 pb-6"
            >
              <p className="font-figtree text-[13px] font-bold tracking-[1.04px] text-[#F0596F]">{driver.number}</p>
              <p className="font-figtree text-[18px] font-semibold tracking-[-0.18px] text-[#1E0306]">
                {driver.title}
              </p>
              <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#3F3F47]">{driver.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What's often not included */}
      <section id="whats-not-included" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>What&rsquo;s often not included</SectionHeading>
        <div className="flex w-full flex-col items-start rounded-[20px] border border-[#E4E4E7] bg-white px-7">
          {NOT_INCLUDED.map((item, index) => (
            <div key={item} className="flex w-full flex-col">
              {index > 0 && <div className="h-px w-full bg-[#F3ECE4]" />}
              <div className="flex w-full items-center gap-4 py-4.5">
                <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#FDEEF0]">
                  <X size={14} className="text-[#B4112A]" />
                </div>
                <p className="flex-1 font-figtree text-[16px] font-normal text-[#3F3F47]">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compare two packages */}
      <section id="compare-packages" className="flex w-full scroll-mt-24 flex-col items-start gap-6">
        <SectionHeading>How to compare two packages fairly</SectionHeading>
        <p className="font-figtree text-[16px] leading-[24px] font-normal text-[#3F3F47]">
          List every element in both packages with its size and quantity: number and type of balloons, backdrop
          size, lights, add-ons. If a package does not say, ask. Also ask whether the photos are from the
          vendor&rsquo;s own past work; the setup you get should look like the one you booked.
        </p>
        <figure className="flex w-full flex-col items-start gap-3.5">
          <div className="relative h-[260px] w-full overflow-hidden rounded-[20px] sm:h-[480px]">
            <Image
              src="/images/customer/blogs/article-decoration-cost-delhi-ncr/inline-image.png"
              alt="A fully styled decoration setup with backdrop, lights and props"
              fill
              className="object-cover"
            />
          </div>
          <figcaption className="font-figtree text-[14px] font-medium text-[#9F9FA9]">
            Look for a clear list of inclusions with sizes and quantities, and photos from the vendor&rsquo;s own
            past work.
          </figcaption>
        </figure>
      </section>

      {/* Compare on Eventory */}
      <section
        id="compare-on-eventory"
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
          className="pointer-events-none absolute top-[190px] right-0 hidden sm:right-[120px] sm:block"
        />
        <p className="relative font-figtree text-[24px] leading-[1.12] font-semibold tracking-[-0.4px] text-white sm:text-[32px]">
          Compare decoration packages on Eventory
        </p>
        <p className="relative font-figtree text-[16px] leading-[24px] font-medium text-white">
          On Eventory, decor packages for birthdays, anniversaries, proposals, baby showers and welcome-baby
          homecomings show the price, inclusions and reviews upfront. Filter by occasion, compare options side by
          side, pick your date and slot, and customise add-ons where the vendor allows it.
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
            src="/images/customer/blogs/article-decoration-cost-delhi-ncr/author-anishka.png"
            alt="Anishka"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col items-start gap-2">
          <p className="font-figtree text-[20px] font-semibold text-[#1E0306]">Anishka, Content Designer</p>
          <p className="font-figtree text-[14px] leading-[20px] font-normal text-[#3F3F47]">
            Building a better way for people to discover, compare and book event services online. Her focus is
            making sure every guide gives customers a real, usable answer before they ever talk to a vendor.
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
                src="/images/customer/blogs/article-decoration-cost-delhi-ncr/icon-twitter.svg"
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
