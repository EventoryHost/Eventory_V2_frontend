"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ReviewCard, { type ReviewCardProps } from "./ReviewCard";
import { STATIC_REVIEWS } from "../data/staticReviews";

const AVATAR_COLORS = ["#0EA5E9", "#FBBF24", "#14B8A6", "#F0596F", "#8B5CF6"];

// Static for now — the v1 site's testimonials (see data/staticReviews.ts),
// not live data from GET /customer/reviews/featured.
const REVIEWS: ReviewCardProps[] = STATIC_REVIEWS.map((review, i) => ({
  rating: review.rating,
  quote: review.quote,
  name: review.name,
  avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
}));

/*
 * Scroll-stack. Cards wait in a row on the right; moving forward flies the
 * next one onto a stack at the left, the stack fans out a little and the cards
 * under it shrink and fade. The same maths as the home prototype, in the
 * card's own pixel units.
 *
 *   progress p   how many cards have been moved onto the stack (animated)
 *   u = i - p    >= 1 waiting in the row, 0..1 flying in, <= 0 part of the stack
 */
const CARD_W = 313;
const CARD_H = 432;
const SLOT0 = 0; // the stack
const SLOT1 = CARD_W + 40; // first card waiting in the row
const PITCH = CARD_W + 20; // distance between cards in the row
const LIFT_ROOM = 28; // headroom so a flying card isn't clipped
const STEP = 300; // px of horizontal wheel/drag per card
const BACKING = 2; // blank cards under the first, so the stack looks fanned from the start

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

function place(i: number, p: number) {
  const u = i - p;
  const sign = i % 2 === 0 ? -1 : 1;
  let x = 0;
  let y = 0;
  let r = 0;
  let k = 1;
  let z = 10;
  let o = 1;
  let shadow = "none";

  if (u >= 1) {
    x = SLOT1 + (u - 1) * PITCH;
  } else if (u > 0) {
    const t = 1 - u;
    const e = 0.8 * t + 0.2 * (1 - (1 - t) * (1 - t));
    const arc = Math.sin(Math.PI * t);
    x = SLOT1 + (SLOT0 - SLOT1) * e;
    y = -20 * arc;
    r = sign * 2.2 * arc;
    k = 1 + 0.025 * arc;
    z = 200;
    shadow =
      arc > 0.002
        ? `0 ${(10 * arc + 4).toFixed(1)}px ${(30 * arc + 8).toFixed(1)}px rgba(120,20,40,${(0.16 * arc).toFixed(3)})`
        : "none";
  } else {
    const d = -u;
    x = SLOT0;
    r = sign * 4 * smooth(Math.min(d, 1));
    k = 1 - 0.022 * Math.min(d, 4);
    z = 100 + i;
    o = 1 - clamp((d - 3) / 1.2, 0, 1);
    shadow = d > 0.02 ? "0 6px 18px rgba(120,20,40,.07)" : "none";
  }
  return { x, y, r, k, z, o, shadow };
}

