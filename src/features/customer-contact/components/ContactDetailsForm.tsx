"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

export default function ContactDetailsForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="flex w-full max-w-[801px] flex-col gap-5 rounded-[24px] border border-[#E4E4E7] bg-white p-6">
      <div className="flex flex-col gap-1">
        <label className="font-figtree text-[15px] font-semibold text-[#030303]">
          Full name
        </label>
        <p className="font-figtree text-[13px] font-normal leading-[18px] text-[#71717B]">
          So your vendors know who they&apos;re serving.
        </p>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Ananya Sharma"
          className="mt-2 h-12 w-full rounded-[16px] border border-[#E4E4E7] pt-[13.5px] pr-[14px] pb-[13.5px] pl-[14px] font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-figtree text-[15px] font-semibold text-[#030303]">
          Phone number
        </label>
        <p className="font-figtree text-[13px] font-normal leading-[18px] text-[#71717B]">
          Your vendor&apos;s team will call this on event day.
        </p>

        <div className="mt-2 flex gap-2">
          <div className="flex h-12 w-[72px] shrink-0 items-center justify-center gap-1 rounded-[16px] border border-[#E4E4E7] bg-[#F4F4F5] pt-[11px] pr-3 pb-[11px] pl-3">
            <span>🇮🇳</span>
            <span className="font-figtree text-[14px] font-medium text-[#030303]">
              +91
            </span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            className="h-12 w-full rounded-[16px] border border-[#E4E4E7] bg-white pt-[13.5px] pr-[14px] pb-[13.5px] pl-[14px] font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
          />
        </div>

        <button
          type="button"
          disabled={!phone}
          className="mt-2 flex h-[34px] w-fit items-center gap-1 rounded-full border border-[#EA1D3B] bg-[#030303]/0 pt-[7px] pr-5 pb-[7px] pl-4 font-figtree text-[13px] font-medium text-[#EA1D3B] opacity-40 transition-opacity enabled:opacity-100"
        >
          <Phone size={14} />
          Verify with OTP
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-1.5 font-figtree text-[15px] font-semibold text-[#030303]">
          Email
          <span className="font-figtree text-[12px] font-normal text-[#9CA3AF]">
            optional
          </span>
        </label>
        <p className="font-figtree text-[13px] font-normal leading-[18px] text-[#71717B]">
          For your booking confirmation and receipt.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="mt-2 h-12 w-full rounded-[16px] border border-[#E4E4E7] pt-[13.5px] pr-[14px] pb-[13.5px] pl-[14px] font-figtree text-[15px] text-[#030303] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
        />
      </div>
    </div>
  );
}
