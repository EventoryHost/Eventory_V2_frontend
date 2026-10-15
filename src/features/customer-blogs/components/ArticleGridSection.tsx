import Image from "next/image";

export type Article = {
  id: string;
  category: string;
  cover: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  authorInitials: string;
  authorName: string;
};

export const ARTICLES: Article[] = [
  {
    id: "mehendi-decor-budget",
    category: "Wedding",
    cover: "/images/customer/blogs/article-cover-1.png",
    date: "Oct 2, 2026",
    readTime: "6 min read",
    title: "Mehendi décor on a budget: 9 setups under ₹50,000",
    excerpt: "Marigold arches, floor seating and lighting ideas that look rich without the price tag.",
    authorInitials: "AD",
    authorName: "Archi Deval",
  },
  {
    id: "first-birthday-themes",
    category: "Birthday",
    cover: "/images/customer/blogs/article-cover-2.png",
    date: "Sep 28, 2026",
    readTime: "5 min read",
    title: "First birthday themes parents are loving this year",
    excerpt: "Soft balloon walls, pastel cakes and photo corners — plus what each one costs to book.",
    authorInitials: "NS",
    authorName: "Neha Sharma",
  },
  {
    id: "baby-shower-checklist",
    category: "Baby Shower",
    cover: "/images/customer/blogs/article-cover-3.png",
    date: "Sep 24, 2026",
    readTime: "7 min read",
    title: "Planning a baby shower at home: a simple checklist",
    excerpt: "Everything to sort two weeks out, one week out and on the day, in one list.",
    authorInitials: "RJ",
    authorName: "Ritika Jain",
  },
  {
    id: "offsite-team-enjoy",
    category: "Corporate",
    cover: "/images/customer/blogs/article-cover-4.png",
    date: "Sep 20, 2026",
    readTime: "8 min read",
    title: "How to plan an offsite your team will actually enjoy",
    excerpt: "Venues, catering and activities that work for 30 to 300 people.",
    authorInitials: "RM",
    authorName: "Rajesh Mehta",
  },
  {
    id: "holi-party-ideas",
    category: "Festivals",
    cover: "/images/customer/blogs/article-cover-5.png",
    date: "Sep 15, 2026",
    readTime: "5 min read",
    title: "Top 10 Holi party ideas for 2026",
    excerpt: "Organic colours, a DJ who reads the crowd, and snacks that survive the splash.",
    authorInitials: "AD",
    authorName: "Archi Deval",
  },
  {
    id: "hiring-a-dj",
    category: "Vendor Guides",
    cover: "/images/customer/blogs/article-cover-6.png",
    date: "Sep 11, 2026",
    readTime: "4 min read",
    title: "Hiring a DJ: 7 questions to ask before you book",
    excerpt: "Sound setup, playlists, overtime charges — what to confirm before you pay the token.",
    authorInitials: "KS",
    authorName: "Kabir Singh",
  },
  {
    id: "winter-haldi",
    category: "Wedding",
    cover: "/images/customer/blogs/article-cover-7.png",
    date: "Sep 6, 2026",
    readTime: "6 min read",
    title: "Winter haldi: marigolds, mustard drapes and fairy lights",
    excerpt: "A warm, cosy haldi setup that photographs beautifully on a winter afternoon.",
    authorInitials: "SK",
    authorName: "Sardar Khan",
  },
  {
    id: "pastel-party-decor",
    category: "Décor Tips",
    cover: "/images/customer/blogs/article-cover-8.png",
    date: "Sep 2, 2026",
    readTime: "5 min read",
    title: "Pastel party décor that looks great on camera",
    excerpt: "Colour pairings, lighting tips and backdrops our photographers love.",
    authorInitials: "NS",
    authorName: "Neha Sharma",
  },
];

function BlogCard({ article }: { article: Article }) {
  return (
    <a
      href="#"
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
          <div className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-[#FDEEF0]">
            <span className="font-figtree text-[12px] font-semibold text-[#B4112A]">{article.authorInitials}</span>
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

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
        {articles.map((article) => (
          <BlogCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
