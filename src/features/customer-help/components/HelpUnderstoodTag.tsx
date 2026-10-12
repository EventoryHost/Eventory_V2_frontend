// Figma "Help / Understood tag" (node 2369:10143). Read-only chip showing
// what the assistant understood (occasion, guests, budget, area).
export default function HelpUnderstoodTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#f0fdf4] py-0.5 pl-1.5 pr-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/customer/help/check-circle-tag.svg"
        alt=""
        width={12}
        height={12}
        className="block shrink-0"
      />
      <span className="whitespace-nowrap font-figtree text-[12px] font-normal leading-[18px] text-[#008236]">
        {label}
      </span>
    </span>
  );
}
