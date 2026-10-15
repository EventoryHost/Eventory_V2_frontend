import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-31059
export default function FeaturedStorySection() {
  return (
    <section className="w-full px-4 pb-4 sm:px-6 lg:px-16">
      <div className="mx-auto max-w-[1312px]">
        <div className="flex flex-col gap-6 overflow-hidden rounded-[20px] bg-[#FFFBEB] p-4 lg:flex-row lg:gap-6">
          <div className="relative h-[280px] w-full shrink-0 overflow-hidden rounded-2xl lg:h-[428px] lg:w-[704px]">
            <Image
              src="/images/customer/blogs/featured-cover.png"
              alt="Diwali at home décor setup"
              fill
              className="object-cover"
            />
            <div className="absolute top-6 left-6 rounded-full bg-white px-3 py-1">
              <span className="font-figtree text-[12px] font-semibold tracking-normal text-[#3C060D] uppercase">
                Wedding
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-5 px-1 py-6 lg:pr-10 lg:pl-6 lg:py-12">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-[#FDEEF0] bg-[#FDEEF0] px-3 py-1 font-figtree text-[12px] font-bold tracking-normal text-[#3C060D] uppercase">
                Festivals
              </span>
              <span className="font-figtree text-[14px] font-medium text-[#71717B]">
                Oct 6, 2026 &middot; 8 min read
              </span>
            </div>

            <h2 className="font-figtree text-[26px] leading-[1.2] font-semibold text-[#1E0306] lg:text-[36px] lg:leading-[48px]">
              Diwali at home: 12 décor ideas that light up every corner
            </h2>

            <p className="font-figtree text-[16px] leading-[24px] font-medium text-[#71717B]">
              From rangoli at the entrance to brass diyas on every shelf — how to plan a warm, festive Diwali setup,
              what to book early, and what it really costs.
            </p>

            <div className="flex items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-[#FFB900]">
                <Image
                  src="/images/customer/blogs/featured-avatar.png"
                  alt="Sardar Khan"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-figtree text-[16px] font-semibold text-[#18181B]">Sardar Khan</p>
                <p className="font-figtree text-[14px] font-medium text-[#71717B]">Décor specialist, Jaipur</p>
              </div>
            </div>

            <a
              href="#"
              className="flex w-fit items-center gap-2.5 rounded-full bg-[#F0596F] px-8 py-4 font-figtree text-[16px] font-semibold text-white"
            >
              Read the full story
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
