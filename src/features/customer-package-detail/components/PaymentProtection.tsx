import type { PackageDetail } from "../types";
import SectionHeading from "./SectionHeading";

export default function PaymentProtection({ protection }: { protection: PackageDetail["paymentProtection"] }) {
  return (
    <section className="border-t border-black/5 pt-8">
      <SectionHeading eyebrow="Before you pay">Payment protection</SectionHeading>

      <ul className="space-y-3 font-figtree text-[13px] text-neutral-secondary">
        {protection.points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-brand-primary" />
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg bg-success-subtle px-4 py-3 font-figtree text-[12px] font-medium text-success-700">
        {protection.footnote}
      </div>
    </section>
  );
}
