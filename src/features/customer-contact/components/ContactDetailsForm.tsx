"use client";

import { useState } from "react";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-figtree text-[12px] font-medium text-[#3F3F47]">
      {children}
    </label>
  );
}

export default function ContactDetailsForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    setOtpSent(true);
  };

  return (
    <div className="flex w-full max-w-[868px] flex-col gap-6 rounded-[12px] border border-[#E5E5E5] pt-8 pr-6 pb-8 pl-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        <div className="flex w-full flex-col gap-1.5">
          <FieldLabel>Full Name</FieldLabel>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Name"
            className="h-12 w-full rounded-[8px] border border-[#D4D4D8] px-4 py-3 font-figtree text-[15px] text-[#101828] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
          />
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <FieldLabel>Email Address</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-12 w-full rounded-[8px] border border-[#D4D4D8] px-4 py-3 font-figtree text-[15px] text-[#101828] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
          />
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <FieldLabel>Mobile Number</FieldLabel>
          <div className="flex h-12 w-full items-center justify-between rounded-[8px] border border-[#D4D4D8] px-4 py-3">
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full bg-transparent font-figtree text-[15px] text-[#101828] placeholder:text-[#9CA3AF] outline-none"
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={otpSent}
              className="shrink-0 font-figtree text-[15px] font-medium text-[#D97706] transition-colors hover:text-[#B45309] disabled:cursor-default disabled:text-[#9CA3AF]"
            >
              {otpSent ? "OTP Sent" : "Send OTP"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <FieldLabel>Any Message</FieldLabel>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g., Stage near entrance, food allergy instructions, DJ playlist preferences..."
          className="h-24 w-full resize-none rounded-[8px] border border-[#D4D4D8] px-4 py-3 font-figtree text-[15px] text-[#101828] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
        />
      </div>
    </div>
  );
}
