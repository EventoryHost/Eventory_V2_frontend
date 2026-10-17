"use client";

import Image from "next/image";
import { Link2 } from "lucide-react";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-28152 (Share Rail)
export default function ArticleShareRail() {
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
    <div className="hidden w-[60px] shrink-0 flex-col items-center gap-3.5 lg:flex">
      <p className="font-figtree text-[12px] font-bold tracking-[0.96px] text-[#9F9FA9]">SHARE</p>
      <a
        href={`https://twitter.com/intent/tweet`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className="flex size-10 items-center justify-center rounded-full border border-[#E4E4E7] bg-white"
      >
        <Image
          src="/images/customer/blogs/article-diwali-office/icon-twitter.svg"
          alt=""
          width={18}
          height={18}
        />
      </a>
      <a
        href="https://www.linkedin.com/sharing/share-offsite/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="flex size-10 items-center justify-center rounded-full border border-[#E4E4E7] bg-white"
      >
        <Image src="/images/customer/linkedin.svg" alt="" width={18} height={18} />
      </a>
      <button
        type="button"
        onClick={share}
        aria-label="Copy link"
        className="flex size-10 items-center justify-center rounded-full border border-[#E4E4E7] bg-white"
      >
        <Link2 size={18} className="text-[#3F3F47]" />
      </button>
    </div>
  );
}
