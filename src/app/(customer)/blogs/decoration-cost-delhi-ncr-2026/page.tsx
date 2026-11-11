import type { Metadata } from "next";
import DecorationCostArticlePageContent from "@/features/customer-blogs/components/article/DecorationCostArticlePageContent";

export const metadata: Metadata = {
  title: "Decoration Cost in Delhi NCR (2026): Price Guide",
  description: "What each type of celebration setup costs, what pushes the price up, and how to compare two packages without getting caught by extras.",
  alternates: { canonical: "/blogs/decoration-cost-delhi-ncr-2026" },
};

export default function DecorationCostDelhiNcrPage() {
  return <DecorationCostArticlePageContent />;
}
