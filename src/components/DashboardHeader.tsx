import { Bell } from 'lucide-react';

export default function DashboardHeader({ name = "Vyom" }: { name?: string }) {
    return (
        <header className="flex justify-between items-start py-6 px-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-semibold text-gray-600 border-2 border-white shadow-sm">
                    {name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Hi, {name}</h2>
                    <p className="text-sm font-semibold text-[#71717B] leading-none mt-1">Have get more packages today</p>
                </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                <Bell size={24} className="text-gray-700" />
            </button>
        </header>
    );
}
