import Image from "next/image";
import Link from "next/link";

export default function AuthLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const imageSize = size === "sm" ? 24 : 28;
  const textSize = size === "sm" ? "text-[20px]" : "text-[24px]";

  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <Image src="/images/customer/ev-logo.png" alt="Eventory" width={imageSize} height={imageSize} />
      <span
        className={`text-brand-primary font-semibold ${textSize} leading-[20px] tracking-[-0.03em]`}
        style={{ fontFamily: "var(--font-lora)" }}
      >
        Eventory
      </span>
    </Link>
  );
}
