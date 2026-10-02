const TIPS = [
  "Be specific: “the mandap lighting was exactly as shown” is more helpful than “it was good.”",
  "Rate what you experienced, skip a package if you can't fairly judge it.",
  "One review per vendor, your rating reflects their whole service, not just one moment.",
  "Photos speak louder: a real shot of the decoration or food helps the next host decide.",
];

/** "Writing a great review" (node 2023:8312). */
export default function ReviewTipsCard() {
  return (
    <section className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white px-4 pb-7 pt-5">
      <h2 className="px-1 text-[20px] font-semibold leading-7 text-[#3F3F47]">Writing a great review</h2>
      <ul className="flex flex-col gap-6">
        {TIPS.map((tip) => (
          <li key={tip} className="flex items-center gap-2">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9F9FA9]" />
            <p className="text-[14px] font-medium leading-5 tracking-[0.01em] text-[#71717B]">{tip}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
