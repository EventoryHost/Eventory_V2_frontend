'use client';
import { apiUrl } from '@/lib/api';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = apiUrl('');

const HERO_SLIDES = [
    {
        image: "https://dkuacgndftndz.cloudfront.net/inventory-page/redloginn.png",
        content: (
            <h1 className="text-white text-4xl font-semibold leading-tight drop-shadow-md">
                <span className="block mb-1">Turn your <span className="italic font-normal">services</span></span>
                <span>
                    into <span className="font-bold">packages</span>
                    <Sparkles className="inline-block text-white w-6 h-6 fill-white ml-2 -mt-1" />
                </span>
            </h1>
        )
    },
    {
        image: "https://dkuacgndftndz.cloudfront.net/inventory-page/bluelogin.png",
        content: (
            <h1 className="text-white text-4xl font-semibold leading-tight drop-shadow-md">
                <span className="block mb-1">Reach <span className="italic font-normal">customers</span> who</span>
                <span>
                    are ready to <span className="font-bold">book you</span>
                    <Sparkles className="inline-block text-yellow-400 w-6 h-6 fill-yellow-400 ml-2 -mt-1" />
                </span>
            </h1>
        )
    }
];

export default function LoginPage() {
    const router = useRouter();
    const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [step, setStep] = useState(0); // 0: Hero, 1: Phone, 2: OTP
    const [formData, setFormData] = useState({
        phone: '',
        otp: '',
    });
    const [status, setStatus] = useState({
        loading: false,
        error: '',
        success: '',
        session: '',
    });
    const [timer, setTimer] = useState(0);
    const [loggedInUser, setLoggedInUser] = useState<{ id: string | null; name: string | null } | null>(() => {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem('vendor_token');
        const id = localStorage.getItem('vendor_id');
        const name = localStorage.getItem('vendor_name');
        return token && id ? { id, name } : null;
    });
    const [heroIndex, setHeroIndex] = useState(0);

    useEffect(() => {
        if (step === 0) {
            const interval = setInterval(() => {
                setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [step]);

    // Timer for Resend OTP
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async () => {
        setStatus({ ...status, loading: true, error: '' });
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: formData.phone }),
            });
            const data = await response.json();
            if (data.success) {
                setStatus({ ...status, loading: false, session: data.session });
                setTimer(30);
                setStep(2);
            } else {
                setStatus({ ...status, loading: false, error: data.message || 'Failed to send OTP' });
            }
        } catch {
            setStatus({ ...status, loading: false, error: 'Server connection failed' });
        }
    };

    const handleVerifyOtp = async () => {
        setStatus({ ...status, loading: true, error: '' });
        try {
            const response = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mobile: formData.phone,
                    code: formData.otp,
                    session: status.session,
                }),
            });
            const data = await response.json();
            if (data.success) {
                if (typeof window !== 'undefined') {
                    if (data.vendor?.businessName) localStorage.setItem('vendor_name', data.vendor.businessName);
                    if (data.token) localStorage.setItem('vendor_token', data.token);
                    if (data.vendor?.id) localStorage.setItem('vendor_id', data.vendor.id);
                }
                setStatus({ ...status, loading: false, success: 'Login successful!' });
                setTimeout(() => router.push('/dashboard'), 1000);
            } else {
                setStatus({ ...status, loading: false, error: data.message || 'Invalid OTP' });
            }
        } catch {
            setStatus({ ...status, loading: false, error: 'Verification failed' });
        }
    };

    const isButtonDisabled = () => {
        if (step === 1) return formData.phone.length !== 10;
        if (step === 2) return formData.otp.length !== 6;
        return false;
    };

    const updateOtpDigit = (index: number, value: string) => {
        const digits = value.replace(/\D/g, '');

        if (digits.length > 1) {
            const nextOtp = digits.slice(0, 6);
            setFormData({ ...formData, otp: nextOtp });
            if (status.error) setStatus({ ...status, error: '' });
            otpInputRefs.current[Math.min(nextOtp.length, 5)]?.focus();
            return;
        }

        const otpDigits = formData.otp.padEnd(6, ' ').split('');
        otpDigits[index] = digits;
        const nextOtp = otpDigits.join('').replace(/\s/g, '');
        setFormData({ ...formData, otp: nextOtp });
        if (status.error) setStatus({ ...status, error: '' });
        if (digits && index < 5) otpInputRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !formData.otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }

        if (event.key === 'Enter' && !isButtonDisabled()) {
            handleVerifyOtp();
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-0 sm:p-4 font-figtree">
            <div className="w-full max-w-md h-screen sm:h-[850px] bg-white sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col">
                
                {/* Hero Section */}
                <div className={`relative w-full transition-all duration-500 overflow-hidden ${step === 0 ? 'h-[72%]' : 'h-[35%]'}`}>
                    {HERO_SLIDES.map((slide, idx) => (
                        <Image
                            key={slide.image}
                            src={slide.image}
                            alt="Login Hero"
                            fill
                            className={`object-cover transition-opacity duration-1000 ${idx === heroIndex ? 'opacity-100' : 'opacity-0'}`}
                            priority={idx === 0}
                        />
                    ))}
                    <div className="absolute inset-0 bg-black/10" />
                    
                    {step > 0 && (
                        <button 
                            onClick={() => setStep(prev => prev - 1)}
                            className="absolute top-12 left-6 z-30 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 active:scale-95 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <motion.div 
                        initial={false}
                        animate={{ 
                            bottom: step === 0 ? '3.5rem' : '2rem',
                            scale: step === 0 ? 1 : 0.85
                        }}
                        className="absolute left-8 right-8 z-10 origin-left flex flex-col"
                    >
                        <div className="mb-2">
                            <img 
                                src="https://dkuacgndftndz.cloudfront.net/inventory-page/clearLogoeventoryV2.svg" 
                                alt="Eventory Logo" 
                                className="w-12 h-12 object-contain drop-shadow-sm"
                            />
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={heroIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                            >
                                {HERO_SLIDES[heroIndex].content}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Action Panel */}
                <div className="flex-1 bg-white rounded-t-[32px] -mt-8 relative z-20 px-8 pt-6 pb-8 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div 
                                key="hero"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3"
                            >
                                {loggedInUser ? (
                                    <>
                                        <div className="flex items-center gap-3 w-full">
                                            <button
                                                onClick={() => {
                                                    localStorage.removeItem('vendor_token');
                                                    localStorage.removeItem('vendor_id');
                                                    localStorage.removeItem('vendor_name');
                                                    setLoggedInUser(null);
                                                }}
                                                className="flex-1 py-4 bg-[#EF4444] text-white rounded-xl font-bold text-base shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                                Log out
                                            </button>
                                            
                                            <div className="relative group flex items-center">
                                                <button 
                                                    type="button"
                                                    className="w-14 h-14 flex items-center justify-center bg-[#F0F2F5] text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-all border border-gray-200"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                </button>
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full right-0 mb-3 w-[220px] p-3 bg-[#030303] text-white text-[13px] leading-snug rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all z-50 shadow-xl pointer-events-none">
                                                    You are already logged in with ID: <span className="font-bold text-blue-400">{loggedInUser.id}</span>
                                                    <div className="absolute top-full right-[20px] -mt-1 border-[6px] border-transparent border-t-[#030303]"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push('/dashboard')}
                                            className="w-full py-4 bg-[#04222D] text-white rounded-xl font-semibold text-base shadow-lg active:scale-[0.98] transition-all"
                                        >
                                            Go to Dashboard
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-4 w-full">
                                        <button
                                            onClick={() => router.push('/signup')}
                                            className="w-full py-4 bg-[#000304] text-white rounded-lg font-semibold text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-center"
                                        >
                                            Create Account
                                        </button>
                                        
                                        <div className="w-full h-[1px] bg-gray-200 my-1" />

                                        <button className="w-full py-4 bg-[#F0F2F5] text-gray-800 rounded-lg font-semibold text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                            </svg>
                                            Sign in with Google
                                        </button>
                                        
                                        <button
                                            onClick={() => setStep(1)}
                                            className="w-full py-4 bg-[#F0F2F5] text-gray-800 rounded-lg font-semibold text-base active:scale-[0.98] transition-all flex items-center justify-center"
                                        >
                                            Sign in
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div 
                                key="phone"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 flex-1 flex flex-col"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-[#030303]">Welcome Back</h2>
                                    <p className="text-gray-500 text-sm">Please enter your phone number to sign in</p>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className={`flex items-center w-full border rounded-xl px-4 transition-all bg-[#F9FAFB] ${status.error ? 'border-red-500' : 'border-gray-200 focus-within:border-[#04222D] focus-within:ring-1 focus-within:ring-[#04222D]'}`}>
                                        <span className="text-gray-500 font-medium py-4 pr-3 border-r border-gray-200">+91</span>
                                        <input 
                                            autoFocus
                                            type="tel"
                                            maxLength={10}
                                            placeholder="Mobile Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                            className="w-full py-4 pl-3 outline-none bg-transparent text-[#030303] font-medium"
                                        />
                                    </div>
                                    {status.error && <p className="text-red-500 text-xs font-medium">{status.error}</p>}
                                </div>

                                <button
                                    disabled={isButtonDisabled() || status.loading}
                                    onClick={handleSendOtp}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isButtonDisabled() || status.loading ? 'bg-gray-100 text-gray-400' : 'bg-[#04222D] text-white shadow-lg shadow-[#04222D]/20 active:scale-[0.98]'}`}
                                >
                                    {status.loading ? 'Sending...' : 'Get OTP'}
                                    <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3 flex-1 flex flex-col pt-2"
                            >
                                <div>
                                    <h2 className="text-[17px] font-bold text-[#262634] leading-tight font-figtree">Enter Verification Code</h2>
                                    <p className="text-[11px] leading-[16px] text-[#262634] mt-4 font-figtree max-w-[305px]">
                                        Please Enter The 6 - Digit Verification Code Send To {formData.phone || '7895266687'}
                                    </p>
                                </div>

                                <div className="space-y-2 flex-1">
                                    <div className="grid w-full grid-cols-6 gap-[7px] pt-1">
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <input
                                                key={index}
                                                ref={(element) => {
                                                    otpInputRefs.current[index] = element;
                                                }}
                                                autoFocus={index === 0}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={formData.otp[index] || ''}
                                                onChange={(event) => updateOtpDigit(index, event.target.value)}
                                                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                                                className={`h-10 w-full rounded-[6px] border bg-white text-center text-[12px] font-normal text-[#262634] outline-none transition-all font-figtree ${
                                                    status.error
                                                        ? 'border-red-500'
                                                        : status.success
                                                            ? 'border-green-500'
                                                            : 'border-[#DFE2E7] focus:border-[#04222D] focus:ring-1 focus:ring-[#04222D]'
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-start min-h-[24px] font-figtree">
                                        <div className="flex-1">
                                            {status.error && <p className="text-red-500 text-sm font-medium">{status.error}</p>}
                                            {status.success && <p className="text-green-500 text-sm font-bold">{status.success}</p>}
                                            {!status.error && !status.success && timer > 0 && (
                                                <p className="text-[#A8A9B3] text-[10px] leading-[14px]">Resend in {timer}s</p>
                                            )}
                                        </div>
                                        {!status.success && (
                                            timer > 0 ? (
                                                <button
                                                    disabled
                                                    className="text-[#A8A9B3] text-[10px] leading-[14px] font-medium cursor-not-allowed"
                                                >
                                                    Resend
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleSendOtp}
                                                    className="text-[#04222D] text-[10px] leading-[14px] font-medium"
                                                >
                                                    Resend
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                <button
                                    disabled={isButtonDisabled() || status.loading}
                                    onClick={handleVerifyOtp}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isButtonDisabled() || status.loading ? 'bg-gray-100 text-gray-400' : 'bg-[#04222D] text-white shadow-lg shadow-[#04222D]/20 active:scale-[0.98]'}`}
                                >
                                    {status.loading ? 'Verifying...' : 'Verify'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
