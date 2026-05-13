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
    X
} from 'lucide-react';

export default function DashboardHome() {
    const router = useRouter();
    const [userName, setUserName] = useState('Vendor');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [dashboardStep, setDashboardStep] = useState(1);

    useEffect(() => {
        const name = localStorage.getItem('vendor_name');
        if (name) setUserName(name);

        const checkOnboardingStatus = async () => {
            const vendorId = localStorage.getItem('vendor_id');
            const success = localStorage.getItem('onboarding_success');
            const savedStep = localStorage.getItem('dashboard_step');

            // If we have a local flag, prioritize it
            if (success === 'true' || savedStep === '2') {
                setDashboardStep(2);
                if (success === 'true') setShowSuccessModal(true);
                localStorage.setItem('dashboard_step', '2');
                localStorage.removeItem('onboarding_success');
                return;
            }

            // Fallback: Check backend data (read-only)
            if (vendorId) {
                try {
                    const res = await fetch(`http://localhost:4000/api/vendors/${vendorId}`);
                    const data = await res.json();
                    
                    // If vendor has finished step 12 (coverImage is a good indicator of full profile setup)
                    if (data.success && data.data.coverImage) {
                        setDashboardStep(2);
                        localStorage.setItem('dashboard_step', '2');
                    }
                } catch (err) {
                    console.error('Error checking vendor status:', err);
                }
            }
        };

        checkOnboardingStatus();
    }, []);

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
                    <div className="w-12 h-12 bg-[#FDE7E9] rounded-full flex items-center justify-center text-[#F24E61] font-bold text-xl shadow-sm">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-[16px] font-semibold text-[#71717B] leading-[24px] font-figtree">Hi, {userName}</h1>
                        <p className="text-[12px] font-semibold text-[#71717B] leading-[18px] font-figtree">Have get more packages today</p>
                    </div>
                </div>
                <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 shadow-sm active:scale-95 transition-all">
                    <Bell size={22} className="text-[#04222D]" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 pt-2 space-y-6">
                <AnimatePresence mode="wait">
                    {dashboardStep === 1 ? (
                        /* Step 1 Card */
                        <motion.div 
                            key="step1"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="bg-white rounded-[20px] border border-[#E4E4E7] overflow-hidden flex flex-col"
                        >
                            <div className="p-6 pb-4 space-y-4">
                                <div className="inline-flex h-[24px] px-[12px] py-[2px] items-center justify-center gap-2 bg-[#F4F4F5] border border-[#F4F4F5] rounded-full text-[12px] font-bold text-[#1F2937]">
                                    Step 1
                                </div>
                                <div>
                                    <h2 className="text-[20px] font-bold text-[#030303] leading-[28px] font-figtree">Set up Business Profile</h2>
                                    <p className="text-[14px] text-[#71717B] mt-2 leading-[20px] font-medium font-figtree">
                                        Highlight your skills and set your availability to start attracting clients.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => router.push('/dashboard/setup-profile')}
                                className="w-full bg-[#04222D] text-white py-[12px] px-[16px] flex justify-between items-center group active:brightness-110 transition-all"
                            >
                                <span className="font-bold text-[18px] font-figtree">Start Now</span>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#04222D]">
                                    <ArrowRight size={22} />
                                </div>
                            </button>
                        </motion.div>
                    ) : (
                        /* Step 2 Card */
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
                                className="w-full bg-[#04222D] text-white py-[12px] px-[16px] flex justify-between items-center group active:brightness-110 transition-all"
                            >
                                <span className="font-bold text-[18px] font-figtree">Start Now</span>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#04222D]">
                                    <ArrowRight size={22} />
                                </div>
                            </button>
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
                <div className="flex p-6 items-center gap-4 self-stretch rounded-xl border border-dashed border-[#D4D4D8] bg-[#F4F4F5] group cursor-pointer transition-all hover:bg-gray-100/80">
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

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSuccessModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-[6px] z-[10000]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                            className="relative w-full bg-white rounded-t-[48px] overflow-visible shadow-[0_-20px_80px_rgba(0,0,0,0.4)] max-w-lg z-[10001] pb-12"
                        >
                            {/* Close Button overlapping the edge - positioned even higher */}
                            <button 
                                onClick={() => setShowSuccessModal(false)}
                                className="absolute -top-20 left-1/2 -translate-x-1/2 w-16 h-16 flex items-center justify-center rounded-full bg-white text-gray-400 shadow-[0_15px_35px_rgba(0,0,0,0.25)] z-[10002] active:scale-90 transition-all border border-gray-100"
                            >
                                <X size={32} strokeWidth={2.5} />
                            </button>

                            <div className="relative overflow-hidden rounded-t-[48px]">
                                <Confetti />
                                
                                <div className="p-8 pt-12 flex flex-col items-center text-center space-y-7 pb-8">
                                    <div className="w-56 h-56 relative">
                                        <img 
                                            src="/images/clapping-hands.png" 
                                            alt="Success" 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-[28px] font-black text-[#030303] tracking-tight font-figtree">
                                            Yay! You’re all set.
                                        </h2>
                                        <p className="text-[16px] text-gray-500 font-semibold leading-relaxed px-6 font-figtree opacity-90">
                                            Start step 2 of personal Document verification. and start adding item to Build your Inventory.
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => setShowSuccessModal(false)}
                                        className="w-full bg-[#04222D] text-white py-5.5 px-6 rounded-[24px] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xl"
                                    >
                                        Step 2 : Add Personal Documents
                                        <ArrowRight size={22} />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Home Indicator Padding - Forced to cover bottom */}
                            <div className="absolute top-full left-0 right-0 h-[100px] bg-white" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
