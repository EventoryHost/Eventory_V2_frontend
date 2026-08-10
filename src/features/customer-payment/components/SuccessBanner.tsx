import { Check } from "lucide-react";

export type SuccessBannerProps = {
  phone: string;
  email: string;
};

export default function SuccessBanner({ phone, email }: SuccessBannerProps) {
  return (
    <div
      className="flex w-full max-w-[760px] flex-col gap-1.5 rounded-[24px] border p-6"
      style={{ background: "#00823612", borderColor: "#0082364D" }}
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#008236]/40 bg-[#008236]/10">
        <Check size={18} className="text-[#008236]" />
      </span>

      <h1 className="font-figtree text-[28px] font-bold leading-[36px] tracking-[-0.42px] text-[#030303]">
        You&apos;re all set.
      </h1>

      <p className="font-figtree text-[14px] font-normal leading-[20px] text-[#3F3F47]">
        A summary is on its way to {phone} and {email}.
      </p>
    </div>
  );
}
