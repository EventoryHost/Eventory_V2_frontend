"use client";

import { useRef, useState } from "react";
import type { TouchEvent } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { Award, ShieldCheck, Headphones, BadgePercent, ChevronLeft, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    icon: Award,
    title: "Verified Vendors",
    description:
      "Every vendor is thoroughly vetted and verified for quality and reliability",
    variant: "pink",
  },
  {
    icon: ShieldCheck,
    title: "Secure Booking",
    description:
      "Your payments are protected with bank-grade security and guarantees",
    variant: "cream",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Dedicated support team available round the clock to assist you",
    variant: "cream",
  },
  {
    icon: BadgePercent,
    title: "Best Price Gaurantee",
    description:
      "Transparent pricing with no hidden costs. Get the best deals guaranteed",
    variant: "pink",
  },
] as const;

// Deck-of-cards interaction (PM request): the first card's slot IS the deck
// and stays fixed in place — nothing about the row's own position or width
// moves. Swiping right (or the right arrow) peels the TOP card off the deck
// and appends it to the right end of the spread row; swiping left (or the
// left arrow) takes the RIGHTMOST spread card and puts it back on TOP of
// the deck. One card moves per gesture/click, not an all-or-nothing
// spread/stack toggle.
//
// Implementation note: each card keeps the same `layoutId` whether it's
// currently rendered inside the deck stack or as its own item in the spread
// row — framer-motion's shared-layout animation handles the cross-container
// move (deck -> row or row -> deck) as one continuous slide/rotate rather
// than a mount/unmount jump cut.
const CARD_WIDTH = 240;
const CARD_HEIGHT = 172;
const SWIPE_THRESHOLD = 40;
const SPRING = { type: "spring", stiffness: 300, damping: 28 } as const;

type Feature = (typeof FEATURES)[number];

function CardBody({ feature }: { feature: Feature }) {
  const isPink = feature.variant === "pink";
  const Icon = feature.icon;
  return (
    <>
      <span
        className={`absolute -top-6 left-6 flex h-14 w-14 items-center justify-center rounded-full ${
          isPink ? "bg-white text-[#F0596F] border border-[#F0596F]" : "bg-[#F0596F] text-white"
        }`}
      >
        <Icon size={22} />
      </span>
      <h3 className={`font-figtree text-[20px] font-bold leading-[1.2] ${isPink ? "text-white" : "text-brand-950"}`}>
        {feature.title}
      </h3>
      <p
        className={`mt-2 font-figtree text-[14px] font-normal leading-[1.4] ${
          isPink ? "text-white/90" : "text-body-secondary"
        }`}
      >
        {feature.description}
      </p>
    </>
  );
}

function cardClassName(feature: Feature) {
  const isPink = feature.variant === "pink";
  return `absolute top-0 left-0 rounded-tl-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl pt-11 pr-6 pb-6 pl-6 shadow-[0_8px_24px_rgba(0,0,0,0.1)] ${
    isPink ? "bg-[#F0596F]" : "bg-white"
  }`;
}

export default function WhyChooseEventory() {
  // Deck order, bottom -> top (last element is the top/visible card).
  const [deckOrder, setDeckOrder] = useState<number[]>(() => FEATURES.map((_, i) => i).reverse());
  // Spread order, left -> right (first spread slot sits right after the deck).
  const [spreadOrder, setSpreadOrder] = useState<number[]>([]);
  const touchStartX = useRef<number | null>(null);

  function unstackOne() {
    setDeckOrder((prev) => {
      if (prev.length === 0) return prev;
      const top = prev[prev.length - 1];
      setSpreadOrder((spread) => [...spread, top]);
      return prev.slice(0, -1);
    });
  }

  function stackOne() {
    setSpreadOrder((prev) => {
      if (prev.length === 0) return prev;
      const rightmost = prev[prev.length - 1];
      setDeckOrder((deck) => [...deck, rightmost]);
      return prev.slice(0, -1);
    });
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (delta > SWIPE_THRESHOLD) unstackOne();
    else if (delta < -SWIPE_THRESHOLD) stackOne();
    touchStartX.current = null;
  }

  return (
    <section className="mx-auto mt-24 grid w-full max-w-[1320px] grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div className="flex flex-col gap-3">
        <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-[#F0596F]">
          Why choose eventory
        </span>
        <h2 className="font-figtree font-semibold text-brand-950 text-[36px] leading-[1.1] tracking-[-0.02em]">
          Why smart planners choose Eventory
        </h2>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            aria-label="Stack a card back onto the deck"
            onClick={stackOne}
            disabled={spreadOrder.length === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Unstack a card from the deck"
            onClick={unstackOne}
            disabled={deckOrder.length === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <LayoutGroup>
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="flex items-start gap-5 overflow-x-auto pt-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Deck slot — fixed position, never moves. Holds whatever cards are currently stacked. */}
          <div className="relative shrink-0" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
            {deckOrder.map((cardIndex, position) => {
              const depthFromTop = deckOrder.length - 1 - position;
              const feature = FEATURES[cardIndex];
              return (
                <motion.div
                  key={cardIndex}
                  layoutId={`why-card-${cardIndex}`}
                  className={cardClassName(feature)}
                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT, zIndex: position + 1 }}
                  animate={{
                    x: depthFromTop * 8,
                    y: depthFromTop * 8,
                    rotate: depthFromTop === 0 ? 0 : cardIndex % 2 === 0 ? -(4 + depthFromTop) : 4 + depthFromTop,
                  }}
                  transition={SPRING}
                >
                  <CardBody feature={feature} />
                </motion.div>
              );
            })}
          </div>

          {/* Spread row — each unstacked card renders here, flat, in the
              order it was peeled off (left-to-right = oldest to newest). */}
          {spreadOrder.map((cardIndex) => {
            const feature = FEATURES[cardIndex];
            return (
              <motion.div
                key={cardIndex}
                layoutId={`why-card-${cardIndex}`}
                className={`${cardClassName(feature)} shrink-0`}
                style={{ position: "relative", width: CARD_WIDTH, height: CARD_HEIGHT }}
                animate={{ x: 0, y: 0, rotate: 0 }}
                transition={SPRING}
              >
                <CardBody feature={feature} />
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </section>
  );
}