export default function ReviewsCarousel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef({ cur: 0, target: 0, raf: 0, snap: 0, max: 1, reduce: false });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Blank backing cards first (negative indices), then the real reviews.
  const items = [
    ...Array.from({ length: BACKING }, (_, n) => ({ i: n - BACKING, review: null as ReviewCardProps | null })),
    ...REVIEWS.map((review, i) => ({ i, review })),
  ];

  const render = useCallback((p: number) => {
    items.forEach((item, n) => {
      const node = itemRefs.current[n];
      if (!node) return;
      const s = place(item.i, p);
      node.style.transform = `translate3d(${s.x.toFixed(2)}px, ${(LIFT_ROOM + s.y).toFixed(2)}px, 0) rotate(${s.r.toFixed(3)}deg) scale(${s.k.toFixed(4)})`;
      node.style.zIndex = String(s.z);
      node.style.opacity = s.o.toFixed(3);
      node.style.boxShadow = s.shadow;
      node.style.visibility = s.o <= 0.001 ? "hidden" : "visible";
    });
    const { max } = state.current;
    setAtStart(p <= 0.02);
    setAtEnd(p >= max - 0.02);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tick = useCallback(
    function step() {
      const s = state.current;
      s.raf = 0;
      const d = s.target - s.cur;
      if (s.reduce || Math.abs(d) < 0.0008) {
        s.cur = s.target;
        render(s.cur);
        return;
      }
      s.cur += d * 0.18;
      render(s.cur);
      s.raf = requestAnimationFrame(step);
    },
    [render]
  );

  const setTarget = useCallback(
    (value: number, snap = false) => {
      const s = state.current;
      s.target = clamp(value, 0, s.max);
      if (!s.raf) s.raf = requestAnimationFrame(tick);
      window.clearTimeout(s.snap);
      // After a free scroll, settle on the nearest whole card.
      if (!snap) {
        s.snap = window.setTimeout(() => {
          s.target = clamp(Math.round(s.target), 0, s.max);
          if (!s.raf) s.raf = requestAnimationFrame(tick);
        }, 160);
      }
    },
    [tick]
  );

  // How far the stack can advance depends on how many cards fit in the row.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = state.current;
    s.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      const row = Math.max(1, Math.floor((stage.clientWidth - SLOT1 + 20) / PITCH));
      s.max = Math.max(1, REVIEWS.length - 1 - row);
      s.target = clamp(s.target, 0, s.max);
      s.cur = clamp(s.cur, 0, s.max);
      render(s.cur);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);

    // Trackpad swipe / horizontal wheel: handled here so it can be non-passive
    // and leave vertical page scrolling alone.
    const onWheel = (event: WheelEvent) => {
      let dx = event.deltaX;
      if (event.shiftKey && !dx) dx = event.deltaY;
      if (!dx || (!event.shiftKey && Math.abs(dx) <= Math.abs(event.deltaY))) return;
      event.preventDefault();
      setTarget(s.target + dx / STEP);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      observer.disconnect();
      stage.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(s.raf);
      window.clearTimeout(s.snap);
    };
  }, [render, setTarget]);

  // Mouse drag + touch swipe.
  const drag = useRef<{ x: number; t: number; id: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: event.clientX, t: state.current.target, id: event.pointerId };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const stage = stageRef.current;
    if (!d || !stage || event.pointerId !== d.id) return;
    const dx = event.clientX - d.x;
    if (Math.abs(dx) > 4 && !stage.hasPointerCapture(event.pointerId)) {
      stage.setPointerCapture(event.pointerId);
      stage.style.cursor = "grabbing";
    }
    if (stage.hasPointerCapture(event.pointerId)) setTarget(d.t - dx / STEP);
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || event.pointerId !== drag.current.id) return;
    drag.current = null;
    if (stageRef.current) stageRef.current.style.cursor = "";
    setTarget(Math.round(state.current.target), true);
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setTarget(Math.round(state.current.target) + 1, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setTarget(Math.round(state.current.target) - 1, true);
    }
  };

  const goPrev = () => setTarget(Math.ceil(state.current.target - 0.02) - 1, true);
  const goNext = () => setTarget(Math.floor(state.current.target + 0.02) + 1, true);

  return (
    <section className="mx-auto mt-16 w-full max-w-[1440px] px-4 sm:px-6 lg:px-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-[#F0596F]">
            Why choose eventory
          </span>
          <h2 className="mt-2 font-figtree font-semibold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
            Loved by <span className="text-[#F0596F]">15000+</span> Happy
            Customers
          </h2>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            type="button"
            aria-label="Previous review"
            aria-disabled={atStart}
            onClick={goPrev}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950 transition-opacity ${
              atStart ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next review"
            aria-disabled={atEnd}
            onClick={goNext}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-brand-950 transition-opacity ${
              atEnd ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label="Customer reviews. Use the arrow keys, swipe or drag to move through them."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="relative mt-4 cursor-grab touch-pan-y overflow-hidden overscroll-x-contain outline-none select-none"
        style={{ height: CARD_H + LIFT_ROOM * 2 }}
      >
        {items.map((item, n) => (
          <div
            key={item.i}
            ref={(node) => {
              itemRefs.current[n] = node;
            }}
            aria-hidden={item.review ? undefined : true}
            className="absolute top-0 left-0 rounded-[20px] will-change-transform"
            style={{ width: CARD_W, height: CARD_H, backfaceVisibility: "hidden" }}
          >
            {item.review ? (
              <ReviewCard {...item.review} />
            ) : (
              <div className="h-full w-full rounded-[20px] border border-[#FFEDEF] bg-gradient-to-br from-[#FFF5F6] to-[#FFEBED]" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
