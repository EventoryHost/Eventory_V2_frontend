import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Real data for the 5 blog article pages built under
// src/features/customer-blogs/components/article/ — kept in sync with
// ArticleGridSection.tsx's own ARTICLES (not imported directly, to avoid
// this landing-page section depending on the customer-blogs feature).
const FEATURED_POST = {
  image: "/images/customer/blogs/article-diwali-office/hero-image.png",
  title: "Diwali Office Decoration Ideas for 2026 (and How to Get It Done Without Last-Minute Chaos)",
  description:
    "Zone-by-zone decor ideas for your office, plus the approvals, timeline and vendor questions most guides skip.",
  author: "Prathmesh",
  date: "Oct 10, 2026",
  avatar: "/images/customer/blogs/article-diwali-office/author-prathmesh.png",
  href: "/blogs/diwali-office-decoration-ideas-2026",
};

const TOP_RIGHT_POST = {
  image: "/images/customer/blogs/article-decoration-cost-delhi-ncr/hero-image.png",
  title: "Decoration Cost in Delhi NCR (2026)",
  description:
    "What each type of celebration setup costs, what pushes the price up, and how to compare two packages without getting caught by extras.",
  author: "Anishka",
  date: "Oct 10, 2026",
  href: "/blogs/decoration-cost-delhi-ncr-2026",
};

const GRID_POSTS = [
  {
    image: "/images/customer/blogs/article-decorator-questions/hero-image.png",
    title: "15 Questions to Ask Before You Book a Decorator",
    description: "A copy-and-send checklist, plus the red flags to walk away from.",
    author: "Keshav",
    date: "Oct 10, 2026",
    href: "/blogs/decorator-questions-checklist",
  },
  {
    image: "/images/customer/blogs/article-surprise-decoration/hero-image.png",
    title: "Surprise Decoration for Your Partner",
    description: "Seven setups for a birthday, an anniversary or the big question.",
    author: "Ruchi",
    date: "Oct 10, 2026",
    href: "/blogs/surprise-decoration-for-partner",
  },
  {
    image: "/images/customer/blogs/article-baby-shower-welcome/hero-image.png",
    title: "Baby Shower and Welcome Baby Decoration",
    description: "Decor ideas for the godh bharai and the homecoming.",
    author: "Amit Rai",
    date: "Oct 10, 2026",
    href: "/blogs/baby-shower-welcome-baby-decoration",
  },
];

export default function BlogsSection() {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1320px]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-[#EA1D3B]">
            Blogs
          </span>
          <h2 className="mt-2 font-figtree font-semibold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
            Ideas for your next event
          </h2>
        </div>

        <a
          href="/blogs"
          className="flex shrink-0 items-center gap-2 font-figtree text-[14px] font-semibold text-[#F0596F]"
        >
          Read all articles
          <ArrowRight size={16} />
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[868fr_424fr] gap-6">
        {/* Large featured card */}
        <a
          href={FEATURED_POST.href}
          className="flex flex-col sm:flex-row h-full min-h-[396px] overflow-hidden rounded-[20px] border border-black/5 bg-[#FAF9F6] transition-colors hover:border-[#F0596F]/30"
        >
          <div className="relative h-[240px] sm:h-auto sm:w-[424px] shrink-0">
            <Image
              src={FEATURED_POST.image}
              alt={FEATURED_POST.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-4 p-8">
            <div className="flex flex-col gap-3">
              <h3 className="font-figtree text-[22px] font-bold leading-[1.2] text-[#3C060D]">
                {FEATURED_POST.title}
              </h3>
              <p className="font-figtree text-[15px] font-normal leading-[1.5] text-body-secondary">
                {FEATURED_POST.description}
              </p>
              <span className="font-figtree text-[14px] font-semibold text-[#F0596F]">Read more</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#FBBF24]">
                <Image
                  src={FEATURED_POST.avatar}
                  alt={FEATURED_POST.author}
                  fill
                  className="object-cover"
                />
              </span>
              <div>
                <p className="font-figtree text-[14px] font-bold text-brand-950">
                  {FEATURED_POST.author}
                </p>
                <p className="font-figtree text-[13px] font-normal text-body-secondary">
                  {FEATURED_POST.date}
                </p>
              </div>
            </div>
          </div>
        </a>

        {/* Top-right card */}
        <a
          href={TOP_RIGHT_POST.href}
          className="flex flex-col overflow-hidden rounded-[20px] border border-black/5 bg-white transition-colors hover:border-[#F0596F]/30"
        >
          <div className="relative h-[220px] w-full shrink-0">
            <Image
              src={TOP_RIGHT_POST.image}
              alt={TOP_RIGHT_POST.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-3 p-6">
            <div className="flex flex-col gap-2">
              <h3 className="font-figtree text-[20px] font-bold leading-[1.2] text-[#3C060D]">
                {TOP_RIGHT_POST.title}
              </h3>
              <p className="font-figtree text-[14px] font-normal leading-[1.5] text-body-secondary">
                {TOP_RIGHT_POST.description}
              </p>
            </div>
            <p className="font-figtree text-[13px] font-medium text-body-secondary">
              {TOP_RIGHT_POST.author} - {TOP_RIGHT_POST.date}
            </p>
          </div>
        </a>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {GRID_POSTS.map((post) => (
          <a
            key={post.title}
            href={post.href}
            className="flex flex-col overflow-hidden rounded-[20px] border border-black/5 bg-white transition-colors hover:border-[#F0596F]/30"
          >
            <div className="relative h-[220px] w-full shrink-0">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3 p-6">
              <div className="flex flex-col gap-2">
                <h3 className="font-figtree text-[20px] font-bold leading-[1.2] text-[#3C060D]">
                  {post.title}
                </h3>
                <p className="font-figtree text-[14px] font-normal leading-[1.5] text-body-secondary">
                  {post.description}
                </p>
              </div>
              <p className="font-figtree text-[13px] font-medium text-body-secondary">
                {post.author} - {post.date}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
