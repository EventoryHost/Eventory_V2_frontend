import { TriangleAlert } from "lucide-react";

export default function WarningCard({
  title = "Event Details Missing",
  message = "Some selected items do not have an event date or location set. Click 'Edit' on the card to fill details.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex gap-4 rounded-3xl border border-[#FFECB3] bg-warning-subtle p-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-500">
        <TriangleAlert className="h-5 w-5 text-white" />
      </div>
      <div>
        <h4 className="mb-1 font-figtree text-[15px] font-bold text-neutral-primary">{title}</h4>
        <p className="font-figtree text-[13px] leading-snug text-neutral-secondary">{message}</p>
      </div>
    </div>
  );
}
