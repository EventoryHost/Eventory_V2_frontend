import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Real data for the 5 blog article pages built under
// src/features/customer-blogs/components/article/ — kept in sync with
// ArticleGridSection.tsx's own ARTICLES (not imported directly, to avoid
// this landing-page section depending on the customer-blogs feature).
// category/readTime added so these cards can match BlogCard's (the blog
// listing page's card) visual treatment exactly, not just title/author/date.
const FEATURED_POST = {
  image: "/images/customer/blogs/article-diwali-office/hero-image.png",
  category: "Festivals & Seasons",
  readTime: "5 min read",
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
  category: "Planning & Costs",
  readTime: "5 min read",
  title: "Decoration Cost in Delhi NCR (2026)",
  description:
    "What each type of celebration setup costs, what pushes the price up, and how to compare two packages without getting caught by extras.",
  author: "Anishka",
  date: "Oct 10, 2026",
  avatar: "/images/customer/blogs/article-decoration-cost-delhi-ncr/author-anishka.png",
  href: "/blogs/decoration-cost-delhi-ncr-2026",
};

const GRID_POSTS = [
  {
    image: "/images/customer/blogs/article-decorator-questions/hero-image.png",
    category: "Planning & Costs",
    readTime: "5 min read",
    title: "15 Questions to Ask Before You Book a Decorator",
    description: "A copy-and-send checklist, plus the red flags to walk away from.",
    author: "Keshav",
    date: "Oct 10, 2026",
    avatar: "/images/customer/blogs/article-decorator-questions/author-keshav.png",
    href: "/blogs/decorator-questions-checklist",
  },
  {
    image: "/images/customer/blogs/article-surprise-decoration/hero-image.png",
    category: "Decoration Ideas",
    readTime: "5 min read",
    title: "Surprise Decoration for Your Partner",
    description: "Seven setups for a birthday, an anniversary or the big question.",
    author: "Ruchi",
    date: "Oct 10, 2026",
    avatar: "/images/customer/blogs/article-surprise-decoration/author-ruchi.png",
    href: "/blogs/surprise-decoration-for-partner",
  },
  {
    image: "/images/customer/blogs/article-baby-shower-welcome/hero-image.png",
    category: "Decoration Ideas",
    readTime: "5 min read",
    title: "Baby Shower and Welcome Baby Decoration",
    description: "Decor ideas for the godh bharai and the homecoming.",
    author: "Amit Rai",
    date: "Oct 10, 2026",
    avatar: "/images/customer/blogs/article-baby-shower-welcome/author-amit.png",
    href: "/blogs/baby-shower-welcome-baby-decoration",
  },
];

// Category pill overlay on the image — identical to BlogCard's own badge
// (ArticleGridSection.tsx) — reused by every card below so the landing
// page's cards read as the same component, not a lookalike.
function CategoryBadge({ category }: { category: string }) {
  return (
    <div className="absolute top-4 left-4 rounded-full bg-white px-3 py-1">
      <span className="font-figtree text-[12px] font-semibold tracking-normal text-[#3C060D] uppercase">
        {category}
      </span>
    </div>
  );
}

// Author avatar + name row — identical to BlogCard's own bottom row.
function AuthorRow({ avatar, author }: { avatar: string; author: string }) {
  return (
    <div className="mt-1.5 flex items-center gap-2.5">
      <div className="relative size-8 shrink-0 overflow-hidden rounded-2xl bg-[#FDEEF0]">
        <Image src={avatar} alt={author} fill className="object-cover" />
      </div>
      <span className="font-figtree text-[14px] font-semibold text-[#18181B]">{author}</span>
    </div>
  );
}

export default function BlogsSection() {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1440px] px-4 sm:px-6 lg:px-16">
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
        {/* Large featured card — same card language as BlogCard (badge,
            date · read time, author row), just laid out horizontally since
            it's the one oversized card in the row. */}
        <a
          href={FEATURED_POST.href}
          className="flex flex-col sm:flex-row h-full min-h-[396px] overflow-hidden rounded-2xl border border-[#F4F4F5] bg-white transition-colors hover:border-[#F0596F]/30"
        >
          <div className="relative h-[240px] sm:h-auto sm:w-[424px] shrink-0">
            <Image
              src={FEATURED_POST.image}
              alt={FEATURED_POST.title}
              fill
              className="object-cover"
            />
            <CategoryBadge category={FEATURED_POST.category} />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-2.5 p-6">
            <div className="flex flex-col gap-2.5">
              <p className="font-figtree text-[14px] font-medium text-[#71717B]">
                {FEATURED_POST.date} &middot; {FEATURED_POST.readTime}
              </p>
              <h3 className="font-figtree text-[20px] leading-[24px] font-semibold text-[#1E0306]">
                {FEATURED_POST.title}
              </h3>
              <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#71717B]">
                {FEATURED_POST.description}
              </p>
            </div>

            <AuthorRow avatar={FEATURED_POST.avatar} author={FEATURED_POST.author} />
          </div>
        </a>

        {/* Top-right card */}
        <a
          href={TOP_RIGHT_POST.href}
          className="flex flex-col overflow-hidden rounded-2xl border border-[#F4F4F5] bg-white transition-colors hover:border-[#F0596F]/30"
        >
          <div className="relative h-[220px] w-full shrink-0">
            <Image
              src={TOP_RIGHT_POST.image}
              alt={TOP_RIGHT_POST.title}
              fill
              className="object-cover"
            />
            <CategoryBadge category={TOP_RIGHT_POST.category} />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-2.5 px-5 pt-5 pb-6">
            <div className="flex flex-col gap-2.5">
              <p className="font-figtree text-[14px] font-medium text-[#71717B]">
                {TOP_RIGHT_POST.date} &middot; {TOP_RIGHT_POST.readTime}
              </p>
              <h3 className="font-figtree text-[20px] leading-[24px] font-semibold text-[#1E0306]">
                {TOP_RIGHT_POST.title}
              </h3>
              <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#71717B]">
                {TOP_RIGHT_POST.description}
              </p>
            </div>
            <AuthorRow avatar={TOP_RIGHT_POST.avatar} author={TOP_RIGHT_POST.author} />
          </div>
        </a>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {GRID_POSTS.map((post) => (
          <a
            key={post.title}
            href={post.href}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#F4F4F5] bg-white transition-colors hover:border-[#F0596F]/30"
          >
            <div className="relative h-[220px] w-full shrink-0">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
              <CategoryBadge category={post.category} />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-2.5 px-5 pt-5 pb-6">
              <div className="flex flex-col gap-2.5">
                <p className="font-figtree text-[14px] font-medium text-[#71717B]">
                  {post.date} &middot; {post.readTime}
                </p>
                <h3 className="font-figtree text-[20px] leading-[24px] font-semibold text-[#1E0306]">
                  {post.title}
                </h3>
                <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#71717B]">
                  {post.description}
                </p>
              </div>
              <AuthorRow avatar={post.avatar} author={post.author} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
