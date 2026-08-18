import { Share2, FileText } from "lucide-react";

export default function ShareQuoteCard() {
  return (
    <section className="rounded-2xl border border-black/10 p-6">
      <h3 className="font-figtree text-[16px] font-bold text-brand-950">Share this quote</h3>
      <p className="mt-1 font-figtree text-[13px] text-neutral-secondary">
        Add your event type, location, date and timings to lock a shareable quotation.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-black/15 px-4 py-2 font-figtree text-[13px] font-semibold text-brand-950 transition hover:border-black/30"
        >
          <Share2 className="h-4 w-4" /> Share package
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-brand-primary/20 px-4 py-2 font-figtree text-[13px] font-semibold text-brand-primary transition hover:bg-brand-primary/30"
        >
          <FileText className="h-4 w-4" /> Create quotation
        </button>
      </div>
    </section>
  );
}
