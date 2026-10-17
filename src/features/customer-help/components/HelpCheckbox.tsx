import type { ReactNode } from "react";

type HelpCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
};

export default function HelpCheckbox({
  checked,
  onChange,
  children,
}: HelpCheckboxProps) {
  return (
    <label className="flex w-full cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          checked
            ? "/images/customer/help/checkbox-checked.svg"
            : "/images/customer/help/checkbox.svg"
        }
        alt=""
        width={20}
        height={20}
        className="block shrink-0 rounded-[4px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#030303]"
      />
      <span className="flex-1 font-figtree text-[11px] font-normal leading-[16px] text-[#3f3f47]">
        {children}
      </span>
    </label>
  );
}
