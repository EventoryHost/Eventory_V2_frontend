// "Linear / Call / Phone" exports at 21.5×20.5 for an 18px slot (Figma
// inset -4.17% / -9.73%), so the asset keeps its own size and overhangs
// the slot instead of being squashed into it.
const SRC = {
  brand: "/images/customer/help/phone.svg",
  account: "/images/customer/help/account-phone.svg",
  chipSelected: "/images/customer/help/chip-phone-selected.svg",
  chipUnselected: "/images/customer/help/chip-phone-unselected.svg",
} as const;

export default function HelpPhoneIcon({ tone }: { tone: keyof typeof SRC }) {
  return (
    <span className="relative block size-[18px] shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SRC[tone]}
        alt=""
        width={21.5008}
        height={20.5004}
        className="absolute left-[-1.75px] top-[-0.75px] block max-w-none"
      />
    </span>
  );
}
