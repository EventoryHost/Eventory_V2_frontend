import Link from 'next/link';

interface ActionCardProps {
    title: string;
    isActive?: boolean;
    href?: string;
}

export default function ActionCard({ title, isActive = false, href }: ActionCardProps) {
    const Component = href ? Link : 'div';

    return (
        <Component
            href={href as any}
            className={`relative p-4 rounded-[2.5rem] border-2 transition-all cursor-pointer aspect-square flex flex-col justify-end bg-white overflow-hidden
      ${isActive ? 'border-sky-400/80 ring-4 ring-sky-50' : 'border-gray-100 hover:border-gray-200'}
    `}>
            {/* Decorative Rings (Figma Match) */}
            {isActive && (
                <>
                    {/* Outer Ring */}
                    <div className="absolute top-[-66px] right-[-72px] w-[168px] h-[168px] rounded-full bg-[#D4D4D8] pointer-events-none" />
                    {/* Middle Ring */}
                    <div className="absolute top-[-38px] right-[-44px] w-[112px] h-[112px] rounded-full bg-[#E4E4E7] pointer-events-none" />
                    {/* Inner Circle */}
                    <div className="absolute top-[-10px] right-[-16px] w-[56px] h-[56px] rounded-full bg-[#F4F4F5] pointer-events-none" />
                </>
            )}

            <h3 className="font-semibold text-[15px] leading-tight text-[#282934] max-w-[90%] mb-2">
                {title}
            </h3>
        </Component>
    );
}
