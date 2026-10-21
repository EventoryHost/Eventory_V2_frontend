import Image from "next/image";

export type Article = {
  id: string;
  category: string;
  cover: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  authorAvatar: string;
  authorName: string;
  href: string;
};

// The 5 real article pages built under src/features/customer-blogs/components/article/.
export const ARTICLES: Article[] = [
  {
    id: "diwali-office-decoration-ideas-2026",
    category: "Festivals & Seasons",
    cover: "/images/customer/blogs/article-diwali-office/hero-image.png",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title: "Diwali Office Decoration Ideas for 2026 (and How to Get It Done Without Last-Minute Chaos)",
    excerpt:
      "Zone-by-zone decor ideas for your office, plus the approvals, timeline and vendor questions most guides skip.",
    authorAvatar: "/images/customer/blogs/article-diwali-office/author-prathmesh.png",
    authorName: "Prathmesh",
    href: "/blogs/diwali-office-decoration-ideas-2026",
  },
  {
    id: "decoration-cost-delhi-ncr-2026",
    category: "Planning & Costs",
    cover: "/images/customer/blogs/article-decoration-cost-delhi-ncr/hero-image.png",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title:
      "Decoration Cost in Delhi NCR (2026): Birthday, Anniversary, Proposal, Baby Shower and Welcome Baby",
    excerpt:
      "What each type of celebration setup costs, what pushes the price up, and how to compare two packages without getting caught by extras.",
    authorAvatar: "/images/customer/blogs/article-decoration-cost-delhi-ncr/author-anishka.png",
    authorName: "Anishka",
    href: "/blogs/decoration-cost-delhi-ncr-2026",
  },
  {
    id: "decorator-questions-checklist",
    category: "Planning & Costs",
    cover: "/images/customer/blogs/article-decorator-questions/hero-image.png",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title: "15 Questions to Ask Before You Book a Decorator",
    excerpt:
      "A copy-and-send checklist for birthday, anniversary, proposal, baby shower and welcome-baby decor, with what a good answer sounds like and the red flags to walk away from.",
    authorAvatar: "/images/customer/blogs/article-decorator-questions/author-keshav.png",
    authorName: "Keshav",
    href: "/blogs/decorator-questions-checklist",
  },
  {
    id: "surprise-decoration-for-partner",
    category: "Decoration Ideas",
    cover: "/images/customer/blogs/article-surprise-decoration/hero-image.png",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title: "Surprise Decoration for Your Partner: Birthday, Anniversary and Proposal Ideas (and How to Pull It Off)",
    excerpt:
      "Seven setups for a birthday, an anniversary or the big question, plus the planning that keeps the surprise a surprise.",
    authorAvatar: "/images/customer/blogs/article-surprise-decoration/author-ruchi.png",
    authorName: "Ruchi",
    href: "/blogs/surprise-decoration-for-partner",
  },
  {
    id: "baby-shower-welcome-baby-decoration",
    category: "Decoration Ideas",
    cover: "/images/customer/blogs/article-baby-shower-welcome/hero-image.png",
    date: "Oct 10, 2026",
    readTime: "5 min read",
    title: "Baby Shower and Welcome Baby Decoration at Home: Ideas and Planning Guide",
    excerpt:
      "Decor ideas for the godh bharai and the homecoming, plus how to keep the mother-to-be comfortable and the newborn's space safe.",
    authorAvatar: "/images/customer/blogs/article-baby-shower-welcome/author-amit.png",
    authorName: "Amit Rai",
    href: "/blogs/baby-shower-welcome-baby-decoration",
  },
];

function BlogCard({ article }: { article: Article }) {
  return (
    <a
      href={article.href}
      className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#F4F4F5] bg-white transition-colors hover:border-[#F0596F]/30"
    >
      <div className="relative h-[240px] w-full shrink-0">
        <Image src={article.cover} alt={article.title} fill className="object-cover" />
        <div className="absolute top-4 left-4 rounded-full bg-white px-3 py-1">
          <span className="font-figtree text-[12px] font-semibold tracking-normal text-[#3C060D] uppercase">
            {article.category}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-5 pt-5 pb-6">
        <p className="font-figtree text-[14px] font-medium text-[#71717B]">
          {article.date} &middot; {article.readTime}
        </p>
        <h3 className="font-figtree text-[20px] leading-[24px] font-semibold text-[#1E0306]">{article.title}</h3>
        <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#71717B]">{article.excerpt}</p>

        <div className="mt-1.5 flex items-center gap-2.5">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-2xl bg-[#FDEEF0]">
            <Image src={article.authorAvatar} alt={article.authorName} fill className="object-cover" />
          </div>
          <span className="font-figtree text-[14px] font-semibold text-[#18181B]">{article.authorName}</span>
        </div>
      </div>
    </a>
  );
}

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-31108
export default function ArticleGridSection({ articles, total }: { articles: Article[]; total: number }) {
  return (
    <div className="flex flex-col items-start gap-5">
      <p className="font-figtree text-[14px] font-medium text-[#71717B]">
        Showing {articles.length} of {total} articles
      </p>

      {articles.length === 0 ? (
        <p className="w-full py-10 text-center font-figtree text-[16px] text-[#71717B]">
          No articles match your search — try a different keyword.
        </p>
      ) : (
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
          {articles.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
