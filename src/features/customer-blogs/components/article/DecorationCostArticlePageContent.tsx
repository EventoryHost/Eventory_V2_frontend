import ArticleHeroSection from "./ArticleHeroSection";
import ArticleShareRail from "./ArticleShareRail";
import DecorationCostBody from "./DecorationCostBody";
import ArticleTableOfContents from "./ArticleTableOfContents";
import RelatedPostsSection from "./RelatedPostsSection";
import ReadyToPlanBanner from "@/features/customer-landing/components/ReadyToPlanBanner";

const TOC_ITEMS = [
  { id: "prices-at-a-glance", label: "Prices at a glance" },
  { id: "what-drives-the-price", label: "What drives the price" },
  { id: "whats-not-included", label: "What's not included" },
  { id: "compare-packages", label: "Compare packages" },
  { id: "compare-on-eventory", label: "Compare on Eventory" },
  { id: "faqs", label: "FAQs" },
];

export default function DecorationCostArticlePageContent() {
  return (
    <div className="w-full bg-white">
      <ArticleHeroSection
        category="Planning & Costs"
        title={
          <>
            <span className="italic" style={{ fontFamily: "var(--font-lora)" }}>
              Decoration
            </span>{" "}
            Cost in{" "}
            <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
              Delhi NCR (2026)
            </span>
            : Birthday, Anniversary, Proposal, Baby Shower and Welcome Baby
          </>
        }
        description="What each type of celebration setup costs, what pushes the price up, and how to compare two packages without getting caught by extras."
        authorName="Anishka"
        authorAvatarSrc="/images/customer/blogs/article-decoration-cost-delhi-ncr/author-anishka.png"
        date="10 Oct 2026"
        readTime="5 min read"
        heroImageSrc="/images/customer/blogs/article-decoration-cost-delhi-ncr/hero-image.png"
        heroImageAlt="Yellow and marigold backdrop styled for a celebration"
      />

      <section className="w-full px-4 py-10 sm:px-6 lg:px-16">
        <div className="mx-auto flex max-w-[1312px] items-start gap-10">
          <ArticleShareRail />
          <DecorationCostBody />
          <aside className="sticky top-24 hidden w-[320px] shrink-0 lg:block">
            <ArticleTableOfContents items={TOC_ITEMS} authorName="Anishka" />
          </aside>
        </div>
      </section>

      <RelatedPostsSection />
      <div className="pb-16">
        <ReadyToPlanBanner
          heading="Ready to plan your next celebration?"
          description="Compare decoration packages by occasion, check what each one includes and book online, or talk to our team."
          imageSrc="/images/customer/needhelp.png"
          imageAlt="People celebrating"
          primaryLabel="Browse Packages"
          primaryHref="/packages/browse"
          footnote=""
          secondaryLabel="Have a Chat"
          secondaryHref="#"
        />
      </div>
    </div>
  );
}
