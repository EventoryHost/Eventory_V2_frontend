import { ShieldCheck } from "lucide-react";
import type { PolicyItem } from "../types";
import SectionHeading from "./SectionHeading";

export default function PoliciesSection({ policies }: { policies: PolicyItem[] }) {
  return (
    <section id="policies" className="border-t border-black/5 pt-8">
      <SectionHeading>Policies</SectionHeading>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy) => (
          <div key={policy.id}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-success-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="mt-3 flex items-center gap-2">
              <h3 className="font-figtree text-[15px] font-bold text-brand-950">{policy.title}</h3>
              {policy.tag && (
                <span className="rounded-full bg-success-subtle px-2 py-0.5 font-figtree text-[10px] font-semibold text-success-700">
                  {policy.tag}
                </span>
              )}
            </div>
            <p className="mt-1 font-figtree text-[13px] text-neutral-secondary">{policy.description}</p>
            <a
              href={policy.href}
              className="mt-1 inline-block font-figtree text-[13px] font-semibold text-brand-950 underline"
            >
              Learn more
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
