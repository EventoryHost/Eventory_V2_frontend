import type { PackageDetail } from "../types";

// Figma node 3233:35172: small eyebrow over the accent-bar heading, a
// diamond-bulleted list, and a green "held safely" note.
export default function PaymentProtection({ protection }: { protection: PackageDetail["paymentProtection"] }) {
  return (
    <section id="payment-protection" className="border-t border-black/5 pt-8">
      <div className="mb-4 flex flex-col gap-1.5">
        <p className="font-figtree text-[11px] leading-4 font-semibold tracking-[0.88px] text-[#71717B] uppercase">Before you pay</p>
        <h2 className="flex items-center gap-2.5 font-figtree text-[20px] leading-7 font-semibold tracking-[-0.3px] text-[#030303]">
          <span className="h-[23px] w-[3px] rounded-full bg-[#F0596F]" />
          Payment protection
        </h2>
      </div>

      <div className="flex flex-col gap-3 py-4">
        <ul className="flex flex-col gap-3">
          {protection.points.map((point) => (
            <li key={point} className="flex items-start gap-3 font-figtree text-[14px] leading-5 text-[#3F3F47]">
              <span aria-hidden className="text-[14px] leading-5 text-[#EA1D3B]">
                ◆
              </span>
              {point}
            </li>
          ))}
        </ul>

        <div className="rounded-xl bg-[#F0FDF4] px-4 py-3 font-figtree text-[14px] leading-5 font-medium text-[#008236]">
          {protection.footnote}
        </div>
      </div>
    </section>
  );
}
