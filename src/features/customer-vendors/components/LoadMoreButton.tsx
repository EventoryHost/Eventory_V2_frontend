export default function LoadMoreButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="mt-4 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="rounded-xl border border-black/10 bg-white px-12 py-3.5 font-figtree text-[14px] font-bold text-neutral-primary transition-all hover:border-brand-primary hover:text-brand-primary disabled:opacity-60"
      >
        {isLoading ? "Loading..." : "Load More Results"}
      </button>
    </div>
  );
}
