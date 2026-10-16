import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const RELATED_POSTS = [
  {
    image: "/images/customer/corporate.jpg",
    category: "Planning & Costs",
    title: "15 Questions to Ask Before You Book a Decorator",
    description:
      "A copy-and-send checklist for birthday, anniversary, proposal, baby shower and welcome-baby decor, plus the red flags to walk away from.",
    href: "/blogs/decorator-questions-checklist",
  },
  {
    image: "/images/customer/tech.jpg",
    category: "Decoration Ideas",
    title: "Surprise Decoration for Your Partner",
    description:
      "Seven setups for a birthday, an anniversary or the big question, plus the planning that keeps the surprise a surprise.",
    href: "/blogs/surprise-decoration-for-partner",
  },
  {
    image: "/images/customer/expo.jpg",
    category: "Decoration Ideas",
    title: "Baby Shower and Welcome Baby Decoration at Home",
    description:
      "Decor ideas for the godh bharai and the homecoming, plus how to keep the mother-to-be comfortable and the newborn's space safe.",
    href: "/blogs/baby-shower-welcome-baby-decoration",
  },
];

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-30699
export default function RelatedPostsSection() {
  return (
    <section className="w-full px-4 pt-12 pb-20 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-10">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-3.5">
            <p className="font-figtree text-[16px] font-semibold text-[#EA1D3B]">KEEP READING</p>
            <h2 className="font-figtree text-[28px] leading-[1.1] font-semibold tracking-[-0.72px] text-[#030303] sm:text-[36px]">
              You might also like
            </h2>
          </div>
          <Link
            href="/blogs"
            className="flex shrink-0 items-center gap-2.5 font-figtree text-[16px] font-semibold tracking-[-0.16px] text-[#EA1D3B]"
          >
            Read all articles
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {RELATED_POSTS.map((post) => (
            <a
              key={post.title}
              href={post.href ?? "#"}
              className="flex flex-1 flex-col overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-white"
            >
              <div className="relative h-[220px] w-full shrink-0">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-3.5">
                  <span className="w-fit rounded-full bg-[#FDEEF0] px-4 py-1.5 font-figtree text-[13px] font-semibold text-[#B4112A]">
                    {post.category}
                  </span>
                  <p className="font-figtree text-[20px] leading-[24px] font-bold tracking-[-0.2px] text-[#3C060D]">
                    {post.title}
                  </p>
                  <p className="font-figtree text-[16px] leading-[24px] font-medium tracking-[-0.16px] text-[#535353]">
                    {post.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#F0596F] bg-[#FDEEF0]">
                      <Image
                        src="/images/customer/blogs/article-decoration-cost-delhi-ncr/avatar-mark.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </div>
                    <span className="font-figtree text-[14px] font-semibold text-[#1E0306]">Team Eventory</span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 font-figtree text-[14px] font-semibold text-[#F0596F]">
                    Read article
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
