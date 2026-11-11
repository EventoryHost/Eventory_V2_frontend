import type { Metadata } from "next";
import DiwaliOfficeArticlePageContent from "@/features/customer-blogs/components/article/DiwaliOfficeArticlePageContent";

export const metadata: Metadata = {
  title: "Diwali Office Decoration Ideas for 2026",
  description: "Zone-by-zone decor ideas for your office, plus the approvals, timeline and vendor questions most guides skip.",
  alternates: { canonical: "/blogs/diwali-office-decoration-ideas-2026" },
};

export default function DiwaliOfficeDecorationIdeasPage() {
  return <DiwaliOfficeArticlePageContent />;
}
