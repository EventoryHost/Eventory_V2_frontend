"use client";

import { useState } from "react";
import Link from "next/link";

// Figma "Help / Package card" (node 2369:10151). Recommended package inside
// an assistant answer; the green "fits" line says why it matches.
type HelpPackageCardProps = {
  href: string;
  name: string;
  vendor: string;
  price: string;
  fits: string;
  imageUrl?: string;
};

export default function HelpPackageCard({
  href,
  name,
  vendor,
  price,
  fits,
  imageUrl,
}: HelpPackageCardProps) {
  // Vendor photos sometimes 404 — fall back to the gallery placeholder.
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <Link
      href={href}
      className="flex w-[168px] shrink-0 snap-start flex-col overflow-hidden rounded-[12px] border border-[#e4e4e7] bg-white"
    >
      <div className="flex h-[72px] w-full items-center justify-center bg-[#f4f4f5]">
        {imageUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="size-full object-cover" onError={() => setImageFailed(true)} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/customer/help/gallery.svg"
            alt=""
            width={20}
            height={20}
            className="block"
          />
        )}
      </div>
      <div className="flex w-full flex-col gap-0.5 px-2.5 pb-2.5 pt-2 font-figtree">
        <p className="text-[12px] font-medium leading-[18px] text-[#030303]">
          {name}
        </p>
        <p className="text-[11px] font-normal leading-[16px] text-[#71717b]">
          {vendor}
        </p>
        <p className="text-[14px] font-semibold leading-[20px] text-[#030303]">
          {price}
        </p>
        <p className="text-[11px] font-normal leading-[16px] text-[#008236]">
          {fits}
        </p>
      </div>
    </Link>
  );
}
