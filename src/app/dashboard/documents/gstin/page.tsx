'use client';

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = 'http://localhost:4000/api';

function GSTINContent() {
    const router = useRouter();
    const [gstin, setGstin] = useState('');
    const [isIndividual, setIsIndividual] = useState(false);
    const [loading, setLoading] = useState(false);
    const [businessDetails, setBusinessDetails] = useState<any>(null);
    const [error, setError] = useState('');

    const handleVerifyGSTIN = async () => {
        if (gstin.length !== 15) return;
        setLoading(true);
        setError('');
        setBusinessDetails(null);

        // 🔹 Dummy bypass for testing
        if (/^0+$/.test(gstin) || gstin.toUpperCase() === 'DUMMYDUMMY') {
            const vendorId = localStorage.getItem('vendor_id');
            await fetch(`${API_BASE}/verification/GSTIN/${gstin.toUpperCase()}?vendor_id=${vendorId}`);
            setBusinessDetails({
                tradeName: 'Dummy Test Business',
                legalName: 'Dummy Business Pvt Ltd',
                pan: gstin.substring(2, 12),
                businessType: 'Proprietorship',
                address: '123 Dummy Street, Delhi'
            });
            setLoading(false);
            return;
        }

        try {
            const vendorId = localStorage.getItem('vendor_id');
            const res = await fetch(`${API_BASE}/verification/GSTIN/${gstin.toUpperCase()}?vendor_id=${vendorId}`);
            const data = await res.json();

            if (data.status === 'SUCCESS') {
                const details = data.originalResponse || {};
                setBusinessDetails({
                    tradeName: details.trade_name_of_business || details.legal_name_of_business || data.legal_name,
                    legalName: details.legal_name_of_business || data.legal_name,
                    pan: details.pan || (details.gstin ? details.gstin.substring(2, 12) : ''),
                    businessType: details.constitution_of_business || 'Proprietorship',
                    address: typeof details.principal_place_of_business_address === 'object' 
                        ? (details.principal_place_of_business_address.complete_address || details.address)
                        : (details.principal_place_of_business_address || details.address || 'Address not available')
                });
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Server error during verification');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        if (isIndividual) {
            try {
                const vendorId = localStorage.getItem('vendor_id');
                await fetch(`${API_BASE}/vendors/${vendorId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isIndividual: true })
                });
            } catch (err) { console.error("Failed to update individual status", err); }
        }
        router.push('/dashboard/documents/banking');
    };

    const isValid = gstin.length === 15;

    return (
        <div className="min-h-screen bg-white flex flex-col font-figtree">
            {/* Top Bar */}
            <div className="px-6 pt-12">
                <div className="w-full h-[6px] rounded-full bg-[#E5E5E5] mb-6 overflow-hidden">
                    <div className="h-full w-[85%] bg-[#031B24] rounded-full" />
                </div>
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-[#030303] text-[16px] font-semibold mb-8">
                    <ChevronLeft size={20} />
                    <span>Save & Exit</span>
                </button>
            </div>

            <div className="flex-1 px-6 pb-32">
                <h1 className="text-[#282934] text-[24px] font-semibold leading-[32px] mb-8">
                    What is your GSTIN number
                </h1>

                {!businessDetails && !loading && (
                    <div className="w-full aspect-[1.6/1] bg-[#F8F9FA] rounded-[32px] border border-[#E5E7EB] mb-12 relative flex items-center justify-center overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <img 
                            src="/images/gst_certificate_template.png" 
                            alt="GST Certificate" 
                            className="w-full h-full object-cover opacity-60"
                            onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/F8F9FA/999?text=GST+Certificate'}
                        />
                        <div className="absolute bottom-8 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border border-[#E5E7EB] shadow-xl">
                            <p className="text-[16px] font-bold tracking-[2px] text-[#030303] flex items-center gap-4">
                                <span className="text-[12px] font-medium tracking-normal text-[#71717B] uppercase opacity-60">GSTIN</span>
                                {gstin ? gstin.toUpperCase().padEnd(15, '•') : '12ABCD345E6F7'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-[14px] font-bold text-[#030303]">GSTIN number</p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="12ABCD345E6F7"
                            value={gstin}
                            maxLength={15}
                            onChange={(e) => setGstin(e.target.value.toUpperCase())}
                            className={`w-full px-5 py-5 border border-[#D1D5DB] rounded-2xl outline-none text-[20px] font-bold tracking-[4px] text-[#030303] focus:border-[#030303] transition-all bg-white placeholder:tracking-normal placeholder:text-[#9CA3AF] placeholder:font-normal ${businessDetails ? 'pr-24' : ''}`}
                        />
                        {businessDetails && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-green-500 font-bold text-[13px]">
                                <CheckCircle2 size={18} />
                                Verified
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {loading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-gray-500 py-2">
                                <Loader2 className="animate-spin" size={20} />
                                <span className="font-medium">Fetching Details</span>
                            </motion.div>
                        )}

                        {businessDetails && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6 pt-4"
                            >
                                <div>
                                    <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-1">Business Details</p>
                                    <p className="text-[18px] text-[#030303] font-bold">{businessDetails.tradeName || businessDetails.legalName || 'Rajan Tent Shop'}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-1">PAN Number</p>
                                    <p className="text-[18px] text-[#030303] font-bold">{businessDetails.pan || 'PTSWR9B76E'}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-1">Business Type</p>
                                    <p className="text-[18px] text-[#030303] font-bold">{businessDetails.businessType || 'Proprietorship'}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-1">Registered Business Address</p>
                                    <p className="text-[15px] text-[#030303] font-bold leading-relaxed max-w-[280px]">
                                        {businessDetails.address || 'Sector 4b B3, Pin code - 110085, Pritampura, Delhi'}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 px-1">
                            <p className="text-[13px] font-medium">{error}</p>
                        </div>
                    )}

                    {/* Individual Bypass */}
                    {!businessDetails && (
                        <div className="pt-4 space-y-4">
                            <p className="text-[14px] text-[#71717B] font-medium">Don&apos;t have a GSTIN Number</p>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        className="peer sr-only"
                                        checked={isIndividual}
                                        onChange={(e) => {
                                            setIsIndividual(e.target.checked);
                                            if (e.target.checked) {
                                                setGstin('');
                                                setError('');
                                            }
                                        }}
                                    />
                                    <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${isIndividual ? 'bg-[#030303] border-[#030303]' : 'border-[#D1D5DB] group-hover:border-[#030303]'}`}>
                                        {isIndividual && <div className="w-3 h-3 bg-white rounded-sm" />}
                                    </div>
                                </div>
                                <span className="text-[16px] font-bold text-[#030303]">I operate as an individual</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-6 py-5 flex items-center gap-4 z-40">
                <button onClick={() => router.back()} className="w-16 h-16 flex items-center justify-center rounded-[20px] bg-[#F3F4F6] border border-[#E5E7EB] active:scale-95 transition-all">
                    <ArrowLeft size={24} className="text-[#030303]" />
                </button>
                <button
                    disabled={(!isValid && !businessDetails && !isIndividual) || loading}
                    onClick={businessDetails || isIndividual ? handleContinue : handleVerifyGSTIN}
                    className={`flex-1 h-16 rounded-[20px] font-bold text-[18px] flex items-center justify-center transition-all ${(isValid || businessDetails || isIndividual) && !loading ? 'bg-[#04222D] text-white shadow-lg active:scale-[0.98]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
                >
                    {loading ? 'Processing...' : (businessDetails || isIndividual ? 'Continue' : 'Verify')}
                </button>
            </div>
        </div>
    );
}

export default function GSTINPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GSTINContent />
        </Suspense>
    );
}
