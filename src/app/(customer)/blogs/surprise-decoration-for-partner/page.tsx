import type { Metadata } from "next";
import SurpriseDecorationArticlePageContent from "@/features/customer-blogs/components/article/SurpriseDecorationArticlePageContent";

export const metadata: Metadata = {
  title: "Surprise Decoration Ideas for Your Partner",
  description: "Seven setups for a birthday, an anniversary or the big question, plus the planning that keeps the surprise a surprise.",
  alternates: { canonical: "/blogs/surprise-decoration-for-partner" },
};

export default function SurpriseDecorationForPartnerPage() {
  return <SurpriseDecorationArticlePageContent />;
}
