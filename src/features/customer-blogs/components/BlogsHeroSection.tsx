"use client";

import Image from "next/image";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-31051
export default function BlogsHeroSection({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  return (
    <section className="w-full bg-gradient-to-b from-[#FFFBEB] to-white px-4 pt-6 pb-8 sm:px-6 lg:px-16 lg:pt-10 lg:pb-12">
      <div className="mx-auto flex max-w-[1312px] flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="flex max-w-[720px] flex-col gap-3.5">
          <p className="font-figtree text-[16px] leading-[18px] font-semibold tracking-normal text-[#EA1D3B] uppercase">
            Blogs
          </p>
          <h1 className="font-figtree text-[28px] leading-[1.15] font-semibold tracking-[-0.5px] text-[#1E0306] sm:text-[36px] lg:text-[48px] lg:leading-[48px]">
            Ideas, guides &amp;{" "}
            <span className="italic" style={{ fontFamily: "var(--font-lora)", color: "#F0596F" }}>
              inspiration
            </span>{" "}
            for every celebration
          </h1>
          <p className="max-w-[620px] font-figtree text-[16px] leading-[1.35] font-normal text-[#71717B] lg:text-[18px] lg:leading-[24px]">
            Real décor ideas, honest budgets and planning tips from the vendors who make Eventory events happen.
          </p>
        </div>

        <label className="flex h-[48px] w-full max-w-[400px] shrink-0 items-center gap-3 rounded-full border border-[#F4F4F5] bg-white px-5 transition-colors focus-within:border-[#F0596F]/40">
          <Image
            src="/images/customer/blogs/search-icon.svg"
            alt=""
            width={18}
            height={18}
            className="shrink-0"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search articles, themes or vendors"
            className="w-full min-w-0 bg-transparent font-figtree text-[14px] font-medium text-[#1E0306] outline-none placeholder:text-[#9F9FA9]"
          />
        </label>
      </div>
    </section>
  );
}
