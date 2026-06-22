'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EventoryLogo from '@/components/icons/EventoryLogo';
import { 
    Bell, SquarePen, Wallet, CalendarDays, MessageSquare, 
    Users, FileText, Landmark, Settings, Star, 
    HelpCircle, Video, Headset, LogOut, ChevronRight, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MenuPage() {
    const router = useRouter();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState({
        name: "",
        phone: "",
        email: "",
        profilePicture: ""
    });

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                const res = await fetch(`${baseUrl}/vendors/${vendorId}`);
                if (res.ok) {
                    const responseJson = await res.json();
                    const data = responseJson.data || responseJson;
                    setUser({
                        name: data.businessName || data.pocName || "",
                        phone: data.phone || "",
                        email: data.email || "",
                        profilePicture: data.profilePicture || ""
                    });
                } else {
                    setUser({
                        name: "",
                        phone: "",
                        email: "",
                        profilePicture: ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch vendor", error);
                setUser({
                    name: "",
                    phone: "",
                    email: "",
                    profilePicture: ""
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendor();
    }, []);

    const handleLogout = () => {
        // Implement logout logic here
        localStorage.removeItem('vendor_id');
        localStorage.removeItem('vendor_token');
        setIsLogoutModalOpen(false);
        router.push('/login'); // Or wherever it should go
    };

    const MenuItem = ({ icon: Icon, label, onClick, href }: any) => {
        const content = (
            <div className="flex items-center justify-between py-[18px] px-5 bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3.5">
                    <Icon className="w-[20px] h-[20px] text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-medium text-[#030303] dark:text-[#FAFAFA]">{label}</span>
                </div>
                <ChevronRight className="w-[18px] h-[18px] text-[#A1A1AA]" strokeWidth={2} />
            </div>
        );

        if (href) {
            return <Link href={href}>{content}</Link>;
        }
        return <div onClick={onClick} className="cursor-pointer">{content}</div>;
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <h3 style={{ fontFamily: 'Figtree, sans-serif', letterSpacing: '0px', lineHeight: '18px' }} className="text-[12px] font-normal text-[#9F9FA9] uppercase mb-3.5 pl-1">
            {title}
        </h3>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 pt-4 px-5 transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="w-[38px] h-[38px] bg-[#E95A6E] rounded-[12px] flex items-center justify-center shadow-sm">
                    <img 
                        src="https://dkuacgndftndz.cloudfront.net/inventory-page/clearLogoeventoryV2.svg" 
                        alt="Eventory Logo" 
                        className="w-[24px] h-[24px] object-contain"
                    />
                </div>
                <button className="p-2 -mr-2 text-[#030303] dark:text-white active:scale-95 transition-transform">
                    <Bell className="w-[22px] h-[22px]" strokeWidth={1.5} />
                </button>
            </div>

            {/* Profile Section */}
            {isLoading ? (
                <div className="flex items-center gap-4 mb-10 px-1 animate-pulse">
                    <div className="w-[72px] h-[72px] min-w-[72px] shrink-0 rounded-full bg-[#E4E4E7] dark:bg-[#27272A]" />
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="h-6 w-32 bg-[#E4E4E7] dark:bg-[#27272A] rounded-[8px]" />
                        <div className="h-4 w-48 bg-[#E4E4E7] dark:bg-[#27272A] rounded-[8px]" />
                        <div className="h-4 w-24 bg-[#E4E4E7] dark:bg-[#27272A] rounded-[8px]" />
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-4 mb-10 px-1">
                    <div className="w-[72px] h-[72px] min-w-[72px] shrink-0 rounded-full bg-[#18181B] dark:bg-[#27272A] flex items-center justify-center text-white overflow-hidden shadow-sm">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <User className="w-8 h-8 opacity-90" strokeWidth={1.5} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[22px] font-bold text-[#030303] dark:text-white mb-0.5">{user.name || "Vendor Partner"}</h2>
                        {(user.phone || user.email) && (
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA] font-medium mb-1.5">
                                {user.phone} 
                                {user.phone && user.email && <span className="mx-1.5 text-[#D4D4D8] dark:text-[#52525B]">|</span>} 
                                {user.email}
                            </p>
                        )}
                        <Link href="/dashboard/profile" className="flex items-center gap-1.5 text-[13px] font-bold text-[#030303] dark:text-white hover:opacity-80 transition-opacity">
                            View Profile <SquarePen className="w-[14px] h-[14px]" strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Management Section */}
            <div className="mb-7">
                <SectionHeader title="Management" />
                <MenuItem icon={Wallet} label="Earnings" href="/dashboard/earnings" />
                <MenuItem icon={CalendarDays} label="Bookings" href="/dashboard/bookings" />
                <MenuItem icon={MessageSquare} label="Enquiries" href="/dashboard/enquiry" />
            </div>

            {/* Business Management Section */}
            <div className="mb-7">
                <SectionHeader title="Business Management" />
                <MenuItem icon={Users} label="Business Profile" href="/dashboard/business-profile" />
                <MenuItem icon={FileText} label="Personal Documents" href="/dashboard/personal-documents" />
                <MenuItem icon={Landmark} label="Bank accounts" href="/dashboard/bank-accounts" />
                <MenuItem icon={FileText} label="Business Documents" href="/dashboard/business-documents" />
            </div>

            {/* Support Section */}
            <div className="mb-10">
                <SectionHeader title="Support" />
                <MenuItem icon={Settings} label="Settings" href="/dashboard/settings" />
                <MenuItem icon={Star} label="Your Ratings" href="/dashboard/ratings" />
                <MenuItem icon={HelpCircle} label="Frequently asked questions" href="/dashboard/faq" />
                <MenuItem icon={Video} label="Video guide help" href="/dashboard/video-guide" />
                <MenuItem icon={Headset} label="Help & Support" href="/dashboard/support" />
            </div>

            {/* Logout Button */}
            <div className="flex flex-col items-center justify-center mb-6">
                <button 
                    onClick={() => setIsLogoutModalOpen(true)}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className="flex items-center gap-2.5 text-[#CC2B2B] dark:text-[#F87171] font-bold text-[15px] px-6 py-3 active:scale-95 transition-transform"
                >
                    <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    Logout
                </button>
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#A1A1AA] tracking-[0.15em] uppercase mt-6">
                    App Version 2.4.0
                </span>
            </div>

            {/* Logout Modal Overlay */}
            <AnimatePresence>
                {isLogoutModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
                        onClick={() => setIsLogoutModalOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#1E1E1B] w-full max-w-[340px] rounded-[28px] p-7 flex flex-col items-center text-center shadow-2xl"
                        >
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest mb-4">Action Required</span>
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white mb-2.5 leading-tight">Log out of your account?</h3>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B] dark:text-[#A1A1AA] mb-8 leading-relaxed font-medium">Are you sure you want to log out from your account?</p>
                            
                            <div className="w-full flex flex-col gap-3.5">
                                <button 
                                    onClick={handleLogout}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full py-4 bg-[#CC2B2B] hover:bg-[#B32424] active:scale-[0.98] text-white font-bold rounded-[16px] text-[15px] transition-all"
                                >
                                    Log Out
                                </button>
                                <button 
                                    onClick={() => setIsLogoutModalOpen(false)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="w-full py-4 bg-transparent text-[#030303] dark:text-white active:scale-[0.98] font-bold rounded-[16px] text-[15px] transition-all hover:bg-gray-50 dark:hover:bg-[#27272A]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
