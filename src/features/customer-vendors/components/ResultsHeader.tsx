export default function ResultsHeader({
  heading,
  resultCount,
}: {
  heading: string;
  resultCount: number;
}) {
  return (
    <div>
      <h1 className="font-figtree text-[22px] font-bold text-neutral-primary sm:text-[24px]">
        {heading}
      </h1>
      <p className="mt-1 font-figtree text-[14px] text-neutral-tertiary">
        Showing <span className="font-bold text-neutral-primary">{resultCount}</span> results as
        per your search criteria
      </p>
    </div>
  );
}
