import ArticleHeroSection from "./ArticleHeroSection";
import ArticleShareRail from "./ArticleShareRail";
import ArticleBody from "./ArticleBody";
import ArticleTableOfContents from "./ArticleTableOfContents";
import RelatedArticlesSection from "./RelatedArticlesSection";
import ReadyToPlanBanner from "@/features/customer-landing/components/ReadyToPlanBanner";

const TOC_ITEMS = [
  { id: "key-dates", label: "Key dates" },
  { id: "ideas-by-zone", label: "Ideas by zone" },
  { id: "rules-to-check", label: "Rules to check" },
  { id: "timeline", label: "4-week timeline" },
  { id: "budget", label: "Budget" },
  { id: "book-on-eventory", label: "Book on Eventory" },
  { id: "faqs", label: "FAQs" },
];

export default function DiwaliOfficeArticlePageContent() {
  return (
    <div className="w-full bg-white">
      <ArticleHeroSection
        category="Festivals & Seasons"
        title={
          <>
            <span className="italic" style={{ fontFamily: "var(--font-lora)" }}>
              Diwali
            </span>{" "}
            Office Decoration Ideas for 2026 (and How to Get It Done Without{" "}
            <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
              Last-Minute Chaos
            </span>
            )
          </>
        }
        description="Zone-by-zone decor ideas for your office, plus the approvals, timeline and vendor questions most guides skip."
        authorName="Prathmesh"
        authorAvatarSrc="/images/customer/blogs/article-diwali-office/author-prathmesh.png"
        date="10 Oct 2026"
        readTime="5 min read"
        heroImageSrc="/images/customer/blogs/article-diwali-office/hero-image.png"
        heroImageAlt="Marigold and drape festive decor setup for an office celebration"
      />

      <section className="w-full px-4 py-10 sm:px-6 lg:px-16">
        <div className="mx-auto flex max-w-[1312px] items-start gap-10">
          <ArticleShareRail />
          <ArticleBody />
          <aside className="sticky top-24 hidden w-[320px] shrink-0 lg:block">
            <ArticleTableOfContents items={TOC_ITEMS} showProgress />
          </aside>
        </div>
      </section>

      <RelatedArticlesSection />
      <div className="pb-16">
        <ReadyToPlanBanner />
      </div>
    </div>
  );
}
