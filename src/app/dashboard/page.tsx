'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Bell,
    ArrowRight,
    Lock,
    Video,
    Home as HomeIcon,
    CalendarCheck,
    Package,
    Calendar,
    Menu as MenuIcon,
    Box,
    ChevronRight,
    CheckCircle2,
    X
} from 'lucide-react';

export default function DashboardHome() {
    const router = useRouter();
    const [userName, setUserName] = useState('Vendor');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);
    const [dashboardStep, setDashboardStep] = useState(1);
    const [step1Progress, setStep1Progress] = useState(0);
    const [step2Progress, setStep2Progress] = useState(0);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        const vendorId = localStorage.getItem('vendor_id');
        if (!vendorId) {
            router.push('/login');
            return;
        }

        const name = localStorage.getItem('vendor_name');
        if (name) setUserName(name);

        const checkOnboardingStatus = async () => {
            const vendorId = localStorage.getItem('vendor_id');
            const success = localStorage.getItem('onboarding_success');
            const savedStep = localStorage.getItem('dashboard_step');

            // Check backend data first (Primary source of truth)
            if (vendorId) {
                try {
                    const res = await fetch(`http://localhost:4000/api/vendors/${vendorId}`, {
                        cache: 'no-store'
                    });
                    const data = await res.json();

                    if (data.success && data.data) {
                        const vendor = data.data;
                        console.log("🔍 Dashboard Status Check:", {
                            isAadharVerified: vendor.isAadharVerified,
                            isPanVerified: vendor.isPanVerified,
                            isGstVerified: vendor.isGstVerified,
                            isIndividual: vendor.isIndividual,
                            hasBankDetails: !!vendor.bankDetails?.accountNumber,
                            accountNumber: vendor.bankDetails?.accountNumber
                        });
                        
                        // If everything is verified, move to Step 3
                        const isDocVerified = vendor.isIndividual 
                            ? (vendor.isAadharVerified && vendor.isPanVerified)
                            : (vendor.isPanVerified && vendor.isGstVerified);

                        if (isDocVerified && vendor.bankDetails?.accountNumber) {
                            console.log("✅ All documents verified! Moving to Step 3.");
                            setDashboardStep(3); // Onboarding complete
                            localStorage.setItem('dashboard_step', '3');
                            return; // Success, we're done
                        } else {
                            console.log("⚠️ Documents NOT fully verified yet.");
                            if (vendor.coverImage) {
                                setDashboardStep(2);
                                localStorage.setItem('dashboard_step', '2');
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error checking vendor status:', err);
                }
            }

            // Fallback to local flags only if backend check didn't resolve to Step 3
            if (savedStep === '3') {
                setDashboardStep(3);
            } else if (success === 'true' || savedStep === '2') {
                setDashboardStep(2);
                if (success === 'true') setShowSuccessModal(true);
                localStorage.setItem('dashboard_step', '2');
                localStorage.removeItem('onboarding_success');
            }
        };

        checkOnboardingStatus();

        // Check for verification completion from URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('onboarding_complete') === 'true') {
            setShowVerifiedModal(true);
            setDashboardStep(3);
            localStorage.setItem('dashboard_step', '3');
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [router]);

    const handleReset = async () => {
        const vendorId = localStorage.getItem('vendor_id');
        if (!vendorId) return;

        setIsResetting(true);
        try {
            // 1. Delete from DB
            await fetch(`http://localhost:4000/api/vendors/${vendorId}`, {
                method: 'DELETE'
            });

            // 2. Clear LocalStorage
            localStorage.clear();

            // 3. Redirect to Signup/Start
            router.push('/login');
        } catch (err) {
            console.error('Reset failed:', err);
        } finally {
            setIsResetting(false);
            setShowResetConfirm(false);
        }
    };

    const Confetti = () => {
        const colors = ['#F24E61', '#FFD700', '#4CAF50', '#2196F3', '#9C27B0', '#FF5722'];
        return (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-t-[32px]">
                {[...Array(60)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            top: -10,
                            left: `${Math.random() * 100}%`,
                            rotate: 0,
                            scale: Math.random() * 0.4 + 0.4
                        }}
                        animate={{
                            top: '100%',
                            left: `${(Math.random() - 0.5) * 20 + (i / 60 * 100)}%`,
                            rotate: 360 + Math.random() * 360,
                        }}
                        transition={{
                            duration: Math.random() * 2 + 1.5,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeOut"
                        }}
                        className="absolute w-1.5 h-3 rounded-[1px]"
                        style={{
                            backgroundColor: colors[i % colors.length],
                            opacity: 0.8
                        }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-figtree pb-28">
            {/* Header */}
            <div className="p-6 flex justify-between items-center bg-white sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <div 
                        onClick={() => setShowResetConfirm(!showResetConfirm)}
                        className="w-12 h-12 bg-[#FDE7E9] rounded-full flex items-center justify-center text-[#F24E61] font-bold text-xl shadow-sm cursor-pointer active:scale-95 transition-all"
                    >
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-[16px] font-semibold text-[#71717B] leading-[24px] font-figtree">Hi, {userName}</h1>
                        <p className="text-[12px] font-semibold text-[#71717B] leading-[18px] font-figtree">Have get more packages today</p>
                    </div>
                </div>

                <AnimatePresence>
                    {showResetConfirm && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={handleReset}
                            disabled={isResetting}
                            className="absolute right-20 top-6 bg-red-500 text-white text-[12px] font-bold px-3 py-2 rounded-lg shadow-lg active:scale-95 z-50"
                        >
                            {isResetting ? 'Resetting...' : 'Delete Profile'}
                        </motion.button>
                    )}
                </AnimatePresence>

                <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 shadow-sm active:scale-95 transition-all">
                    <Bell size={22} className="text-[#04222D]" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 pt-2 space-y-6">
                <AnimatePresence mode="wait">
                    {dashboardStep === 1 && (
                        <motion.div
                            key="step1-container"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* Step 1 Card */}
                            <div className="bg-white rounded-[20px] border border-[#E4E4E7] overflow-hidden flex flex-col">
                                <div className="p-6 pb-4 space-y-4">
                                    <div className="inline-flex h-[24px] px-[12px] py-[2px] items-center justify-center gap-2 bg-[#F4F4F5] border border-[#F4F4F5] rounded-full text-[12px] font-bold text-[#1F2937]">
                                        Step 1
                                    </div>
                                    <div>
                                        <h2 className="text-[20px] font-bold text-[#030303] leading-[28px] font-figtree">Set up Business Profile</h2>
                                        {step1Progress > 0 && step1Progress < 100 ? (
                                            <div className="flex items-center gap-3 mt-4 mb-2">
                                                <div className="flex-1 h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#04222D] rounded-full transition-all duration-500" style={{ width: `${step1Progress}%` }} />
                                                </div>
                                                <span className="text-[13px] font-bold text-[#030303] font-figtree">{step1Progress}%</span>
                                            </div>
                                        ) : (
                                            <p className="text-[14px] text-[#71717B] mt-2 leading-[20px] font-medium font-figtree">
                                                Highlight your skills and set your availability to start attracting clients.
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard/setup-profile')}
                                    className="w-full bg-[#04222D] text-white py-[12px] px-[16px] flex justify-between items-center group active:brightness-110 transition-all"
                                >
                                    <span className="font-bold text-[18px] font-figtree">
                                        {step1Progress > 0 && step1Progress < 100 ? 'Continue' : 'Start Now'}
                                    </span>
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#04222D]">
                                        <ArrowRight size={22} />
                                    </div>
                                </button>
                            </div>

                            {/* Locked Step 2 Card */}
                            <div className="bg-white rounded-[20px] border border-[#E4E4E7] overflow-hidden flex flex-col opacity-60">
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="inline-flex h-[24px] px-[12px] py-[2px] items-center justify-center gap-2 bg-[#F4F4F5] border border-[#F4F4F5] rounded-full text-[12px] font-bold text-[#1F2937]">
                                            Step 2
                                        </div>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9CA3AF]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </div>
                                    <div>
                                        <h2 className="text-[20px] font-bold text-[#71717B] leading-[28px] font-figtree">Personal Documents</h2>
                                        <p className="text-[14px] text-[#A1A1AA] mt-2 leading-[20px] font-medium font-figtree">
                                            Submit your personal documents like Aadhar, PAN, and GST for e-KYC verification.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {dashboardStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-white rounded-[20px] border border-[#E4E4E7] overflow-hidden flex flex-col"
                        >
                            <div className="p-6 pb-4 space-y-4">
                                <div className="inline-flex h-[24px] px-[12px] py-[2px] items-center justify-center gap-2 bg-[#F4F4F5] border border-[#F4F4F5] rounded-full text-[12px] font-bold text-[#1F2937]">
                                    Step 2
                                </div>
                                <div>
                                    <h2 className="text-[20px] font-bold text-[#030303] leading-[28px] font-figtree">Personal Documents</h2>
                                    <p className="text-[14px] text-[#71717B] mt-2 leading-[20px] font-medium font-figtree">
                                        Submit your personal documents like Aadhar, PAN, and GST for e-KYC verification.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard/documents/aadhaar')}
                                className="w-full bg-[#04222D] text-white py-[12px] px-[16px] flex justify-between items-center group active:brightness-110 transition-all"
                            >
                                <span className="font-bold text-[18px] font-figtree">Start Now</span>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#04222D]">
                                    <ArrowRight size={22} />
                                </div>
                            </button>
                        </motion.div>
                    )}

                    {dashboardStep === 3 && (
                        <motion.div
                            key="completed"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-[24px] border border-[#E4E4E7] p-6 flex flex-col items-center text-center space-y-4 shadow-sm"
                        >
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="text-green-500" size={32} />
                            </div>
                            <div>
                                <h2 className="text-[20px] font-bold text-[#030303]">Onboarding Complete!</h2>
                                <p className="text-[14px] text-[#71717B] mt-1 font-medium">Your profile and documents are fully verified. You're ready to start receiving bookings.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Video Banner */}
                <div className="bg-white rounded-[20px] border border-[#E4E4E7] p-6 flex items-center gap-4 relative overflow-hidden">
                    <div className="flex-1 space-y-3">
                        <h3 className="font-bold text-[#030303] text-[15.5px] font-figtree">Business profile setup made easy</h3>
                        <div className="flex items-center gap-2 text-[#2563EB] font-bold text-[14px] font-figtree">
                            <Video size={18} />
                            <span>Video • 2 mins</span>
                        </div>
                    </div>
                    <div className="w-20 h-20 bg-[#F3F4F6] rounded-2xl overflow-hidden relative border border-gray-50">
                        <img
                            src="https://img.freepik.com/free-photo/handsome-smiling-man-shirt-showing-thumb-up_171337-5028.jpg"
                            className="w-full h-full object-cover"
                            alt="Tutorial"
                        />
                    </div>
                </div>

                {/* Create Package CTA */}
                <div 
                    onClick={() => router.push('/dashboard/inventory')}
                    className="flex p-6 items-center gap-4 self-stretch rounded-xl border border-dashed border-[#D4D4D8] bg-[#F4F4F5] group cursor-pointer transition-all hover:bg-gray-100/80"
                >
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50">
                        <Box className="text-[#3F3F47] w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-[16px] font-bold text-[#3F3F47] leading-tight font-figtree">Create your first package</h3>
                        <p className="text-[12px] font-medium text-[#9F9FA9] mt-1 font-figtree">Add More • Earn More</p>
                    </div>
                    <ChevronRight className="text-[#9CA3AF]" size={20} />
                </div>
            </div>

            {/* Documents Verified Success Modal (SS1) */}
            <AnimatePresence>
                {showVerifiedModal && (
                    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowVerifiedModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-[6px] z-[10000]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                            className="relative w-full bg-white rounded-t-[48px] overflow-visible shadow-[0_-20px_80px_rgba(0,0,0,0.4)] max-w-lg z-[10001] pb-12"
                        >
                            {/* Close Button X at the top */}
                            <button
                                onClick={() => setShowVerifiedModal(false)}
                                className="absolute -top-20 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center rounded-full bg-white text-gray-400 shadow-[0_15px_35px_rgba(0,0,0,0.25)] z-[10002] active:scale-90 transition-all border border-gray-100"
                            >
                                <X size={32} strokeWidth={2.5} />
                            </button>

                            <div className="relative overflow-hidden rounded-t-[48px] bg-white">
                                {/* Final Accurate Confetti */}
                                <div className="absolute top-0 left-0 right-0 h-48 opacity-90 pointer-events-none">
                                    <img src="/images/confetti_bg_final.png" alt="" className="w-full h-full object-cover" />
                                </div>

                                <div className="p-8 pt-16 flex flex-col items-center text-center space-y-6 pb-10 relative z-10">
                                    {/* Final Accurate 3D Icon */}
                                    <div className="w-52 h-52 relative mb-2">
                                        <img
                                            src="/images/verified_docs_icon_final.png"
                                            alt="Documents Verified"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <h2 className="text-[26px] font-bold text-[#030303] tracking-tight font-figtree">
                                            Documents Verified
                                        </h2>
                                        <p className="text-[15px] text-[#A1A1AA] font-medium leading-[22px] px-8 font-figtree max-w-[320px]">
                                            Start Adding Packages to Build your Inventory,
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => router.push('/dashboard/inventory?add=true')}
                                        className="w-full bg-[#04222D] text-white py-5 px-6 rounded-[20px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg mt-6"
                                    >
                                        Add New Package
                                        <ArrowRight size={20} className="ml-1" />
                                    </button>
                                </div>
                            </div>

                            {/* Home Indicator Padding */}
                            <div className="absolute top-full left-0 right-0 h-[100px] bg-white" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
