import { CalendarClock, PackageCheck } from "lucide-react";

const LINKS = [
  {
    icon: CalendarClock,
    title: "How your event day will look",
    description: "hour-by-hour, from venue visit to teardown.",
  },
  {
    icon: PackageCheck,
    title: "What we bring with us",
    description: "frames, flowers, lighting, tools and disposal.",
  },
];

export default function EventDaySection() {
  return (
    <section id="event-day" className="border-t border-black/5 pt-8">
      <div className="space-y-4 rounded-2xl border border-black/10 p-6">
        {LINKS.map((link) => (
          <div key={link.title} className="flex items-start gap-3">
            <link.icon className="mt-0.5 h-5 w-5 shrink-0 text-success-700" />
            <p className="font-figtree text-[14px] text-neutral-secondary">
              <button type="button" className="font-semibold text-brand-950 underline underline-offset-2">
                {link.title}
              </button>{" "}
              — {link.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
