'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Box, Calendar, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import CreateServiceModal from './CreateServiceModal';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Bookings', href: '/dashboard/bookings', icon: ClipboardList },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Box },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Menu', icon: Menu, isAction: true },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Hide BottomNav on document verification pages to prevent UI overlap
    if (pathname.includes('/documents')) return null;

    return (
        <>
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center z-50 pb-safe">
                {navItems.map((item) => {
                    const isActive = !item.isAction && pathname === item.href;
                    const Icon = item.icon;

                    if (item.isAction) {
                        return (
                            <div
                                key={item.name}
                                onClick={() => setIsCreateModalOpen(true)}
                                onTouchStart={() => setIsCreateModalOpen(true)}
                                className="flex flex-col items-center gap-1 transition-colors relative cursor-pointer"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                <div className="p-1 rounded-lg text-[#3F3F47]">
                                    <Icon size={24} strokeWidth={2} />
                                </div>
                                <span className="text-[11px] font-medium leading-none text-[#3F3F47]">
                                    {item.name}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href!}
                            className="flex flex-col items-center gap-1 transition-colors relative"
                        >
                            <div className={`p-1 rounded-lg ${isActive ? 'text-[#F0596F]' : 'text-[#3F3F47]'}`}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[11px] font-medium leading-none ${isActive ? 'text-[#F0596F]' : 'text-[#3F3F47]'}`}>
                                {item.name}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -top-2 left-0 right-0 h-0.5 bg-[#F0596F] rounded-full"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {isCreateModalOpen && (
                <CreateServiceModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}
        </>
    );
}
