import { ImageIcon } from "lucide-react";

const LIGHT_GRADIENTS = [
  "from-[#FFE3E8] to-[#FFF6ED]",
  "from-[#FDE9C8] to-[#FFEFEF]",
  "from-[#E7D9FF] to-[#FFE8F0]",
  "from-[#D9F0FF] to-[#FFF3E0]",
];

const DARK_GRADIENTS = [
  "from-[#3A0A14] to-[#1E0306]",
  "from-[#4A1620] to-[#1E0306]",
];

export default function PlaceholderMedia({
  label,
  seed = 0,
  tone = "light",
  className = "",
}: {
  label?: string;
  seed?: number;
  tone?: "light" | "dark";
  className?: string;
}) {
  const palette = tone === "dark" ? DARK_GRADIENTS : LIGHT_GRADIENTS;
  const gradient = palette[seed % palette.length];
  const iconColor = tone === "dark" ? "text-white/25" : "text-brand-950/25";
  const textColor = tone === "dark" ? "text-white/40" : "text-brand-950/35";

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${gradient} ${className}`}
    >
      <ImageIcon className={`h-6 w-6 ${iconColor}`} strokeWidth={1.5} />
      {label && (
        <span className={`px-3 text-center font-figtree text-[11px] font-medium leading-tight line-clamp-2 ${textColor}`}>
          {label}
        </span>
      )}
    </div>
  );
}
