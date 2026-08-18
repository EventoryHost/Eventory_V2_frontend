export default function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="mb-1.5 font-figtree text-[11px] font-semibold tracking-wider text-neutral-tertiary uppercase">
          {eyebrow}
        </div>
      )}
      <h2 className="flex items-center gap-2 font-figtree text-[20px] font-bold text-brand-950">
        <span className="h-5 w-1 rounded bg-brand-primary" />
        {children}
      </h2>
    </div>
  );
}
