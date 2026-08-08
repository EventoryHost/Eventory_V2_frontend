export type AllPoliciesContentProps = {
  cancellationRows: { label: string; value: string }[];
  lastMinuteChanges: string;
  refundAndPayment: string;
  vendorPolicy: string;
};

function PolicyHeading({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-figtree text-[14px] font-semibold leading-[20px] text-[#030303]">
      {children}
    </span>
  );
}

function PolicyParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-figtree text-[14px] font-normal leading-[22.75px] text-[#3F3F47]">
      {children}
    </p>
  );
}

export default function AllPoliciesContent({
  cancellationRows,
  lastMinuteChanges,
  refundAndPayment,
  vendorPolicy,
}: AllPoliciesContentProps) {
  return (
    <div className="flex w-full max-w-[586px] flex-col gap-6">
      <div className="flex flex-col gap-3">
        <PolicyHeading>Cancellation</PolicyHeading>
        {cancellationRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="font-figtree text-[14px] font-normal leading-[22.75px] text-[#3F3F47]">
              {row.label}
            </span>
            <span className="font-figtree text-[14px] font-normal leading-[22.75px] text-[#3F3F47]">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <PolicyHeading>Last-minute changes</PolicyHeading>
        <PolicyParagraph>{lastMinuteChanges}</PolicyParagraph>
      </div>

      <div className="flex flex-col gap-2">
        <PolicyHeading>Refund &amp; payment</PolicyHeading>
        <PolicyParagraph>{refundAndPayment}</PolicyParagraph>
      </div>

      <div className="flex flex-col gap-2">
        <PolicyHeading>Vendor policy</PolicyHeading>
        <PolicyParagraph>{vendorPolicy}</PolicyParagraph>
      </div>
    </div>
  );
}
