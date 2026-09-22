export default function ResultsHeader({
  heading,
  resultCount,
}: {
  heading: string;
  resultCount: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-figtree text-[16px] leading-[20px] font-semibold tracking-[-0.32px] text-[#1e0306]">
        {heading}
      </h1>
      <p className="font-figtree text-[14px] leading-[20px] font-medium tracking-[-0.28px] text-[#666666]">
        Showing <span className="font-semibold text-[#1a1a1a]">{resultCount}</span> results as per
        your search criteria
      </p>
    </div>
  );
}
