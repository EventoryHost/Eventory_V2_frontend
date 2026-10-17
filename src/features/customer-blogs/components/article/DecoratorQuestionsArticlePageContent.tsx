import ArticleHeroSection from "./ArticleHeroSection";
import ArticleShareRail from "./ArticleShareRail";
import DecoratorQuestionsBody from "./DecoratorQuestionsBody";
import ArticleTableOfContents from "./ArticleTableOfContents";
import RelatedPostsSection from "./RelatedPostsSection";
import ReadyToPlanBanner from "@/features/customer-landing/components/ReadyToPlanBanner";

const TOC_ITEMS = [
  { id: "whats-included", label: "What's included" },
  { id: "timing-and-setup", label: "Timing and setup" },
  { id: "price-and-payment", label: "Price and payment" },
  { id: "proof-and-quality", label: "Proof and quality" },
  { id: "changes-and-cancellations", label: "Changes and cancellations" },
  { id: "by-occasion", label: "By occasion" },
  { id: "red-flags", label: "Red flags" },
  { id: "booking-on-eventory", label: "Booking on Eventory" },
  { id: "faqs", label: "FAQs" },
];

export default function DecoratorQuestionsArticlePageContent() {
  return (
    <div className="w-full bg-white">
      <ArticleHeroSection
        category="Planning & Costs"
        title={
          <>
            <span className="italic" style={{ fontFamily: "var(--font-lora)" }}>
              15 Questions
            </span>{" "}
            to Ask Before You Book a{" "}
            <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
              Decorator
            </span>
          </>
        }
        description="A copy-and-send checklist for birthday, anniversary, proposal, baby shower and welcome-baby decor, with what a good answer sounds like and the red flags to walk away from."
        authorName="Keshav"
        authorAvatarSrc="/images/customer/blogs/article-decorator-questions/author-keshav.png"
        date="10 Oct 2026"
        readTime="5 min read"
        heroImageSrc="/images/customer/blogs/article-decorator-questions/hero-image.png"
        heroImageAlt="Couple comparing notes with a decorator over a laptop"
      />

      <section className="w-full px-4 py-10 sm:px-6 lg:px-16">
        <div className="mx-auto flex max-w-[1312px] items-start gap-10">
          <ArticleShareRail />
          <DecoratorQuestionsBody />
          <aside className="sticky top-24 hidden w-[320px] shrink-0 lg:block">
            <ArticleTableOfContents items={TOC_ITEMS} showProgress />
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
