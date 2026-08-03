"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Headphones } from "lucide-react";

export type SendInquirySectionProps = {
  onSend?: (message: string, notifyOnWhatsApp: boolean) => void;
  onContactSupport?: () => void;
};

export default function SendInquirySection({
  onSend,
  onContactSupport,
}: SendInquirySectionProps) {
  const [message, setMessage] = useState("");
  const [notifyOnWhatsApp, setNotifyOnWhatsApp] = useState(true);
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="font-figtree text-[15px] font-normal text-[#101828]">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say hello and ask a question about styling..."
          className="h-24 w-full resize-none rounded-[8px] bg-[#F4F4F5] px-4 py-3 font-figtree text-[15px] font-normal text-[#101828] placeholder:text-[#9CA3AF] outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-figtree text-[16px] font-normal text-[#101828]">
          Notify me on WhatsApp
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={notifyOnWhatsApp}
          onClick={() => setNotifyOnWhatsApp((v) => !v)}
          className={`flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
            notifyOnWhatsApp ? "bg-[#22C55E]" : "bg-[#D1D5DB]"
          }`}
        >
          <span
            className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
              notifyOnWhatsApp ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => {
            onSend?.(message, notifyOnWhatsApp);
            router.push("/contact");
          }}
          style={{ fontFamily: "var(--font-inter)" }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#F0596F] text-[14px] font-bold leading-[20px] tracking-[0.14px] text-white shadow-md transition-colors hover:bg-[#E43F58]"
        >
          Send Inquiry to Vendor
          <Send size={16} />
        </button>

        <button
          type="button"
          onClick={onContactSupport}
          style={{ fontFamily: "var(--font-inter)" }}
          className="flex items-center gap-2 text-[14px] font-bold leading-[20px] tracking-[0.14px] text-[#0448FF] transition-colors hover:text-[#0336CC]"
        >
          <Headphones size={16} />
          Contact EMS Support
        </button>

        <p
          style={{ fontFamily: "var(--font-inter)" }}
          className="text-center text-[12px] font-normal leading-[16px] tracking-[0px] text-[#444748]"
        >
          By proceeding, you agree to Eventory&apos;s{" "}
          <a href="#" className="underline">
            Terms of Service
          </a>{" "}
          and Vendor&apos;s cancellation policy.
        </p>
      </div>
    </div>
  );
}
