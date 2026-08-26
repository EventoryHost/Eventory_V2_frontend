export type AllPoliciesContentProps = {
  policies: { id: string; title: string; description: string }[];
};

export default function AllPoliciesContent({ policies }: AllPoliciesContentProps) {
  if (policies.length === 0) {
    return (
      <p className="font-figtree text-[14px] font-normal leading-[22.75px] text-[#71717B]">
        No policies have been added for this package yet.
      </p>
    );
  }

  return (
    <div className="flex w-full max-w-[586px] flex-col gap-6">
      {policies.map((policy) => (
        <div key={policy.id} className="flex flex-col gap-2">
          <span className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
            {policy.title}
          </span>
          <p className="font-figtree text-[14px] font-normal leading-[22.75px] text-[#3F3F47] whitespace-pre-line">
            {policy.description}
          </p>
        </div>
      ))}
    </div>
  );
}
