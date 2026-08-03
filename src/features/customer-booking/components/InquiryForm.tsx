"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const GUEST_OPTIONS = ["10 - 50", "50 - 100", "100 - 250", "250+"];
const REASON_OPTIONS = [
  "General enquiry",
  "Request a quote",
  "Check availability",
  "Customize package",
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-figtree text-[12px] font-medium text-[#3F3F47]">
      {children}
    </label>
  );
}

function TextField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[8px] border border-[#D4D4D8] bg-white px-4 py-[10px] font-figtree text-[14px] text-[#101828] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[#0F172A]"
      />
    </div>
  );
}

function SelectField({
  label,
  placeholder,
  value,
  onChange,
  options,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-11 w-full appearance-none rounded-[8px] border border-[#D4D4D8] bg-white px-4 py-[10px] font-figtree text-[14px] outline-none transition-colors focus:border-[#0F172A] ${
            value ? "text-[#101828]" : "text-[#9CA3AF]"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-[#101828]">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#9CA3AF]"
        />
      </div>
    </div>
  );
}

export default function InquiryForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [dateFlexible, setDateFlexible] = useState(false);
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  return (
    <form className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="First Name"
          placeholder="Anjali"
          value={firstName}
          onChange={setFirstName}
        />
        <TextField
          label="Last Name"
          placeholder="Chowdhary"
          value={lastName}
          onChange={setLastName}
        />
      </div>

      <TextField
        label="Email"
        placeholder="youremial@.com"
        value={email}
        onChange={setEmail}
        type="email"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Event Date"
          placeholder="MM/DD/YY"
          value={eventDate}
          onChange={setEventDate}
        />
        <SelectField
          label="No. of Guests"
          placeholder="10 - 50"
          value={guestCount}
          onChange={setGuestCount}
          options={GUEST_OPTIONS}
        />
      </div>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={dateFlexible}
          onChange={(e) => setDateFlexible(e.target.checked)}
          className="h-4 w-4 rounded-[4px] border border-[#D4D4D8] accent-[#0F172A]"
        />
        <span className="font-figtree text-[14px] font-normal text-[#3F3F47]">
          My Event date is flexible
        </span>
      </label>

      <TextField
        label="Phone Number"
        placeholder="+91 XXXXX XXXXX"
        value={phone}
        onChange={setPhone}
        type="tel"
      />

      <div className="h-px w-full bg-[#E5E5E5]" />

      <SelectField
        label="Reason for inquiry"
        placeholder="Select reason for Inquiry"
        value={reason}
        onChange={setReason}
        options={REASON_OPTIONS}
      />
    </form>
  );
}
