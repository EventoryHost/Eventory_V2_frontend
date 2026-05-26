'use client';
import { apiUrl } from '@/lib/api';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, RefreshCcw, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = apiUrl('');
const PRIMARY_COLOR = 'rgba(4, 34, 45, 1)'; // #04222D

export default function SignupFlow() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
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

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.back();
    };

    const nextStep = () => setStep(step + 1);

    const handleSendOtp = async () => {
        setStatus({ ...status, loading: true, error: '' });
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: formData.phone, isSignup: true }),
            });
            const data = await response.json();
            if (data.success) {
                setStatus({ ...status, loading: false, session: data.session });
                setTimer(30);
                nextStep();
            } else {
                setStatus({ ...status, loading: false, error: data.message || 'Failed to send OTP' });
                if (data.code === 'USER_ALREADY_EXISTS') {
                    setTimeout(() => {
                        router.push('/login');
                    }, 3000);
                }
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
                    name: formData.name
                }),
            });
            const data = await response.json();
            if (data.success) {
                // Save name and token for persistent state
                if (typeof window !== 'undefined') {
                    localStorage.setItem('vendor_name', formData.name);
                    if (data.token) localStorage.setItem('vendor_token', data.token);
                    if (data.vendor?.id) {
                        localStorage.setItem('vendor_id', data.vendor.id);
                    } else if (data.vendorId) {
                        localStorage.setItem('vendor_id', data.vendorId);
                    }
                }

                setStatus({ ...status, loading: false, success: 'OTP Verified!' });
                
                // Transition to Success Screen (Step 4)
                setTimeout(() => setStep(4), 1500);
            } else {
                setStatus({ ...status, loading: false, error: 'Wrong otp enter OTP' });
            }
        } catch (err) {
            setStatus({ ...status, loading: false, error: 'Verification failed' });
        }
    };

    const isButtonDisabled = () => {
        if (step === 1) return formData.name.trim().length < 3;
        if (step === 2) return formData.phone.length !== 10;
        if (step === 3) return formData.otp.length !== 6;
        return true;
    };

    const handleContinue = () => {
        if (step === 1) nextStep();
        if (step === 2) handleSendOtp();
        if (step === 3) handleVerifyOtp();
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Progress Bar (Hide in Step 4) */}
            {step < 4 && (
                <div className="px-6 pt-12">
                    <div className="flex items-center mb-4">
                        <button 
                            onClick={handleBack}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 shadow-sm active:scale-95 transition-all flex-shrink-0"
                        >
                            <ChevronLeft size={24} className="text-gray-600" />
                        </button>
                        <div 
                            className="flex-1 h-[12px] rounded-[12px] ml-4 overflow-hidden"
                            style={{ backgroundColor: 'rgba(230, 233, 234, 1)' }}
                        >
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                                className="h-full rounded-[12px]"
                                style={{ backgroundColor: 'rgba(3, 27, 36, 1)' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 px-6 pt-4 overflow-hidden relative ${step === 4 ? 'flex flex-col justify-center pb-20' : ''}`}>
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h2 className="text-[28px] font-bold text-[#1F2937] leading-tight">What is your Full Name</h2>
                            <div className="flex flex-col items-start gap-2 w-full max-w-[361px]">
                                <input 
                                    autoFocus
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && !isButtonDisabled() && handleContinue()}
                                    className="w-full text-[16px] leading-6 font-figtree font-normal px-5 py-4 border border-[#D4D4D8] rounded-xl focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B] outline-none transition-all placeholder:text-gray-400 text-[#030303] bg-white shadow-sm"
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h2 className="text-[28px] font-bold text-[#1F2937] leading-tight font-figtree">What is your Phone number</h2>
                            <div className="flex flex-col items-start gap-2 w-full max-w-[361px]">
                                <div className={`flex items-center w-full border rounded-xl px-5 transition-all bg-white shadow-sm ${
                                    status.error ? 'border-red-500' : 'border-[#D4D4D8] focus-within:border-[#18181B] focus-within:ring-1 focus-within:ring-[#18181B]'
                                }`}>
                                    <span className="text-[16px] leading-6 font-figtree py-4 pr-3 text-[#030303] font-medium">+91</span>
                                    <input 
                                        autoFocus
                                        type="tel"
                                        maxLength={10}
                                        placeholder="Mobile Number"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') });
                                            if (status.error) setStatus({ ...status, error: '' });
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && !isButtonDisabled() && handleContinue()}
                                        className="w-full text-[16px] leading-6 font-figtree font-normal py-4 outline-none placeholder:text-gray-400 text-[#030303] bg-transparent"
                                    />
                                </div>
                                <div className="min-h-[20px] mt-1 ml-1">
                                    {status.error ? (
                                        <p className="text-red-500 text-sm font-figtree font-medium">{status.error}</p>
                                    ) : (
                                        <p className="text-sm text-gray-400 font-figtree">An 6 digit OTP will be sent to verify this number</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-[28px] font-bold text-[#1F2937] leading-tight font-figtree">Enter 6 digit OTP</h2>
                                <p className="text-sm text-gray-400 mt-3 ml-1 font-figtree">An 6 digit OTP was sent on phone number ending with ******{formData.phone.slice(-4)}</p>
                            </div>
                            
                            <div className="flex flex-col items-start gap-2 w-full max-w-[361px]">
                                <div className={`flex items-center w-full border rounded-xl px-5 transition-all bg-white shadow-sm ${
                                    status.error ? 'border-red-500' : status.success ? 'border-green-500' : 'border-[#D4D4D8] focus-within:border-[#18181B] focus-within:ring-1 focus-within:ring-[#18181B]'
                                }`}>
                                    <input 
                                        autoFocus
                                        type="text"
                                        maxLength={6}
                                        placeholder="OTP"
                                        value={formData.otp}
                                        onChange={(e) => {
                                            setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') });
                                            if (status.error) setStatus({ ...status, error: '' });
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && !isButtonDisabled() && handleContinue()}
                                        className="w-full text-[16px] leading-6 font-figtree font-normal py-4 outline-none tracking-[0.5em] placeholder:tracking-normal placeholder:text-gray-400 text-[#030303] bg-transparent"
                                    />
                                </div>
                                
                                <div className="flex justify-between items-center w-full min-h-[24px] px-1 font-figtree mt-1">
                                    <div className="flex-1">
                                        {status.error && <p className="text-red-500 text-sm font-medium">{status.error}</p>}
                                        {status.success && <p className="text-green-500 text-sm font-bold">{status.success}</p>}
                                    </div>
                                    {!status.success && (
                                        timer > 0 ? (
                                            <p className="text-gray-400 text-xs">Resend in {timer}s</p>
                                        ) : (
                                            <button 
                                                onClick={handleSendOtp}
                                                className="text-[#04222D] text-xs font-bold flex items-center gap-1.5"
                                            >
                                                <RefreshCcw size={12} /> Resend
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center w-full"
                        >
                            <div className="bg-white p-10 rounded-2xl border border-gray-100 flex flex-col items-center text-center max-w-[361px] w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <div className="w-20 h-20 bg-[#F24E61] rounded-full flex items-center justify-center mb-8 shadow-lg shadow-[#F24E61]/20">
                                    <Check className="text-white" size={40} strokeWidth={3} />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-[#1F2937] mb-4 font-figtree leading-tight">Your Profile is set up!</h2>
                                <p className="text-[#6B7280] text-sm font-figtree leading-relaxed mb-10 px-2">
                                    You can now do a lot of tasks like creating packages, checking the calendar, and much more.
                                </p>
                                
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full py-4 bg-[#04222D] text-white rounded-lg font-bold text-lg active:scale-[0.98] transition-all"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Button (Hide in Step 4) */}
            {step < 4 && (
                <div className="p-6 bg-white border-t border-gray-50">
                    <button
                        disabled={isButtonDisabled() || status.loading}
                        onClick={handleContinue}
                        style={{ 
                            backgroundColor: isButtonDisabled() || status.loading ? '#E5E7EB' : PRIMARY_COLOR 
                        }}
                        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                            isButtonDisabled() || status.loading
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-white active:scale-[0.98] shadow-lg shadow-[#04222D]/10'
                        }`}
                    >
                        {status.loading ? 'Processing...' : 'Continue'}
                        {!status.loading && <ArrowRight size={20} />}
                    </button>
                    
                    {/* Home Indicator Spacer */}
                    <div className="h-4 sm:h-0" />
                </div>
            )}
        </div>
    );
}
