"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, User, ChevronUp, Share2 } from "lucide-react";

export type TocItem = { id: string; label: string };

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-28375
// (TOC Header) + node-id=2679-28388 (TOC Links) + node-id=2679-28411 (TOC Meta) + node-id=2679-28424 (TOC Actions)
// Also node-id=2679-30637/30650/30673/30686 — same layout, reused across article pages.
export default function ArticleTableOfContents({
  items,
  readTime = "5 min read",
  authorName = "Team Eventory",
  timeLeft = "5 minutes left",
}: {
  items: TocItem[];
  readTime?: string;
  authorName?: string;
  timeLeft?: string;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const jumpToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // Fall through to clipboard copy if the share sheet was dismissed.
      }
    }
    navigator.clipboard?.writeText(url).catch(() => {});
  };

  return (
    <div className="flex w-full flex-col items-start rounded-2xl border border-[#F4F4F5] bg-white">
      <div className="flex w-full flex-col items-start gap-2.5 px-6 pt-5.5 pb-4.5">
        <div className="flex items-center gap-2.5">
          <BookOpen size={16} className="text-[#F0596F]" />
          <p className="font-figtree text-[14px] font-semibold text-[#1E0306]">TABLE OF CONTENTS</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#9F9FA9]" />
          <p className="font-figtree text-[12px] font-medium text-[#9F9FA9]">{readTime}</p>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-1 px-4 pt-4 pb-3">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors ${
                isActive ? "bg-[#FDEEF0]" : "hover:bg-[#FAFAFA]"
              }`}
            >
              <span className={`size-1.5 shrink-0 rounded-full ${isActive ? "bg-[#B4112A]" : "bg-[#FCDEE2]"}`} />
              <span
                className={`flex-1 font-figtree text-[14px] ${
                  isActive ? "font-semibold text-[#B4112A]" : "font-medium text-[#3F3F47]"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex w-full flex-col items-start gap-2.5 border-t border-[#F4F4F5] px-6 py-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={14} className="text-[#3F3F47]" />
            <p className="font-figtree text-[13px] font-medium text-[#3F3F47]">{authorName}</p>
          </div>
          <p className="font-figtree text-[12px] font-medium text-[#9F9FA9]">Author</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#3F3F47]" />
          <p className="font-figtree text-[13px] font-medium text-[#3F3F47]">{timeLeft}</p>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-2.5 px-5 pt-1 pb-5.5">
        <button
          type="button"
          onClick={jumpToTop}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E4E4E7] bg-white py-2.5"
        >
          <ChevronUp size={16} className="text-[#1E0306]" />
          <span className="font-figtree text-[14px] font-semibold text-[#1E0306]">Jump to Top</span>
        </button>
        <button
          type="button"
          onClick={share}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F0596F] py-2.5"
        >
          <Share2 size={16} className="text-white" />
          <span className="font-figtree text-[14px] font-semibold text-white">Share</span>
        </button>
      </div>
    </div>
  );
}
