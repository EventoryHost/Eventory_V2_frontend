import type { Metadata } from "next";
import DecoratorQuestionsArticlePageContent from "@/features/customer-blogs/components/article/DecoratorQuestionsArticlePageContent";

export const metadata: Metadata = {
  title: "15 Questions to Ask Before You Book a Decorator",
  description: "A copy-and-send checklist for birthday, anniversary, proposal, baby shower and welcome-baby decor, with what a good answer sounds like and the red flags.",
  alternates: { canonical: "/blogs/decorator-questions-checklist" },
};

export default function DecoratorQuestionsChecklistPage() {
  return <DecoratorQuestionsArticlePageContent />;
}
