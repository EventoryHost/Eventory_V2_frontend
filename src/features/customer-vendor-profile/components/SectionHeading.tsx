export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-figtree text-[24px] leading-[32px] font-semibold text-[#030303]">
      {children}
    </h2>
  );
}
