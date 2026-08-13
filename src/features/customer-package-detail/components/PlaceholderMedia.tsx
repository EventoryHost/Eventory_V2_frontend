import { ImageIcon } from "lucide-react";

const LIGHT_GRADIENTS = [
  "from-[#FFE3E8] to-[#FFF6ED]",
  "from-[#FDE9C8] to-[#FFEFEF]",
  "from-[#E7D9FF] to-[#FFE8F0]",
  "from-[#D9F0FF] to-[#FFF3E0]",
];

export default function PlaceholderMedia({
  label,
  seed = 0,
  className = "",
}: {
  label?: string;
  seed?: number;
  className?: string;
}) {
  const gradient = LIGHT_GRADIENTS[seed % LIGHT_GRADIENTS.length];

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${gradient} ${className}`}
    >
      <ImageIcon className="h-6 w-6 text-brand-950/25" strokeWidth={1.5} />
      {label && (
        <span className="line-clamp-2 px-3 text-center font-figtree text-[11px] font-medium leading-tight text-brand-950/35">
          {label}
        </span>
      )}
    </div>
  );
}
