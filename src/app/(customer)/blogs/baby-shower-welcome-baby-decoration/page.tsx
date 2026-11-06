import type { Metadata } from "next";
import BabyShowerWelcomeArticlePageContent from "@/features/customer-blogs/components/article/BabyShowerWelcomeArticlePageContent";

export const metadata: Metadata = {
  title: "Baby Shower & Welcome Baby Decoration at Home: Ideas",
  description: "Decor ideas for the godh bharai and the homecoming, plus how to keep the mother-to-be comfortable and the newborn's space safe.",
  alternates: { canonical: "/blogs/baby-shower-welcome-baby-decoration" },
};

export default function BabyShowerWelcomeBabyDecorationPage() {
  return <BabyShowerWelcomeArticlePageContent />;
}
