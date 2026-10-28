import type { ThreadItem } from "../assistant/useHelpConversation";

// v6f4: the sent brief as a card (same component as the requirements
// card), in place of a "My brief: …" message — what the Event Manager
// got, and how they'll reach you.
type Item = Extract<ThreadItem, { kind: "brief-sent" }>;

export default function HelpBriefSentCard({ item }: { item: Item }) {
  const rows: [string, string][] = [...item.rows, ["Reply", item.reach]];
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[16px] border border-[#e4e4e7] bg-white font-figtree">
      <div className="flex items-center gap-2 border-b border-[#e4e4e7] px-3.5 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/customer/help/doc.svg" alt="" width={20} height={20} className="block" />
        <p className="flex-1 text-[14px] font-semibold leading-[20px] text-[#030303]">Your brief</p>
        <span className="rounded-full bg-[#f4f4f5] px-2 text-[12px] leading-[18px] text-[#3f3f47] tabular-nums">
          Sent · {item.time}
        </span>
      </div>
      {item.photoUrl && (
        <div className="flex items-center gap-2.5 px-3.5 pt-3.5 text-[12px] leading-[18px] text-[#71717b]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.photoUrl} alt="Your reference photo" className="size-11 rounded-[8px] border border-[#e4e4e7] object-cover" />
          Reference photo attached
        </div>
      )}
      <dl className="grid grid-cols-[90px_minmax(0,1fr)]">
        {rows.map(([label, value], i) => (
          <div key={label} className="contents">
            <dt className={`py-2 pl-3.5 text-[14px] leading-[20px] text-[#71717b] ${i ? "border-t border-[#e4e4e7]" : ""}`}>
              {label}
            </dt>
            <dd className={`break-words py-2 pl-2 pr-3.5 text-[14px] leading-[20px] text-[#030303] ${i ? "border-t border-[#e4e4e7]" : ""}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
