import Image from "next/image";
import Link from "next/link";

export default function ReadyToPlanBanner({
  heading = "Ready to plan your perfect Event?",
  description = "Corporate event planning made better with verified vendors' coordination, a dedicated event manager, and professional on-ground execution.",
  imageSrc = "/images/customer/ready-1.png",
  imageAlt = "Excited customers",
  primaryLabel = "Get started - It's Free",
  primaryHref,
  footnote = "100% free to Browse • Instant access",
  secondaryLabel,
  secondaryHref,
}: {
  heading?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryLabel?: string;
  primaryHref?: string;
  footnote?: string;
  /** Second, text-only CTA shown beside the primary button — omitted by default (landing page's original single-button layout). */
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section
      className="relative mx-auto mt-16 h-auto min-h-[336px] w-full max-w-[1312px] overflow-hidden rounded-[32px] py-10 sm:rounded-[48px] lg:h-[336px] lg:py-0"
      style={{
        background: "linear-gradient(to right, #FFEFD0, #FCDFE2 50%, #FCDFE2)",
      }}
    >
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
      </div>

      <div className="relative z-10 flex h-full max-w-[692px] flex-col items-start justify-center gap-4 px-8 lg:pl-12 lg:pr-0">
        <h2 className="font-figtree font-bold text-brand-950 text-[28px] sm:text-[32px] leading-[1.2] tracking-[-0.02em]">
          {heading}
        </h2>
        <p className="w-full max-w-[692px] font-figtree font-normal text-[16px] leading-[22px] tracking-[-0.01em] text-body-secondary">
          {description}
        </p>
        <div className="flex items-center gap-4">
          {primaryHref ? (
            <Link
              href={primaryHref}
              className="mt-2 rounded-full bg-brand-primary px-8 py-3 text-[15px] font-semibold text-white"
            >
              {primaryLabel}
            </Link>
          ) : (
            <button
              type="button"
              className="mt-2 rounded-full bg-brand-primary px-8 py-3 text-[15px] font-semibold text-white"
            >
              {primaryLabel}
            </button>
          )}
          {secondaryLabel && secondaryHref && (
            <Link href={secondaryHref} className="mt-2 text-[15px] font-semibold text-brand-primary">
              {secondaryLabel}
            </Link>
          )}
        </div>
        {footnote && <p className="font-figtree text-[13px] font-medium text-body-secondary">{footnote}</p>}
      </div>
    </section>
  );
}
