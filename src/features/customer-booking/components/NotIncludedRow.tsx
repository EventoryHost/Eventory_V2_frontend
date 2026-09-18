export type NotIncludedRowProps = {
  name: string;
  category?: string;
};

export default function NotIncludedRow({
  name,
  category,
}: NotIncludedRowProps) {
  return (
    <div className="w-full max-w-[569px] rounded-2xl bg-[#F4F4F5] p-4">
      <p className="font-figtree text-[14px] leading-[22.75px] font-normal text-[#3F3F47]">{name}</p>
      {category && (
        <p className="mt-1 font-figtree text-[12px] leading-[20px] font-normal text-[#71717B]">{category}</p>
      )}
    </div>
  );
}
