import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function CheckoutNavbar() {
  return (
    <header className="w-full border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-16">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/customer/ev-logo.png"
            alt="Eventory"
            width={28}
            height={28}
          />
          <span
            className="text-brand-primary font-semibold text-[22px] sm:text-[26px] leading-[20px] tracking-[-0.03em]"
            style={{ fontFamily: "var(--font-lora)" }}
          >
            Eventory
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#22C55E]" />
          <span className="font-figtree text-[18px] font-normal leading-[1.3] text-[#71717B]">
            Secure checkout
          </span>
        </div>
      </div>
    </header>
  );
}
