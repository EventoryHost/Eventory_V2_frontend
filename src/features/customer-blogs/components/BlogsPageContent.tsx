"use client";

import { useMemo, useState } from "react";
import BlogsHeroSection from "./BlogsHeroSection";
import FeaturedStorySection from "./FeaturedStorySection";
import BlogsFilterBar from "./BlogsFilterBar";
import ArticleGridSection, { ARTICLES } from "./ArticleGridSection";
import BlogsSidebar from "./BlogsSidebar";
import BlogsPagination from "./BlogsPagination";

const PAGE_SIZE = 6;

export default function BlogsPageContent() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredArticles = useMemo(
    () => (activeCategory === "All" ? ARTICLES : ARTICLES.filter((article) => article.category === activeCategory)),
    [activeCategory]
  );

  const visibleArticles = filteredArticles.slice(0, visibleCount);

  return (
    <div className="w-full bg-white">
      <BlogsHeroSection />
      <FeaturedStorySection />
      <BlogsFilterBar
        activeCategory={activeCategory}
        onCategoryChange={(category) => {
          setActiveCategory(category);
          setVisibleCount(PAGE_SIZE);
        }}
      />

      <section className="w-full px-4 sm:px-6 lg:px-16">
        <div className="mx-auto flex max-w-[1312px] flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
          <div className="min-w-0 flex-[2]">
            <ArticleGridSection articles={visibleArticles} total={filteredArticles.length} />
          </div>
          <div className="w-full shrink-0 lg:w-[380px]">
            <BlogsSidebar />
          </div>
        </div>
      </section>

      {visibleCount < filteredArticles.length && (
        <BlogsPagination onLoadMore={() => setVisibleCount((count) => count + PAGE_SIZE)} />
      )}
    </div>
  );
}
