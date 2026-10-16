import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-28130
// (also node-id=2679-30347 — same layout, reused across article pages with per-article content)
export default function ArticleHeroSection({
  category,
  title,
  description,
  authorName,
  authorAvatarSrc,
  date,
  readTime,
  heroImageSrc,
  heroImageAlt,
}: {
  category: string;
  title: ReactNode;
  description: string;
  authorName: string;
  authorAvatarSrc: string;
  date: string;
  readTime: string;
  heroImageSrc: string;
  heroImageAlt: string;
}) {
  return (
    <section className="w-full bg-gradient-to-b from-[#FFF6EE] to-white px-4 py-12 sm:px-6 lg:px-[120px] lg:py-16">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 lg:gap-12">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Link href="/" className="font-figtree text-[14px] font-medium text-[#3F3F47]">
              Home
            </Link>
            <span className="font-figtree text-[14px] font-medium text-[#9F9FA9]">/</span>
            <Link href="/blogs" className="font-figtree text-[14px] font-normal text-[#3F3F47]">
              Blog
            </Link>
            <span className="font-figtree text-[14px] font-medium text-[#9F9FA9]">/</span>
            <span className="rounded-full bg-[#FDEEF0] px-4 py-1.5 font-figtree text-[14px] font-semibold text-[#B4112A]">
              {category}
            </span>
          </div>

          <h1 className="max-w-[1040px] font-figtree text-[28px] leading-[1.15] font-semibold tracking-[-0.5px] text-[#030303] sm:text-[36px] lg:text-[48px] lg:leading-[1.05]">
            {title}
          </h1>

          <p className="max-w-[720px] font-figtree text-[16px] leading-[1.35] font-normal tracking-[-0.32px] text-[#636363]">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-[#FFAB01]">
                <Image src={authorAvatarSrc} alt={authorName} fill className="object-cover" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <p className="font-figtree text-[16px] font-semibold text-[#1E0306]">{authorName}</p>
                <p className="font-figtree text-[14px] font-medium text-[#9F9FA9]">
                  {date} &middot; {readTime}
                </p>
              </div>
            </div>
            <span className="h-8 w-px shrink-0 bg-[#E4E4E7]" />
            <span className="rounded-full border-[1.5px] border-[#F0596F] bg-white px-[22px] py-2.5 font-figtree text-[14px] font-semibold text-[#F0596F]">
              {category}
            </span>
          </div>
        </div>

        <div className="relative h-[280px] w-full overflow-hidden rounded-3xl border border-[#FDEEF0] sm:h-[420px] lg:h-[600px]">
          <Image src={heroImageSrc} alt={heroImageAlt} fill className="object-cover" priority />
        </div>
      </div>
    </section>
  );
}
