'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Box, Calendar, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Bookings', href: '/dashboard/bookings', icon: ClipboardList },
    { name: 'Inventory', href: '/dashboard/inventory', icon: Box },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Menu', href: '/dashboard/menu', icon: Menu },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center z-50 pb-safe max-w-md mx-auto">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
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
    );
}
