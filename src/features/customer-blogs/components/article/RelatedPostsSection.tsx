import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ARTICLES, BlogCard } from "../ArticleGridSection";

const RELATED_COUNT = 3;

// Same-category articles first, then the rest in listing order; never the article being read.
function pickRelated(currentId: string) {
  const current = ARTICLES.find((article) => article.id === currentId);
  const others = ARTICLES.filter((article) => article.id !== currentId);
  const sameCategory = others.filter((article) => current && article.category === current.category);
  const rest = others.filter((article) => !sameCategory.includes(article));
  return [...sameCategory, ...rest].slice(0, RELATED_COUNT);
}

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-30699
export default function RelatedPostsSection({ currentId }: { currentId: string }) {
  const related = pickRelated(currentId);
  if (related.length === 0) return null;

  return (
    <section className="w-full px-4 pt-12 pb-20 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-10">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-3.5">
            <p className="font-figtree text-[16px] font-semibold text-[#EA1D3B]">KEEP READING</p>
            <h2 className="font-figtree text-[28px] leading-[1.1] font-semibold tracking-[-0.72px] text-[#030303] sm:text-[36px]">
              You might also like
            </h2>
          </div>
          <Link
            href="/blogs"
            className="flex shrink-0 items-center gap-2.5 font-figtree text-[16px] font-semibold tracking-[-0.16px] text-[#EA1D3B]"
          >
            Read all articles
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {related.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
