import Image from "next/image";

/**
 * Full-bleed 240px cover strip behind the page header. Falls back to a
 * brand wash rather than a stand-in photo — a stock image here would read
 * as this vendor's own work.
 */
export default function VendorCoverBanner({
  coverImage,
  name,
}: {
  coverImage?: string;
  name: string;
}) {
  return (
    <div className="relative h-[240px] w-full overflow-hidden bg-gradient-to-br from-[#fdeef0] to-[#ffe5e9]">
      {coverImage && (
        <Image
          src={coverImage}
          alt={`${name} cover`}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      )}
    </div>
  );
}
