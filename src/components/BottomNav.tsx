'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import CreateServiceModal from './CreateServiceModal';

interface NavItem {
    name: string;
    href?: string;
    iconUrl: string;
    isAction?: boolean;
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/dashboard', iconUrl: 'https://dkuacgndftndz.cloudfront.net/inventory-page/home_iconhome.svg' },
    { name: 'Calendar', href: '/dashboard/calendar', iconUrl: 'https://dkuacgndftndz.cloudfront.net/inventory-page/calendericonhome.svg' },
    { name: 'Inventory', href: '/dashboard/inventory', iconUrl: 'https://dkuacgndftndz.cloudfront.net/inventory-page/inventoryiconhome.svg' },
    { name: 'Bookings', href: '/dashboard/bookings', iconUrl: 'https://dkuacgndftndz.cloudfront.net/inventory-page/bookingsiconhome.svg' },
    { name: 'Menu', href: '/dashboard/menu', iconUrl: 'https://dkuacgndftndz.cloudfront.net/inventory-page/menuiconhome.svg' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Hide BottomNav on document verification pages and setup profile to prevent UI overlap
    if (pathname.includes('/documents') || pathname.includes('/setup-profile')) return null;

    return (
        <>
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-[#27272A] px-2 py-2 flex justify-around items-center z-50 pb-safe transition-colors duration-300">
                {navItems.map((item) => {
                    const isActive = !item.isAction && pathname === item.href;

                    if (item.isAction) {
                        return (
                            <div
                                key={item.name}
                                onClick={() => setIsCreateModalOpen(true)}
                                onTouchStart={() => setIsCreateModalOpen(true)}
                                className="flex flex-col items-center gap-1 transition-colors relative cursor-pointer"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                <img 
                                    src={item.iconUrl}
                                    alt={item.name}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        objectFit: 'contain'
                                    }}
                                />
                                <span className="text-[11px] font-medium leading-none text-[#3F3F47] dark:text-[#A1A1AA] font-figtree transition-colors">
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
                            <img 
                                src={item.iconUrl}
                                alt={item.name}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    objectFit: 'contain',
                                    filter: isActive 
                                        ? 'brightness(0) invert(53%) sepia(55%) saturate(3731%) hue-rotate(324deg) brightness(96%) contrast(93%)' 
                                        : 'none'
                                }}
                            />
                            <span className={`text-[11px] font-medium leading-none font-figtree transition-colors ${isActive ? 'text-[#F0596F] dark:text-[#E95A6E]' : 'text-[#3F3F47] dark:text-[#A1A1AA]'}`}>
                                {item.name}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="absolute -top-2 left-0 right-0 h-0.5 bg-[#F0596F] dark:bg-[#E95A6E] rounded-full"
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
