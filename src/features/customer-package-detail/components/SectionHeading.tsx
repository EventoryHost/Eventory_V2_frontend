export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 flex items-center gap-2 font-figtree text-[20px] font-bold text-brand-950">
      <span className="h-5 w-1 rounded bg-brand-primary" />
      {children}
    </h2>
  );
}
