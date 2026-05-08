export default function TutorialCard() {
    return (
        <div className="mt-4 p-5 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm relative overflow-hidden">
            {/* Decorative Rings (Figma Match) */}
            {/* Outer Ring */}
            <div className="absolute top-[-66px] right-[-72px] w-[168px] h-[168px] rounded-full bg-[#D4D4D8] pointer-events-none" />
            {/* Middle Ring */}
            <div className="absolute top-[-38px] right-[-44px] w-[112px] h-[112px] rounded-full bg-[#E4E4E7] pointer-events-none" />
            {/* Inner Circle */}
            <div className="absolute top-[-10px] right-[-16px] w-[56px] h-[56px] rounded-full bg-[#F4F4F5] pointer-events-none" />

            <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium mb-3">
                    In 2 mins
                </span>
                <h3 className="text-xl font-semibold text-[#18181B] mb-6 leading-tight">
                    Watch Tutorial<br />to get started
                </h3>

                <button className="w-full py-3.5 bg-[#04222D] text-white rounded-xl font-semibold text-[15px] hover:bg-opacity-90 transition-all active:scale-[0.98] border-t border-[#18181B]">
                    Set up now
                </button>
            </div>
        </div>
    );
}
