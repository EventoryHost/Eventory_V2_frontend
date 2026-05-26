'use client';
import { apiUrl } from '@/lib/api';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = apiUrl('');

function PANContent() {
    const router = useRouter();
    const [pan, setPan] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifiedName, setVerifiedName] = useState('');
    const [error, setError] = useState('');

    const handleVerifyPAN = async () => {
        if (pan.length !== 10) return;
        setLoading(true);
        setError('');

        // 🔹 Dummy bypass for testing
        if (/^0+$/.test(pan) || pan.toUpperCase() === 'DUMMYDUMMY') {
            const vendorId = localStorage.getItem('vendor_id');
            await fetch(`${API_BASE}/verification/pan-gstin/${pan.toUpperCase()}?vendor_id=${vendorId}`);
            setVerifiedName('Dummy Test User');
            setLoading(false);
            return;
        }

        try {
            const vendorId = localStorage.getItem('vendor_id');
            const res = await fetch(`${API_BASE}/verification/pan-gstin/${pan.toUpperCase()}?vendor_id=${vendorId}`);
            const data = await res.json();

            if (data.status === 'SUCCESS') {
                setVerifiedName(data.name || data.registered_name || 'Verified');
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Server error during verification');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        router.push('/dashboard/documents/gstin');
    };

    const isValid = pan.length === 10;

    return (
        <div className="min-h-screen bg-white flex flex-col font-figtree">
            {/* Top Bar */}
            <div className="px-6 pt-12">
                <div className="w-full h-[6px] rounded-full bg-[#E5E5E5] mb-6 overflow-hidden">
                    <div className="h-full w-[70%] bg-[#031B24] rounded-full" />
                </div>
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-[#030303] text-[16px] font-semibold mb-8">
                    <ChevronLeft size={20} />
                    <span>Save & Exit</span>
                </button>
            </div>

            <div className="flex-1 px-6">
                <h1 className="text-[#282934] text-[24px] font-semibold leading-[32px] mb-8">
                    What is your PAN card number
                </h1>

                {/* Card Template */}
                <div className="w-full aspect-[1.6/1] bg-[#F8F9FA] rounded-[32px] border border-[#E5E7EB] mb-12 relative flex items-center justify-center overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <img 
                        src="/images/pan_card_template.png" 
                        alt="PAN Card" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/F8F9FA/999?text=PAN+Card'}
                    />
                    <div className="absolute bottom-8 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border border-[#E5E7EB] shadow-xl">
                        <p className="text-[16px] font-bold tracking-[3px] text-[#030303] flex items-center gap-4">
                            <span className="text-[12px] font-medium tracking-normal text-[#71717B] uppercase opacity-60">PAN no.</span>
                            {pan ? pan.toUpperCase().padEnd(10, '•') : 'ABCDE1234F'}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-[14px] font-bold text-[#030303]">PAN card number</p>
                    <input
                        type="text"
                        placeholder="ABCDE1234F"
                        value={pan}
                        maxLength={10}
                        onChange={(e) => setPan(e.target.value.toUpperCase())}
                        className="w-full px-5 py-5 border border-[#D1D5DB] rounded-2xl outline-none text-[20px] font-bold tracking-[4px] text-[#030303] focus:border-[#030303] transition-all bg-white placeholder:tracking-normal placeholder:text-[#9CA3AF] placeholder:font-normal"
                    />
                    {error && <p className="text-red-500 text-[13px] font-medium">{error}</p>}

                    <AnimatePresence>
                        {verifiedName && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100"
                            >
                                <CheckCircle2 className="text-green-500" size={20} />
                                <div>
                                    <p className="text-[12px] text-green-600 font-bold uppercase tracking-wider">Verified Name</p>
                                    <p className="text-[16px] text-green-900 font-bold">{verifiedName}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-6 py-5 flex items-center gap-4">
                <button onClick={() => router.back()} className="w-16 h-16 flex items-center justify-center rounded-[20px] bg-[#F3F4F6] border border-[#E5E7EB] active:scale-95 transition-all">
                    <ArrowLeft size={24} className="text-[#030303]" />
                </button>
                <button
                    disabled={!isValid || loading}
                    onClick={verifiedName ? handleContinue : handleVerifyPAN}
                    className={`flex-1 h-16 rounded-[20px] font-bold text-[18px] flex items-center justify-center transition-all ${isValid && !loading ? 'bg-[#04222D] text-white shadow-lg active:scale-[0.98]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
                >
                    {loading ? 'Verifying...' : (verifiedName ? 'Continue' : 'Verify')}
                </button>
            </div>
        </div>
    );
}

export default function PANPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PANContent />
        </Suspense>
    );
}
