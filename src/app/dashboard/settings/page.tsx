'use client';
import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';
import Link from 'next/link';
import { 
    /* Key, -- Commented out: Change Password feature disabled (OTP-only login, no sign-up) */
    Bell, Mail, Globe, Moon, FileText, BookOpen, Trash2, ChevronRight, ChevronDown, X 
} from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [bookingAlerts, setBookingAlerts] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (darkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }

            // Sync with backend
            const vendorId = localStorage.getItem('vendor_id');
            if (vendorId) {
                fetch(apiUrl(`/vendors/${vendorId}`), {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isDarkMode: darkMode })
                }).catch(err => console.error("Failed to sync dark mode preference", err));
            }
        }
    }, [darkMode]);


    const handleDeactivate = async () => {
        const confirmed = window.confirm("Are you sure you want to deactivate your account? This action cannot be undone.");
        if (!confirmed) return;

        try {
            // Get vendorId from storage or use a placeholder if none exists
            const vendorId = localStorage.getItem("vendor_id") || "placeholder_id";
            
            
            const res = await fetch(apiUrl(`/vendors/${vendorId}`), {
                method: 'DELETE',
            });
            
            if (res.ok) {
                alert("Account deactivated successfully.");
                localStorage.removeItem("vendor_id");
                router.push("/login"); // or wherever the logged-out state starts
            } else {
                // If API returns an error
                alert("Failed to deactivate account. Please ensure your backend is running.");
            }
        } catch (error) {
            console.error("Error deactivating account:", error);
            alert("An error occurred while deactivating account.");
        }
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <h3 style={{ fontFamily: 'Figtree, sans-serif', letterSpacing: '0px', lineHeight: '18px' }} className="text-[12px] font-normal text-[#9F9FA9] uppercase mb-3.5 pl-1">
            {title}
        </h3>
    );

    const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
        <div 
            onClick={onChange}
            className={`w-[46px] h-[26px] rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out flex items-center ${enabled ? 'bg-[#030303] dark:bg-[#E95A6E]' : 'bg-[#9F9FA9] dark:bg-[#52525B]'}`}
        >
            <div className={`w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
        </div>
    );

    const SettingsItem = ({ icon: Icon, label, rightElement, onClick, href }: any) => {
        const content = (
            <div className="flex items-center justify-between py-[18px] px-5 bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3.5">
                    <Icon className="w-[20px] h-[20px] text-[#3F3F47] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-medium text-[#030303] dark:text-[#FAFAFA]">{label}</span>
                </div>
                {rightElement || <ChevronRight className="w-[18px] h-[18px] text-[#A1A1AA]" strokeWidth={2} />}
            </div>
        );

        if (href) {
            return <Link href={href}>{content}</Link>;
        }
        return <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>{content}</div>;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 pt-8 px-5 transition-colors duration-300">
            <div className="flex justify-between items-center mb-8 px-1">
                <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white transition-colors">Settings</h1>
                <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            {/* Account Section — Commented out: Change Password disabled.
                 Sign-up is not available; only OTP-based login is active.
                 Re-enable when password-based auth is introduced.
            <div className="mb-7">
                <SectionHeader title="Account" />
                <SettingsItem icon={Key} label="Change Password" href="/dashboard/settings/change-password" />
            </div>
            */}

            {/* Notifications Section */}
            <div className="mb-7">
                <SectionHeader title="Notifications" />
                <SettingsItem 
                    icon={Bell} 
                    label="Booking Alerts" 
                    rightElement={<Toggle enabled={bookingAlerts} onChange={() => setBookingAlerts(!bookingAlerts)} />} 
                />
                <SettingsItem 
                    icon={Mail} 
                    label="Marketing Emails" 
                    rightElement={<Toggle enabled={marketingEmails} onChange={() => setMarketingEmails(!marketingEmails)} />} 
                />
            </div>

            {/* Preferences Section */}
            <div className="mb-7">
                <SectionHeader title="Preferences" />
                <SettingsItem 
                    icon={Globe} 
                    label="Language" 
                    rightElement={<ChevronDown className="w-[18px] h-[18px] text-[#A1A1AA]" strokeWidth={2} />} 
                />
                <SettingsItem 
                    icon={Moon} 
                    label="Dark Mode" 
                    rightElement={<Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />} 
                />
            </div>

            {/* Resources Section */}
            <div className="mb-10">
                <SectionHeader title="Resources" />
                <SettingsItem icon={FileText} label="Privacy Policy" href="/dashboard/privacy" />
                <SettingsItem icon={BookOpen} label="Terms of Service" href="/dashboard/terms" />
            </div>

            {/* Deactivate Account */}
            <div className="flex flex-col items-center justify-center mb-6">
                <button 
                    onClick={handleDeactivate}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    className="flex flex-col items-center gap-2.5 text-[#CC2B2B] dark:text-[#F87171] font-bold text-[14px] px-6 py-3 active:scale-95 transition-transform"
                >
                    <Trash2 className="w-[22px] h-[22px]" strokeWidth={2} />
                    Deactivate Account
                </button>
                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#A1A1AA] tracking-[0.15em] uppercase mt-4">
                    App Version 2.4.0
                </span>
            </div>
        </div>
    );
}
