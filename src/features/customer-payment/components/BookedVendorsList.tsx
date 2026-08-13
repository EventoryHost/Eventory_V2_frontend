export type BookedVendorItem = {
  vendorName: string;
  packageName: string;
  tier: string;
  date: string;
  status: "booked" | "reserved";
};

export type BookedVendorsListProps = {
  vendors: BookedVendorItem[];
};

export default function BookedVendorsList({ vendors }: BookedVendorsListProps) {
  return (
    <div className="flex w-full max-w-[760px] flex-col gap-3 rounded-[24px] border border-[#E4E4E7] bg-white p-6">
      <h2 className="font-figtree text-[16px] font-bold leading-[24px] tracking-[-0.24px] text-[#030303]">
        Your vendors
      </h2>

      {vendors.map((vendor, i) => (
        <div
          key={i}
          className="flex w-full max-w-[710px] flex-col gap-2 rounded-[16px] border border-[#E4E4E7] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
                {vendor.vendorName}
              </p>
              <p className="font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
                {vendor.packageName} &middot; {vendor.tier} &middot; {vendor.date}
              </p>
            </div>

            {vendor.status === "booked" ? (
              <span className="flex h-7 w-[76px] shrink-0 items-center justify-center gap-1 rounded-full bg-[#FDEEF0] pt-1 pr-2.5 pb-1 pl-2.5 font-figtree text-[12px] font-medium leading-[18px] text-[#EA1D3B]">
                Booked &#10003;
              </span>
            ) : (
              <span className="flex h-7 shrink-0 items-center justify-center rounded-full border border-[#E4E4E7] px-3 font-figtree text-[12px] font-medium leading-[18px] text-[#030303]">
                Reserved
              </span>
            )}
          </div>

          {vendor.status === "booked" ? (
            <p className="font-figtree text-[12px] font-normal leading-[18px] text-[#008236]">
              Your date is locked.
            </p>
          ) : (
            <p className="font-figtree text-[12px] font-normal leading-[18px] text-[#3F3F47]">
              The vendor will confirm within 4 hours. We&apos;ll message you the
              moment they do.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
