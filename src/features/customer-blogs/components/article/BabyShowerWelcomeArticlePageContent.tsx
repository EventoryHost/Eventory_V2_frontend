import ArticleHeroSection from "./ArticleHeroSection";
import ArticleShareRail from "./ArticleShareRail";
import BabyShowerWelcomeBody from "./BabyShowerWelcomeBody";
import ArticleTableOfContents from "./ArticleTableOfContents";
import RelatedPostsSection from "./RelatedPostsSection";
import ReadyToPlanBanner from "@/features/customer-landing/components/ReadyToPlanBanner";

const TOC_ITEMS = [
  { id: "shower-vs-welcome-baby", label: "Shower vs welcome baby" },
  { id: "baby-shower-ideas", label: "Baby shower ideas" },
  { id: "mother-to-be-comfort", label: "Mother-to-be comfort" },
  { id: "welcome-baby-ideas", label: "Welcome baby ideas" },
  { id: "newborn-safe-decor", label: "Newborn-safe decor" },
  { id: "timing-it-right", label: "Timing it right" },
  { id: "book-on-eventory", label: "Book on Eventory" },
  { id: "faqs", label: "FAQs" },
];

export default function BabyShowerWelcomeArticlePageContent() {
  return (
    <div className="w-full bg-white">
      <ArticleHeroSection
        category="Decoration Ideas"
        title={
          <>
            <span className="italic" style={{ fontFamily: "var(--font-lora)" }}>
              Baby Shower
            </span>{" "}
            and{" "}
            <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
              Welcome Baby
            </span>{" "}
            Decoration at Home: Ideas and Planning Guide
          </>
        }
        description="Decor ideas for the godh bharai and the homecoming, plus how to keep the mother-to-be comfortable and the newborn's space safe."
        authorName="Amit Rai"
        authorAvatarSrc="/images/customer/blogs/article-baby-shower-welcome/author-amit.png"
        date="10 Oct 2026"
        readTime="5 min read"
        heroImageSrc="/images/customer/blogs/article-baby-shower-welcome/hero-image.png"
        heroImageAlt="Pastel balloon backdrop and floral decor for a baby shower at home"
      />

      <section className="w-full px-4 py-10 sm:px-6 lg:px-16">
        <div className="mx-auto flex max-w-[1312px] items-start gap-10">
          <ArticleShareRail />
          <BabyShowerWelcomeBody />
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
