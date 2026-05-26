'use client';
import { apiUrl } from '@/lib/api';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ArrowLeft, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = apiUrl('');

function AadhaarContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [aadhaar, setAadhaar] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPopup, setShowPopup] = useState(true);
    const [isVerifyingReturn, setIsVerifyingReturn] = useState(false);
    const [lastVerificationId, setLastVerificationId] = useState('');

    // Handle DigiLocker return
    useEffect(() => {
        const vId = searchParams.get('verification_id');
        const status = searchParams.get('status');
        if (vId && status === 'SUCCESS') {
            setShowPopup(false);
            setIsVerifyingReturn(true);
            verifyStatus(vId);
        }
    }, [searchParams]);

    const verifyStatus = async (id: string) => {
        try {
            const vendorId = localStorage.getItem('vendor_id');
            const res = await fetch(`${API_BASE}/verification/digilocker/document/${id}?vendor_id=${vendorId}`);
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                router.push('/dashboard/documents/pan');
            }
        } catch (err) {
            setError('Verification failed');
            setIsVerifyingReturn(false);
        }
    };

    const handleContinue = async () => {
        if (aadhaar.length !== 12) return;
        setLoading(true);

        // 🔹 Dummy bypass for testing
        if (/^0+$/.test(aadhaar)) {
            console.log("🟡 Dummy Aadhaar detected → Bypassing URL generation");
            setLastVerificationId('dummy_v_id');
            // Directly call verifyStatus with the dummy ID to trigger the DB save
            const vendorId = localStorage.getItem('vendor_id');
            await fetch(`${API_BASE}/verification/digilocker/document/dummy_v_id?vendor_id=${vendorId}&aadhar_number=${aadhaar}`);
            setLoading(false);
            router.push('/dashboard/documents/pan');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/verification/digilocker/generate-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    redirect_url: `${window.location.origin}/dashboard/documents/aadhaar`,
                    aadhaar_number: aadhaar
                })
            });
            const data = await res.json();
            if (data.url) {
                setLastVerificationId(data.verification_id);
                window.open(data.url, '_blank');
                setLoading(false);
                setError('Verification started in a new tab. Please complete it and click "Already Verified" below.');
            }
        } catch (err) {
            setError('Failed to start verification');
        } finally {
            setLoading(false);
        }
    };

    const formatAadhaar = (val: string) => val.replace(/\D/g, '').substring(0, 12);
    const isValid = aadhaar.length === 12;

    if (isVerifyingReturn) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[16px] font-bold text-[#030303]">Verifying with DigiLocker...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-figtree relative overflow-hidden">
            {/* ─── BASE LAYER: Aadhaar Input Form ──────────────────────────────── */}
            <div className={`flex-1 flex flex-col transition-all duration-500 ${showPopup ? 'blur-sm grayscale-[0.2] brightness-90' : 'blur-0'}`}>
                {/* Top Nav */}
                <div className="px-6 pt-12">
                    <div className="w-full h-[6px] rounded-full bg-[#E5E5E5] mb-6 overflow-hidden">
                        <div className="h-full w-[40%] bg-[#031B24] rounded-full" />
                    </div>
                    <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-[#030303] text-[16px] font-semibold mb-8">
                        <ChevronLeft size={20} />
                        <span>Save & Exit</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6">
                    <h1 className="text-[#030303] text-[28px] font-bold leading-tight mb-8">
                        What is your Aadhar number
                    </h1>

                    {/* Aadhaar Card Graphic */}
                    <div className="w-full aspect-[1.6/1] bg-[#F8F9FA] rounded-[32px] border border-[#E5E7EB] mb-12 relative flex items-center justify-center overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <img 
                            src="/images/aadhar_card_template.png" 
                            alt="Aadhar Card" 
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/F8F9FA/999?text=Aadhaar+Card'}
                        />
                        <div className="absolute bottom-8 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border border-[#E5E7EB] shadow-xl">
                            <p className="text-[16px] font-bold tracking-[3px] text-[#030303] flex items-center gap-4">
                                <span className="text-[12px] font-medium tracking-normal text-[#71717B] uppercase opacity-60">Aadhar no.</span>
                                {aadhaar ? aadhaar.replace(/(.{4})/g, '$1 ').trim().padEnd(14, '•') : '0000 1111 2222'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[14px] font-bold text-[#030303]">Aadhar number</p>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0000 1111 2222"
                            value={aadhaar}
                            onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                            className="w-full px-5 py-5 border border-[#D1D5DB] rounded-2xl outline-none text-[20px] font-bold tracking-[4px] text-[#030303] focus:border-[#030303] transition-all bg-white placeholder:tracking-normal placeholder:text-[#9CA3AF] placeholder:font-normal"
                        />
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 px-1">
                                <XCircle size={14} />
                                <p className="text-[13px] font-medium">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="bg-white border-t border-[#F0F0F0] px-6 py-5 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-16 h-16 flex items-center justify-center rounded-[20px] bg-[#F3F4F6] border border-[#E5E7EB] active:scale-95 transition-all"
                    >
                        <ArrowLeft size={24} className="text-[#030303]" />
                    </button>
                    <button
                        disabled={(!isValid && !lastVerificationId) || loading}
                        onClick={lastVerificationId ? () => {
                            verifyStatus(lastVerificationId);
                        } : handleContinue}
                        className={`flex-1 h-16 rounded-[20px] font-bold text-[18px] flex items-center justify-center transition-all ${
                            (isValid || lastVerificationId) && !loading ? 'bg-[#04222D] text-white shadow-lg active:scale-[0.98]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                        }`}
                    >
                        {loading ? 'Processing...' : (lastVerificationId ? 'Already Verified' : 'Continue')}
                    </button>
                </div>
            </div>

            {/* ─── OVERLAY LAYER: Bottom Sheet Popup ─────────────────────────── */}
            <AnimatePresence>
                {showPopup && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/30 z-[90]"
                        />
                        
                        {/* Popup Card */}
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[48px] px-8 pt-10 pb-8 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-[22px] font-bold text-[#030303] mb-1">
                                        For easy form filling process
                                    </h2>
                                    <p className="text-[15px] text-[#71717B] font-medium">
                                        You keep the following documents handy
                                    </p>
                                </div>
                                <div className="w-16 h-16">
                                    <img 
                                        src="https://cdn-icons-png.flaticon.com/512/4201/4201971.png" 
                                        alt="Checklist" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>

                            <div className="w-full h-[1px] bg-[#F0F0F0] mb-8" />

                            <ul className="space-y-6 mb-10">
                                {['Aadhar Card', 'PAN CARD', 'GSTIN Number', 'Bank Details'].map((item) => (
                                    <li key={item} className="flex items-center gap-4">
                                        <div className="w-[10px] h-[10px] rounded-full bg-[#2563EB]" />
                                        <span className="text-[18px] font-bold text-[#030303]">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setShowPopup(false)}
                                className="w-full h-16 bg-[#04222D] text-white rounded-[20px] font-bold text-[18px] flex items-center justify-center active:scale-[0.98] transition-all shadow-xl"
                            >
                                Let&apos;s Begin
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AadhaarPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AadhaarContent />
        </Suspense>
    );
}
