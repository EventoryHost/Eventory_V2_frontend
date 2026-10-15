// Figma: https://www.figma.com/design/fKzA9Z3TJHMEL93WM31azx/Customer-Side---Final-Dev?node-id=2679-31265
export default function BlogsPagination({ onLoadMore }: { onLoadMore: () => void }) {
  return (
    <div className="flex w-full flex-col items-center gap-5 px-4 pt-8 pb-12 sm:px-6 lg:px-16">
      <button
        type="button"
        onClick={onLoadMore}
        className="rounded-full border border-[#F0596F] bg-white px-8 py-4 font-figtree text-[16px] font-semibold text-[#F0596F] transition-colors hover:bg-[#FDEEF0]"
      >
        Load more articles
      </button>
    </div>
  );
}
