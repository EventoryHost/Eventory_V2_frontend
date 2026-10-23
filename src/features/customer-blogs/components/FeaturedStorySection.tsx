"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SLIDE_INTERVAL_MS = 5000;

const FEATURED_STORIES = [
  {
    category: "Festivals & Seasons",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title: "Diwali Office Decoration Ideas for 2026 (and How to Get It Done Without Last-Minute Chaos)",
    excerpt:
      "Zone-by-zone decor ideas for your office, plus the approvals, timeline and vendor questions most guides skip.",
    authorName: "Prathmesh",
    authorRole: "Founder of Eventory",
    authorAvatar: "/images/customer/blogs/article-diwali-office/author-prathmesh.png",
    heroImage: "/images/customer/blogs/article-diwali-office/hero-image.png",
    href: "/blogs/diwali-office-decoration-ideas-2026",
  },
  {
    category: "Planning & Costs",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title: "Decoration Cost in Delhi NCR (2026): Birthday, Anniversary, Proposal, Baby Shower and Welcome Baby",
    excerpt:
      "What each type of celebration setup costs, what pushes the price up, and how to compare two packages without getting caught by extras.",
    authorName: "Anishka",
    authorRole: "Content Designer",
    authorAvatar: "/images/customer/blogs/article-decoration-cost-delhi-ncr/author-anishka.png",
    heroImage: "/images/customer/blogs/article-decoration-cost-delhi-ncr/hero-image.png",
    href: "/blogs/decoration-cost-delhi-ncr-2026",
  },
  {
    category: "Planning & Costs",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title: "15 Questions to Ask Before You Book a Decorator",
    excerpt:
      "A copy-and-send checklist for birthday, anniversary, proposal, baby shower and welcome-baby decor, with what a good answer sounds like and the red flags to walk away from.",
    authorName: "Keshav",
    authorRole: "Event Manager",
    authorAvatar: "/images/customer/blogs/article-decorator-questions/author-keshav.png",
    heroImage: "/images/customer/blogs/article-decorator-questions/hero-image.png",
    href: "/blogs/decorator-questions-checklist",
  },
  {
    category: "Decoration Ideas",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title: "Surprise Decoration for Your Partner: Birthday, Anniversary and Proposal Ideas (and How to Pull It Off)",
    excerpt:
      "Seven setups for a birthday, an anniversary or the big question, plus the planning that keeps the surprise a surprise.",
    authorName: "Ruchi",
    authorRole: "Business Head",
    authorAvatar: "/images/customer/blogs/article-surprise-decoration/author-ruchi.png",
    heroImage: "/images/customer/blogs/article-surprise-decoration/hero-image.png",
    href: "/blogs/surprise-decoration-for-partner",
  },
  {
    category: "Decoration Ideas",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title: "Baby Shower and Welcome Baby Decoration at Home: Ideas and Planning Guide",
    excerpt:
      "Decor ideas for the godh bharai and the homecoming, plus how to keep the mother-to-be comfortable and the newborn's space safe.",
    authorName: "Amit Rai",
    authorRole: "Head of Product",
    authorAvatar: "/images/customer/blogs/article-baby-shower-welcome/author-amit.png",
    heroImage: "/images/customer/blogs/article-baby-shower-welcome/hero-image.png",
    href: "/blogs/baby-shower-welcome-baby-decoration",
  },
];

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-31059
// Cycles through all 5 real articles automatically every 5s (crossfade +
// slight slide via framer-motion) instead of showing a single static story.
export default function FeaturedStorySection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % FEATURED_STORIES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const story = FEATURED_STORIES[activeIndex];

  return (
    <section className="w-full px-4 pb-4 sm:px-6 lg:px-16">
      <div className="mx-auto max-w-[1312px]">
        <div className="relative overflow-hidden rounded-[20px] bg-[#FFFBEB]">
          <AnimatePresence mode="wait">
            <motion.div
              key={story.href}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col gap-6 p-4 lg:flex-row lg:gap-6"
            >
              <div className="relative h-[280px] w-full shrink-0 overflow-hidden rounded-2xl lg:h-[428px] lg:w-[704px]">
                <Image src={story.heroImage} alt={story.title} fill className="object-cover" priority />
                <div className="absolute top-6 left-6 rounded-full bg-white px-3 py-1">
                  <span className="font-figtree text-[12px] font-semibold tracking-normal text-[#3C060D] uppercase">
                    {story.category}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-center gap-5 px-1 py-6 lg:pr-10 lg:pl-6 lg:py-12">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-[#FDEEF0] bg-[#FDEEF0] px-3 py-1 font-figtree text-[12px] font-bold tracking-normal text-[#3C060D] uppercase">
                    {story.category}
                  </span>
                  <span className="font-figtree text-[14px] font-medium text-[#71717B]">
                    {story.date} &middot; {story.readTime}
                  </span>
                </div>

                <h2 className="font-figtree text-[22px] leading-[1.25] font-semibold text-[#1E0306] lg:text-[32px] lg:leading-[1.2]">
                  {story.title}
                </h2>

                <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#71717B]">{story.excerpt}</p>

                <div className="flex items-center gap-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-[#FFB900]">
                    <Image src={story.authorAvatar} alt={story.authorName} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-figtree text-[16px] font-semibold text-[#18181B]">{story.authorName}</p>
                    <p className="font-figtree text-[14px] font-medium text-[#71717B]">{story.authorRole}</p>
                  </div>
                </div>

                <a
                  href={story.href}
                  className="flex w-fit items-center gap-2.5 rounded-full bg-[#F0596F] px-8 py-4 font-figtree text-[16px] font-semibold text-white"
                >
                  Read the full story
                  <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {FEATURED_STORIES.map((item, index) => (
            <button
              key={item.href}
              type="button"
              aria-label={`Show story ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-6 bg-[#F0596F]" : "w-1.5 bg-[#F0596F]/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
