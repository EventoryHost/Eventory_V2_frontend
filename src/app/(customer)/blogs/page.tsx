import type { Metadata } from "next";
import BlogsPageContent from "@/features/customer-blogs/components/BlogsPageContent";

export const metadata: Metadata = {
  title: "Event Planning Guides & Decoration Ideas",
  description: "Read Eventory's guides on decoration costs, planning checklists and party ideas for birthdays, anniversaries, baby showers and Diwali in Delhi NCR.",
  alternates: { canonical: "/blogs" },
};

export default function BlogsPage() {
  return <BlogsPageContent />;
}
