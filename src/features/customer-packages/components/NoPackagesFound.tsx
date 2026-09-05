import Image from "next/image";

// Only these 5 categories have a dedicated "coming soon" illustration —
// Decorator isn't included in that asset drop, so it renders the text +
// CTA without an image rather than guessing at a filename that isn't there.
//
// width/height are each file's real pixel dimensions (not the spec's
// 500x414 box) — the shipped PNGs are a mix of portrait and landscape, so
// a single fixed aspect ratio would stretch most of them. Capping at
// max-w-[500px] with h-auto below preserves each one's real proportions.
const CATEGORY_EMPTY_STATE_IMAGE: Record<
  string,
  { src: string; width: number; height: number }
> = {
  caterer: { src: "/images/notfound/caterer.png", width: 1086, height: 1448 },
  "dj-artist": { src: "/images/notfound/dj.png", width: 1122, height: 1402 },
  "makeup-artist": {
    src: "/images/notfound/makeup.png",
    width: 1086,
    height: 1448,
  },
  "venue-provider": {
    src: "/images/notfound/venue.png",
    width: 1470,
    height: 1070,
  },
  photographer: {
    src: "/images/notfound/photo.png",
    width: 1086,
    height: 1448,
  },
};

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
      <path d="M12.05 2c-5.523 0-10 4.477-10 10 0 1.76.457 3.464 1.323 4.965L2 22l5.16-1.354A9.96 9.96 0 0 0 12.05 22c5.523 0 10-4.477 10-10s-4.477-10-10-10Zm0 18.2c-1.6 0-3.166-.43-4.535-1.243l-.325-.194-3.06.803.817-2.983-.212-.306A8.19 8.19 0 0 1 3.85 12c0-4.528 3.673-8.2 8.2-8.2s8.2 3.672 8.2 8.2-3.672 8.2-8.2 8.2Z" />
    </svg>
  );
}

export default function NoPackagesFound({
  categoryId,
  categoryLabel,
}: {
  categoryId: string;
  categoryLabel: string;
}) {
  const image = CATEGORY_EMPTY_STATE_IMAGE[categoryId];
  const whatsappText = `Hi, I'm interested in booking ${categoryLabel} services on Eventory.`;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[10px] px-4 py-10 text-center">
      {image && (
        <Image
          src={image.src}
          alt=""
          aria-hidden="true"
          width={image.width}
          height={image.height}
          className="h-auto w-full max-w-[500px]"
        />
      )}

      <h2 className="font-figtree text-[28px] leading-[36px] font-semibold text-[#030303]">
        {categoryLabel} packages are coming soon!
      </h2>
      <p className="max-w-[440px] font-figtree text-[14px] leading-[20px] text-[#3F3F47]">
        Online packages are arriving shortly. To book now, chat with our team on
        WhatsApp for custom options and pricing.
      </p>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex w-[278px] items-center justify-center gap-2.5 rounded-full bg-[#00AB82] py-4 pr-9 pl-8 font-figtree text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        <WhatsAppIcon />
        Book Through Whatsapp
      </a>
    </div>
  );
}
