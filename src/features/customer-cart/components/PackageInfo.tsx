import Image from "next/image";
import Link from "next/link";
import type { CartPackage } from "../types";
import { formatPrice } from "../utils/currency";

export default function PackageInfo({ cartPackage }: { cartPackage: CartPackage }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
      <div className="relative h-[110px] w-[110px] shrink-0 overflow-hidden rounded-2xl sm:mx-0">
        <Image
          src={cartPackage.image}
          alt={cartPackage.title}
          fill
          sizes="110px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="mb-2 inline-block rounded-full bg-[#FFE3E8] px-3 py-1 font-figtree text-[10px] font-bold tracking-wider text-brand-950 uppercase">
            {cartPackage.categoryLabel}
          </span>
          <h3 className="mb-1 font-figtree text-[18px] leading-snug font-semibold text-neutral-primary">
            {cartPackage.title}
          </h3>
          <Link
            href={cartPackage.href}
            className="font-figtree text-[13px] font-semibold text-brand-primary hover:underline"
          >
            View Package details
          </Link>
        </div>

        <div className="sm:text-right">
          {cartPackage.discountPercent && (
            <span className="mb-1 inline-block rounded-lg bg-success-subtle px-2 py-1 font-figtree text-[12px] font-bold text-success-700">
              {cartPackage.discountPercent}% OFF
            </span>
          )}
          <div className="font-figtree text-[20px] font-bold text-neutral-primary">
            {formatPrice(cartPackage.price)}{" "}
            <span className="font-figtree text-[13px] font-normal text-neutral-secondary">
              / event
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
