import Image from "next/image";
import { ArrowRight } from "lucide-react";

const FEATURED_POST = {
  image: "/images/customer/haldi.jpg",
  title: "Winter Haldi ceremony decorations",
  description:
    "Transform your Winter Haldi ceremony into a magical event with warm, vibrant decorations. Think cozy marigold garlands intertwined with fairy lights, rich mustard yellow drapes, and rustic wooden accents. Add traditional brass lamps and fresh flower arrangements to create an inviting and festive atmosphere that celebrates the season and the joyous occasion.",
  author: "Sardar Khan",
  date: "June 2026",
  avatar: "/images/customer/user-review.png",
};

const TOP_RIGHT_POST = {
  image: "/images/customer/holi.jpg",
  title: "Top 10 Holi Party Ideas for 2026",
  description: "Make your Holi celebration unforgettable with these creative ideas...",
  author: "Archi Deval",
  date: "June 2026",
};

const GRID_POSTS = [
  {
    image: "/images/customer/corporate.jpg",
    title: "Corporate event",
    description: "subtext for the event gehadling",
    author: "Archi Deval",
    date: "June 2026",
  },
  {
    image: "/images/customer/tech.jpg",
    title: "Global Tech Conference",
    description: "Innovative solutions for a digital future",
    author: "Rajesh",
    date: "September 2025",
  },
  {
    image: "/images/customer/expo.jpg",
    title: "Sustainable Living Expo",
    description: "Empowering eco-friendly practices",
    author: "Ravi",
    date: "April 2025",
  },
];

export default function BlogsSection() {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1320px]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="font-figtree text-[13px] font-bold uppercase tracking-wider text-[#EA1D3B]">
            Blogs
          </span>
          <h2 className="mt-2 font-figtree font-semibold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
            Ideas for your next event
          </h2>
        </div>

        <a
          href="#"
          className="flex shrink-0 items-center gap-2 font-figtree text-[14px] font-semibold text-[#F0596F]"
        >
          Real all articles
          <ArrowRight size={16} />
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[868fr_424fr] gap-6">
        {/* Large featured card */}
        <div className="flex flex-col sm:flex-row h-full min-h-[396px] overflow-hidden rounded-[20px] border border-black/5 bg-[#FAF9F6]">
          <div className="relative h-[240px] sm:h-auto sm:w-[424px] shrink-0">
            <Image
              src={FEATURED_POST.image}
              alt={FEATURED_POST.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-4 p-8">
            <div className="flex flex-col gap-3">
              <h3 className="font-figtree text-[22px] font-bold leading-[1.2] text-[#3C060D]">
                {FEATURED_POST.title}
              </h3>
              <p className="font-figtree text-[15px] font-normal leading-[1.5] text-body-secondary">
                {FEATURED_POST.description}
              </p>
              <a
                href="#"
                className="font-figtree text-[14px] font-semibold text-[#F0596F]"
              >
                Read more
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#FBBF24]">
                <Image
                  src={FEATURED_POST.avatar}
                  alt={FEATURED_POST.author}
                  fill
                  className="object-cover"
                />
              </span>
              <div>
                <p className="font-figtree text-[14px] font-bold text-brand-950">
                  {FEATURED_POST.author}
                </p>
                <p className="font-figtree text-[13px] font-normal text-body-secondary">
                  {FEATURED_POST.date}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top-right card */}
        <div className="flex flex-col overflow-hidden rounded-[20px] border border-black/5 bg-white">
          <div className="relative h-[220px] w-full shrink-0">
            <Image
              src={TOP_RIGHT_POST.image}
              alt={TOP_RIGHT_POST.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-3 p-6">
            <div className="flex flex-col gap-2">
              <h3 className="font-figtree text-[20px] font-bold leading-[1.2] text-[#3C060D]">
                {TOP_RIGHT_POST.title}
              </h3>
              <p className="font-figtree text-[14px] font-normal leading-[1.5] text-body-secondary">
                {TOP_RIGHT_POST.description}
              </p>
            </div>
            <p className="font-figtree text-[13px] font-medium text-body-secondary">
              {TOP_RIGHT_POST.author} - {TOP_RIGHT_POST.date}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {GRID_POSTS.map((post) => (
          <div
            key={post.title}
            className="flex flex-col overflow-hidden rounded-[20px] border border-black/5 bg-white"
          >
            <div className="relative h-[220px] w-full shrink-0">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-3 p-6">
              <div className="flex flex-col gap-2">
                <h3 className="font-figtree text-[20px] font-bold leading-[1.2] text-[#3C060D]">
                  {post.title}
                </h3>
                <p className="font-figtree text-[14px] font-normal leading-[1.5] text-body-secondary">
                  {post.description}
                </p>
              </div>
              <p className="font-figtree text-[13px] font-medium text-body-secondary">
                {post.author} - {post.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
