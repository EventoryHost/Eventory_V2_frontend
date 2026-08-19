'use client';
import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api';
import Link from 'next/link';
import { 
    Bell, Moon, FileText, ChevronRight, X, 
    AlertTriangle, Trash2, Hourglass, LogOut, Headphones, ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [bookingAlerts, setBookingAlerts] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
        }
        return false;
    });

    const [viewState, setViewState] = useState<'loading' | 'settings' | 'confirm_delete' | 'pending_deletion'>('loading');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id');
                if (!vendorId) {
                    router.push('/login');
                    return;
                }
                const res = await fetch(apiUrl(`/vendors/${vendorId}`));
                const data = await res.json();
                if (data.success && data.data) {
                    if (data.data.deletionRequestedAt) {
                        setViewState('pending_deletion');
                    } else {
                        setViewState('settings');
                    }
                } else {
                    setViewState('settings');
                }
            } catch (err) {
                console.error("Failed to fetch vendor", err);
                setViewState('settings');
            }
        };
        fetchVendor();
    }, [router]);

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
            if (vendorId && viewState !== 'loading') {
                fetch(apiUrl(`/vendors/${vendorId}`), {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isDarkMode: darkMode })
                }).catch(err => console.error("Failed to sync dark mode preference", err));
            }
        }
    }, [darkMode, viewState]);

    const handleRequestDeletion = async () => {
        setActionLoading(true);
        try {
            const vendorId = localStorage.getItem("vendor_id");
            const res = await fetch(apiUrl(`/vendors/${vendorId}/request-deletion`), {
                method: 'PATCH',
            });
            if (res.ok) {
                setViewState('pending_deletion');
            } else {
                alert("Failed to request deletion. Please try again.");
            }
        } catch (error) {
            console.error("Error requesting deletion:", error);
            alert("An error occurred.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelDeletion = async () => {
        setActionLoading(true);
        try {
            const vendorId = localStorage.getItem("vendor_id");
            const res = await fetch(apiUrl(`/vendors/${vendorId}/cancel-deletion`), {
                method: 'PATCH',
            });
            if (res.ok) {
                setViewState('settings');
            } else {
                alert("Failed to cancel deletion. Please try again.");
            }
        } catch (error) {
            console.error("Error cancelling deletion:", error);
            alert("An error occurred.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('vendor_id');
        localStorage.removeItem('token');
        router.push('/login');
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <h3 className="text-[12px] font-bold text-[#A1A1AA] uppercase tracking-[1px] mb-3 pl-1 font-figtree">
            {title}
        </h3>
    );

    const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
        <div 
            onClick={onChange}
            className={`w-[50px] h-[30px] rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out flex items-center ${enabled ? 'bg-[#71717A] dark:bg-[#E95A6E]' : 'bg-[#E4E4E7] dark:bg-[#52525B]'}`}
        >
            <div className={`w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
        </div>
    );

    const SettingsItem = ({ icon: Icon, label, rightElement, onClick, href }: any) => {
        const content = (
            <div className="flex items-center justify-between py-4 px-5 bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[12px] mb-3 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3.5">
                    <Icon className="w-[22px] h-[22px] text-[#71717A] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                    <span className="text-[15px] font-semibold text-[#3F3F46] dark:text-[#FAFAFA] font-figtree">{label}</span>
                </div>
                {rightElement || <ChevronRight className="w-[20px] h-[20px] text-[#A1A1AA]" strokeWidth={2} />}
            </div>
        );

        if (href) {
            return <Link href={href}>{content}</Link>;
        }
        return <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>{content}</div>;
    };

    if (viewState === 'loading') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#030303] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (viewState === 'pending_deletion') {
        return (
            <div className="min-h-screen bg-white flex flex-col font-figtree items-center justify-center px-6 text-center">
                <div className="w-[90px] h-[90px] rounded-full bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center mb-6 shadow-sm">
                    <Hourglass className="w-[40px] h-[40px] text-[#DC2626]" strokeWidth={1.5} />
                </div>
                
                <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-full px-4 py-1.5 flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
                    <span className="text-[11px] font-bold text-[#4B5563] tracking-[1px] uppercase">Pending Deletion</span>
                </div>

                <h1 className="text-[22px] font-bold text-[#030303] mb-4">Account Deletion Pending</h1>
                <p className="text-[15px] text-[#4B5563] leading-relaxed mb-12">
                    We are currently checking for upcoming events, pending settlements, and active disputes. Your data will be permanently removed once these obligations are resolved.
                </p>

                <div className="w-full space-y-4 max-w-sm">
                    <button 
                        onClick={handleCancelDeletion}
                        disabled={actionLoading}
                        className="w-full h-14 bg-[#B91C1C] text-white rounded-full font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        {actionLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Hourglass className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                Keep My Account
                            </>
                        )}
                    </button>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full h-14 bg-white border border-[#FCA5A5] text-[#B91C1C] rounded-full font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        Logout
                    </button>

                    <button 
                        onClick={() => window.location.href = "mailto:support@eventory.in"}
                        className="w-full h-14 bg-white border border-[#FCA5A5] text-[#B91C1C] rounded-full font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <Headphones className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        Contact Support
                    </button>
                </div>
            </div>
        );
    }

    if (viewState === 'confirm_delete') {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-figtree relative">
                {/* Header */}
                <div className="flex items-center p-6 border-b border-[#F0F0F0] bg-white">
                    <button onClick={() => setViewState('settings')} className="p-2 -ml-2 active:scale-95 text-[#DC2626]">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-[18px] font-bold text-[#030303] ml-2">Delete Account?</h1>
                </div>

                <div className="flex-1 px-6 py-10 flex flex-col items-center">
                    <div className="w-[80px] h-[80px] rounded-full bg-[#FEE2E2] flex items-center justify-center mb-8">
                        <AlertTriangle className="w-[36px] h-[36px] text-[#B91C1C] fill-[#B91C1C] stroke-white" strokeWidth={1.5} />
                    </div>

                    <div className="w-full bg-white border border-[#FECACA] rounded-[16px] p-6 mb-auto shadow-sm">
                        <p className="text-[15px] font-medium text-[#4B5563] leading-relaxed">
                            Your account will be deleted within 30 days, after verifying all dependencies like bookings, enquiries, upcoming events, and pending payments.
                        </p>
                        <div className="w-full h-[1px] bg-[#F3F4F6] my-5" />
                        <p className="text-[15px] font-medium text-[#4B5563] leading-relaxed">
                            Till then, your account is deactivated and no new notifications, bookings, or enquiries will be added.
                        </p>
                    </div>

                    <div className="w-full space-y-4 mt-8 max-w-sm pb-8">
                        <button 
                            onClick={handleRequestDeletion}
                            disabled={actionLoading}
                            className="w-full h-[52px] bg-[#B91C1C] text-white rounded-full font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
                        >
                            {actionLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                                    Confirm Deletion
                                </>
                            )}
                        </button>
                        
                        <button 
                            onClick={() => setViewState('settings')}
                            className="w-full h-[52px] bg-white border border-[#E5E7EB] text-[#374151] rounded-full font-bold text-[16px] flex items-center justify-center active:scale-95 transition-transform"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Settings View
    return (
        <div className="min-h-screen bg-white dark:bg-[#09090B] pb-32 pt-10 px-6 transition-colors duration-300 font-figtree">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-[26px] font-bold text-[#030303] dark:text-white transition-colors">Settings</h1>
                <button onClick={() => router.push('/dashboard/menu')} className="w-[40px] h-[40px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" strokeWidth={2.5} />
                </button>
            </div>

            {/* Notifications Section */}
            <div className="mb-8">
                <SectionHeader title="Notifications" />
                <SettingsItem 
                    icon={Bell} 
                    label="Booking Alerts" 
                    rightElement={<Toggle enabled={bookingAlerts} onChange={() => setBookingAlerts(!bookingAlerts)} />} 
                />
            </div>

            {/* Preferences Section */}
            <div className="mb-8">
                <SectionHeader title="Preferences" />
                <SettingsItem 
                    icon={Moon} 
                    label="Dark Mode" 
                    rightElement={<Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />} 
                />
            </div>

            {/* Resources Section */}
            <div className="mb-12">
                <SectionHeader title="Resources" />
                <SettingsItem icon={FileText} label="Privacy Policy" href="/dashboard/privacy" />
                <SettingsItem icon={FileText} label="Terms of Service" href="/dashboard/terms" />
                <SettingsItem icon={FileText} label="Vendor Agreement" href="/dashboard/agreement" />
            </div>

            {/* Delete Account Button */}
            <div className="flex flex-col items-center justify-center mb-6">
                <button 
                    onClick={() => setViewState('confirm_delete')}
                    className="text-[#DC2626] font-bold text-[15px] px-6 py-3 active:scale-95 transition-transform mb-6"
                >
                    Delete Account
                </button>
                <span className="text-[11px] font-bold text-[#A1A1AA] tracking-[2px] uppercase">
                    App Version 2.0.0 (45)
                </span>
            </div>
        </div>
    );
}
