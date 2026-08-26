export type NotIncludedRowProps = {
  name: string;
  category?: string;
};

export default function NotIncludedRow({
  name,
  category,
}: NotIncludedRowProps) {
  return (
    <div className="flex w-full max-w-[569px] flex-col gap-1.5">
      <span className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
        {name}
      </span>
      {category && (
        <span className="font-figtree text-[12px] font-normal leading-[20px] text-[#71717B]">
          {category}
        </span>
      )}
    </div>
  );
}
