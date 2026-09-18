import Image from "next/image";

/**
 * The illustrated empty state used by Saved Address (node 1414:6404) and
 * Bookings (node 1543:11332) — same card, illustration slot and type scale
 * in both, so it lives here rather than being rebuilt per page.
 */
export default function AccountEmptyCard({
  image,
  imageHeight,
  title,
  description,
  action,
}: {
  image: string;
  /** Illustrations are a fixed 112px wide; only the height differs per art. */
  imageHeight: number;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E4E4E7] bg-white p-[19px]">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-[39px]">
        <Image
          src={image}
          alt=""
          width={112}
          height={imageHeight}
          style={{ height: imageHeight }}
          className="w-[112px] shrink-0 object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
          <div className="flex flex-col justify-center gap-1">
            <h2 className="text-[16px] font-semibold leading-6 text-[#030303]">{title}</h2>
            <p className="text-[14px] font-medium leading-5 text-[#9F9FA9]">{description}</p>
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
