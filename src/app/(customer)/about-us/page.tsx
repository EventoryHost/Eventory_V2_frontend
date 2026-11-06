import type { Metadata } from "next";
import AboutUsPageContent from "@/features/customer-about/components/AboutUsPageContent";

export const metadata: Metadata = {
  title: "About Eventory",
  description: "Eventory brings customers and event vendors together in one place, so planning birthdays, weddings and celebrations across Delhi NCR is simpler.",
  alternates: { canonical: "/about-us" },
};

export default function AboutUsPage() {
  return <AboutUsPageContent />;
}
