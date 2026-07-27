export default function EventSearchCard() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-4 rounded-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] px-6 py-6">
      <div className="flex-1 flex flex-col gap-2">
        <label className="text-[14px] font-semibold text-brand-950">
          Event Type
        </label>
        <input
          type="text"
          placeholder="Search your Event type"
          className="w-full rounded-full bg-[#F4F4F5] px-5 py-3 text-[14px] text-[#71717B] placeholder:text-[#A1A1AA] outline-none"
        />
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <label className="text-[14px] font-semibold text-brand-950">
          Choose vendor service
        </label>
        <input
          type="text"
          placeholder="Text"
          className="w-full rounded-full bg-[#F4F4F5] px-5 py-3 text-[14px] text-[#71717B] placeholder:text-[#A1A1AA] outline-none"
        />
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <label className="text-[14px] font-semibold text-brand-950">
          Event Date
        </label>
        <input
          type="text"
          placeholder="Dates"
          className="w-full rounded-full bg-[#F4F4F5] px-5 py-3 text-[14px] text-[#71717B] placeholder:text-[#A1A1AA] outline-none"
        />
      </div>

      <button
        type="button"
        className="shrink-0 rounded-full bg-brand-primary px-10 py-3 text-[15px] font-semibold text-white sm:w-auto w-full"
      >
        Search
      </button>
    </div>
  );
}
