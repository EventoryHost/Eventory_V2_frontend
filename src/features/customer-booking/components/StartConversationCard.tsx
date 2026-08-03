import Image from "next/image";
import { Clock } from "lucide-react";

export type StartConversationCardProps = {
  avatar: string;
  managerName: string;
  managerRole: string;
  responseTime: string;
  children?: React.ReactNode;
};

export default function StartConversationCard({
  avatar,
  managerName,
  managerRole,
  responseTime,
  children,
}: StartConversationCardProps) {
  return (
    <div className="flex w-full max-w-[424px] flex-col gap-6 rounded-[12px] border border-[#E5E5E5] p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-figtree text-[18px] font-semibold leading-[1.3] text-[#131414]">
          Start the conversation
        </h2>
        <p className="font-figtree text-[12px] font-normal text-body-secondary">
          Use this secure form to reach out and share your wedding vision.
        </p>
      </div>

      <div className="flex w-full max-w-[376px] items-center gap-4 rounded-[12px] border border-[#FFEBCC] bg-[#FFFBF5] p-4">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
          <Image src={avatar} alt={managerName} fill className="object-cover" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p
            style={{ fontFamily: "var(--font-inter)" }}
            className="text-[16px] font-bold leading-[24px] tracking-[0px] text-[#131414]"
          >
            {managerName}
          </p>
          <p
            style={{ fontFamily: "var(--font-inter)" }}
            className="text-[12px] font-normal leading-[16px] tracking-[0px] text-body-secondary"
          >
            {managerRole}
          </p>

          <span className="mt-1 flex w-fit items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 py-1">
            <Clock size={12} className="text-[#008000]" />
            <span
              style={{ fontFamily: "var(--font-inter)" }}
              className="text-[10px] font-bold leading-[15px] tracking-[0px] text-[#008000]"
            >
              {responseTime}
            </span>
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
