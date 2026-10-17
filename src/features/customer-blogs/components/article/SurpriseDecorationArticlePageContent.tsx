import ArticleHeroSection from "./ArticleHeroSection";
import ArticleShareRail from "./ArticleShareRail";
import SurpriseDecorationBody from "./SurpriseDecorationBody";
import ArticleTableOfContents from "./ArticleTableOfContents";
import RelatedPostsSection from "./RelatedPostsSection";
import ReadyToPlanBanner from "@/features/customer-landing/components/ReadyToPlanBanner";

const TOC_ITEMS = [
  { id: "pick-a-setup", label: "Pick a setup" },
  { id: "seven-ideas", label: "7 ideas" },
  { id: "logistics", label: "Logistics" },
  { id: "if-youre-proposing", label: "If you're proposing" },
  { id: "timeline", label: "Timeline" },
  { id: "common-mistakes", label: "Common mistakes" },
  { id: "booking-on-eventory", label: "Booking on Eventory" },
  { id: "faqs", label: "FAQs" },
];

export default function SurpriseDecorationArticlePageContent() {
  return (
    <div className="w-full bg-white">
      <ArticleHeroSection
        category="Decoration Ideas"
        title={
          <>
            <span className="italic" style={{ fontFamily: "var(--font-lora)" }}>
              Surprise Decoration
            </span>{" "}
            for Your Partner: Birthday, Anniversary and{" "}
            <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
              Proposal Ideas
            </span>{" "}
            (and How to Pull It Off)
          </>
        }
        description="Seven setups for a birthday, an anniversary or the big question, plus the planning that keeps the surprise a surprise."
        authorName="Ruchi"
        authorAvatarSrc="/images/customer/blogs/article-surprise-decoration/author-ruchi.png"
        date="10 Oct 2026"
        readTime="5 min read"
        heroImageSrc="/images/customer/blogs/article-surprise-decoration/hero-image.png"
        heroImageAlt="Seven surprise decoration styles for birthday, anniversary and proposal"
      />

      <section className="w-full px-4 py-10 sm:px-6 lg:px-16">
        <div className="mx-auto flex max-w-[1312px] items-start gap-10">
          <ArticleShareRail />
          <SurpriseDecorationBody />
          <aside className="sticky top-24 hidden w-[320px] shrink-0 lg:block">
            <ArticleTableOfContents items={TOC_ITEMS} readTime="7 min read" timeLeft="7 minutes left" showProgress />
          </aside>
        </div>
      </section>

      <RelatedPostsSection />
      <div className="pb-16">
        <ReadyToPlanBanner />
      </div>
    </div>
  );
}
