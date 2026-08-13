import { ShieldCheck, Clock, type LucideIcon } from "lucide-react";
import type { PolicyIcon, PolicyItem } from "../types";
import SectionHeading from "./SectionHeading";

const ICON_MAP: Record<PolicyIcon, LucideIcon> = {
  shield: ShieldCheck,
  clock: Clock,
};

export default function PoliciesSection({ policies }: { policies: PolicyItem[] }) {
  return (
    <section className="border-t border-black/5 pt-8">
      <SectionHeading>Policies</SectionHeading>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {policies.map((policy) => {
          const Icon = ICON_MAP[policy.icon];
          return (
            <div key={policy.id}>
              <Icon className="mb-2 h-6 w-6 text-neutral-secondary" />
              <h3 className="mb-1 font-figtree text-[15px] font-bold text-brand-950">{policy.title}</h3>
              <p className="mb-2 font-figtree text-[12px] text-neutral-tertiary">{policy.description}</p>
              <a href={policy.href} className="font-figtree text-[12px] font-semibold text-brand-950 underline">
                Learn more
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
