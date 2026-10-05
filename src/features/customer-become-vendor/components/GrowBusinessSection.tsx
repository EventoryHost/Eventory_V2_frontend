import Image from "next/image";
import Link from "next/link";
import { Apple, Play } from "lucide-react";
import { CATEGORY_META } from "@/lib/categoryMeta";

// The spec gave one exact conic-gradient ring colour (DJ Artist, #A06AFB —
// the saturated middle stop against CATEGORY_META's own pastel
// gradientFrom as the two outer stops) and asked for "the respective
// colour" on the rest. Only DJ Artist's value was actually given; the other
// five are my own reasonable saturated pick from the same pastel family
// CATEGORY_META already uses for that category, not sourced from a design
// file — flag if these need to match something more exact.
const RING_SATURATED: Record<string, string> = {
  photographer: "#34D399",
  caterer: "#FF6B81",
  decorator: "#FFC93C",
  "dj-artist": "#A06AFB",
  "venue-provider": "#4DA8FF",
  "makeup-artist": "#FF9F43",
};

const CATEGORY_BADGES: {
  id: keyof typeof CATEGORY_META;
  label: string;
  top: number;
  side: "left" | "right";
  offset: number;
  /** Seconds — varied per badge so all 6 don't bob in lockstep. */
  duration: number;
  delay: number;
}[] = [
  { id: "photographer", label: "Photographer", top: 54, side: "left", offset: 230, duration: 3.2, delay: 0 },
  { id: "decorator", label: "Decorator", top: 215, side: "left", offset: 125, duration: 3.8, delay: 0.5 },
  { id: "dj-artist", label: "DJ Artist", top: 356, side: "left", offset: 260, duration: 3.4, delay: 1 },
  { id: "caterer", label: "Caterer", top: 54, side: "right", offset: 230, duration: 3.6, delay: 0.3 },
  { id: "venue-provider", label: "Venue Provider", top: 215, side: "right", offset: 125, duration: 3, delay: 0.8 },
  { id: "makeup-artist", label: "Makeup Artist", top: 356, side: "right", offset: 260, duration: 4, delay: 0.2 },
];

function CategoryBadge({ id, label, top, side, offset, duration, delay }: (typeof CATEGORY_BADGES)[number]) {
  const meta = CATEGORY_META[id];
  const ring = RING_SATURATED[id];
  return (
    <div
      // Floating badges only make sense at the desktop size the exact px
      // offsets were measured about — hidden below lg rather than
      // rescaled, same approach as the Hero image's own absolute spec.
      // Continuous float (badge-float, customer-theme.css) — duration/delay
      // staggered per badge so all 6 don't bob in lockstep.
      className="absolute hidden flex-col items-center lg:flex"
      style={{ top, [side]: offset, animation: `badge-float ${duration}s ease-in-out ${delay}s infinite` }}
    >
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full p-[6.67px]"
        style={{
          background: `conic-gradient(from 189.38deg at 48.26% 8.33%, ${meta.gradientFrom} 0deg, ${ring} 302.08deg, ${meta.gradientFrom} 360deg)`,
        }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
          <Image src={meta.icon} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
        </div>
      </div>
      <span
        className="-mt-2.5 flex h-[19px] items-center justify-center rounded-full border bg-white px-2 font-figtree text-[9px] leading-[13px] font-semibold whitespace-nowrap text-[#030303]"
        style={{ borderColor: ring, borderWidth: "0.67px" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function GrowBusinessSection() {
  return (
    // Plain page background, NOT the Why Choose section's cream (#FFF8EB)
    // — this is its own separate section, the card floats on white/the
    // page's own background, not a continuation of the cream block above
    // it. pt-16 is a REAL 64px gap between the two sections, distinct from
    // (on top of) Why Choose's own internal pb-16, which just spaces its
    // cards from its own rounded bottom corner.
    <section className="w-full bg-white px-4 pt-16 pb-20 sm:px-6 lg:px-16">
      <div className="relative mx-auto flex min-h-[552px] w-full max-w-[1312px] flex-col items-center justify-center overflow-hidden rounded-[44px] border border-[#FCDEE2] bg-[#FFFAFA] px-6 py-16 text-center">
        {CATEGORY_BADGES.map((badge) => (
          <CategoryBadge key={badge.id} {...badge} />
        ))}

        <h2 className="max-w-[720px] font-figtree text-[32px] leading-[120%] font-bold tracking-[-0.64px] text-[#030303] sm:text-[38px] lg:text-[44px]">
          Grow your Event Business with Eventory
        </h2>

        <p className="mt-6 max-w-[620px] font-figtree text-[16px] leading-[24px] font-medium text-[#3C060D]">
          Corporate event planning made better with verified vendors&apos; coordination, a dedicated event manager,
          and professional on-ground execution.
        </p>

        <Link
          href="/register"
          className="mt-6 font-figtree text-[16px] font-semibold text-[#EA1D3B] hover:underline"
        >
          Register Now
        </Link>

        <div className="mt-8 flex w-full max-w-[240px] items-center gap-3">
          <span className="h-px flex-1 border-t border-dashed border-black/15" />
          <span className="font-figtree text-[13px] font-medium text-neutral-tertiary">OR</span>
          <span className="h-px flex-1 border-t border-dashed border-black/15" />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center gap-2 rounded-xl bg-black px-4 text-white transition hover:bg-black/85"
          >
            <Play className="h-5 w-5 shrink-0 fill-current" />
            <span className="flex flex-col items-start leading-none">
              <span className="font-figtree text-[10px]">GET IT ON</span>
              <span className="font-figtree text-[15px] font-semibold">Google Play</span>
            </span>
          </a>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center gap-2 rounded-xl bg-black px-4 text-white transition hover:bg-black/85"
          >
            <Apple className="h-6 w-6 shrink-0 fill-current" />
            <span className="flex flex-col items-start leading-none">
              <span className="font-figtree text-[10px]">Download on the</span>
              <span className="font-figtree text-[15px] font-semibold">App Store</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
