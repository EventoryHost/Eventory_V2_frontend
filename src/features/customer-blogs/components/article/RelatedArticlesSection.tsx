import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const RELATED_POSTS = [
  {
    image: "/images/customer/corporate.jpg",
    title: "Corporate event",
    description: "subtext for the event gehadling",
    byline: "Archi Deval - June 2026",
  },
  {
    image: "/images/customer/tech.jpg",
    title: "Global Tech Conference",
    description: "Innovative solutions for a digital future",
    byline: "Rajesh - September 2025",
  },
  {
    image: "/images/customer/expo.jpg",
    title: "Sustainable Living Expo",
    description: "Empowering eco-friendly practices",
    byline: "Ravi - April 2025",
  },
];

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-28432
export default function RelatedArticlesSection() {
  return (
    <section className="w-full px-4 py-12 sm:px-6 lg:px-16">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="font-figtree text-[16px] font-semibold text-[#EA1D3B] uppercase [text-shadow:0_0_4px_rgba(0,0,0,0.1)]">
              Keep Reading
            </p>
            <h2 className="font-figtree text-[28px] leading-[1.1] font-semibold tracking-[-0.72px] text-[#030303] sm:text-[36px]">
              You Might Also like
            </h2>
          </div>
          <Link
            href="/blogs"
            className="flex shrink-0 items-center gap-3 font-figtree text-[16px] font-semibold tracking-[-0.16px] text-[#EF0042]"
          >
            Read all articles
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {RELATED_POSTS.map((post) => (
            <a
              key={post.title}
              href="#"
              className="flex flex-col overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-white"
            >
              <div className="relative h-[220px] w-full shrink-0">
                <Image src={post.image} alt={post.title} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <p className="font-figtree text-[20px] font-bold tracking-[-0.2px] text-[#3C060D]">{post.title}</p>
                <p className="font-figtree text-[16px] font-medium tracking-[-0.16px] text-[#535353]">
                  {post.description}
                </p>
                <p className="mt-auto font-figtree text-[16px] font-medium tracking-[-0.16px] text-black">
                  {post.byline}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
