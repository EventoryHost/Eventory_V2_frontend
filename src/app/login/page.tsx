'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCcw, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = 'http://localhost:4000/api';

export default function LoginPage() {
    const router = useRouter();
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

    // Timer for Resend OTP
    useEffect(() => {
        let interval: any;
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
        } catch (err) {
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
        } catch (err) {
            setStatus({ ...status, loading: false, error: 'Verification failed' });
        }
    };

    const isButtonDisabled = () => {
        if (step === 1) return formData.phone.length !== 10;
        if (step === 2) return formData.otp.length !== 6;
        return false;
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-0 sm:p-4 font-figtree">
            <div className="w-full max-w-md h-screen sm:h-[850px] bg-white sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col">
                
                {/* Hero Section */}
                <div className={`relative w-full transition-all duration-500 ${step === 0 ? 'h-[72%]' : 'h-[35%]'}`}>
                    <Image
                        src="/images/login-hero.png"
                        alt="Turn your services into packages"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-rose-400/50" />
                    
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
                        className="absolute left-8 right-8 z-10 origin-left"
                    >
                        <div className="mb-2">
                            <img 
                                src="https://dkuacgndftndz.cloudfront.net/inventory-page/new-logo.jpg" 
                                alt="Eventory Logo" 
                                className="w-12 h-12 object-contain mix-blend-multiply opacity-90"
                            />
                        </div>
                        <h1 className="text-white text-3xl font-semibold leading-tight flex flex-col">
                            <span>Turn your <span className="italic font-normal">services</span></span>
                            <span className="flex items-center gap-2">
                                into <span className="font-bold">packages</span>
                                <Sparkles className="text-white w-5 h-5 fill-white" />
                            </span>
                        </h1>
                    </motion.div>
                </div>

                {/* Action Panel */}
                <div className="flex-1 bg-white rounded-t-[32px] -mt-8 relative z-20 px-8 pt-10 pb-10 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div 
                                key="hero"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-3 mt-auto"
                            >
                                <button
                                    onClick={() => router.push('/signup')}
                                    className="w-full py-4 bg-[#04222D] text-white rounded-xl font-semibold text-base shadow-lg active:scale-[0.98] transition-all"
                                >
                                    Create Account
                                </button>
                                <button
                                    onClick={() => setStep(1)}
                                    className="w-full py-4 bg-[#F0F2F5] text-gray-800 rounded-xl font-semibold text-base active:scale-[0.98] transition-all"
                                >
                                    Sign in
                                </button>
                                <button className="w-full py-4 bg-[#F0F2F5] text-gray-800 rounded-xl font-semibold text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Sign in with Google
                                </button>
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
                                className="space-y-6 flex-1 flex flex-col"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-[#030303]">Verify OTP</h2>
                                    <p className="text-gray-500 text-sm">Code sent to ******{formData.phone.slice(-4)}</p>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className={`flex items-center w-full border rounded-xl px-4 transition-all bg-[#F9FAFB] ${status.error ? 'border-red-500' : 'border-gray-200 focus-within:border-[#04222D] focus-within:ring-1 focus-within:ring-[#04222D]'}`}>
                                        <input 
                                            autoFocus
                                            type="text"
                                            maxLength={6}
                                            placeholder="Enter 6-digit OTP"
                                            value={formData.otp}
                                            onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                            className="w-full py-4 outline-none bg-transparent text-[#030303] font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-red-500 text-xs font-medium">{status.error}</p>
                                        {timer > 0 ? (
                                            <p className="text-gray-400 text-xs">Resend in {timer}s</p>
                                        ) : (
                                            <button 
                                                onClick={handleSendOtp}
                                                className="text-[#04222D] text-xs font-bold flex items-center gap-1.5"
                                            >
                                                <RefreshCcw size={12} /> Resend
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <button
                                    disabled={isButtonDisabled() || status.loading}
                                    onClick={handleVerifyOtp}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isButtonDisabled() || status.loading ? 'bg-gray-100 text-gray-400' : 'bg-[#04222D] text-white shadow-lg shadow-[#04222D]/20 active:scale-[0.98]'}`}
                                >
                                    {status.loading ? 'Verifying...' : 'Sign In'}
                                    <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
