'use client';
import { apiUrl } from '@/lib/api';

import React, { useState, Suspense, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
    ChevronLeft, 
    ArrowLeft, 
    Search as SearchIcon, 
    X as XIcon, 
    Info as InfoIcon, 
    CheckCircle2 as SuccessIcon, 
    ChevronRight,
    Loader2,
    Banknote
} from 'lucide-react';

const API_BASE = apiUrl('');

// Professional list of major Indian banks and their codes
const MAJOR_BANKS = [
    { name: "HDFC Bank", code: "HDFC" },
    { name: "State Bank of India", code: "SBIN" },
    { name: "ICICI Bank", code: "ICIC" },
    { name: "Axis Bank", code: "UTIB" },
    { name: "Bank of Baroda", code: "BARB" },
    { name: "Punjab National Bank", code: "PUNB" },
    { name: "Canara Bank", code: "CNRB" },
    { name: "Kotak Mahindra Bank", code: "KKBK" },
    { name: "IndusInd Bank", code: "INDB" },
    { name: "Union Bank of India", code: "UBIN" },
    { name: "IDBI Bank", code: "IBKL" },
    { name: "Yes Bank", code: "YESB" }
];

function BankingContent() {
    const router = useRouter();
    const [accountNumber, setAccountNumber] = useState('');
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [confirmAccount, setConfirmAccount] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Search State
    const [showIfscSearch, setShowIfscSearch] = useState(false);
    const [searchStep, setSearchStep] = useState<'bank' | 'branch'>('bank');
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [bankBranches, setBankBranches] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    // Fetch bank branches when a bank is selected
    useEffect(() => {
        if (selectedBank && searchStep === 'branch') {
            const fetchBranches = async () => {
                setIsLoadingData(true);
                try {
                    // Fetching from Razorpay's official IFSC dataset (RBI sourced)
                    const res = await fetch(`https://raw.githubusercontent.com/razorpay/ifsc-api/master/data/${selectedBank.code}.json`);
                    const data = await res.json();
                    // Convert object to array for easier searching
                    const branches = Object.entries(data).map(([ifsc, details]: any) => ({
                        ifsc,
                        ...details
                    }));
                    setBankBranches(branches);
                } catch (err) {
                    console.error('Failed to fetch bank data', err);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchBranches();
        }
    }, [selectedBank, searchStep]);

    // Local search within the selected bank's branches
    const filteredResults = useMemo(() => {
        if (searchStep === 'bank') {
            return MAJOR_BANKS.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
        } else {
            if (!searchTerm) return bankBranches.slice(0, 20); // Show first 20 by default
            return bankBranches.filter(b => 
                b.BRANCH.toLowerCase().includes(searchTerm.toLowerCase()) || 
                b.ADDRESS?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.ifsc.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 50); // Limit results for performance
        }
    }, [searchTerm, bankBranches, searchStep]);

    const handleVerifyBank = async () => {
        if (!beneficiaryName.trim()) {
            setError('Beneficiary name is required');
            return;
        }
        if (accountNumber !== confirmAccount) {
            setError('Account numbers do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const vendorName = localStorage.getItem('vendor_name') || 'Vendor';
            const vendorId = localStorage.getItem('vendor_id');
            const res = await fetch(`${API_BASE}/verification/bank`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bank_account: accountNumber,
                    ifsc: ifsc,
                    name: beneficiaryName.trim(),
                    vendor_id: vendorId
                })
            });
            const data = await res.json();
            if (data.status === 'SUCCESS' || data.subCode === '200') {
                router.push('/dashboard?onboarding_complete=true');
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (err) {
            setError('Server error during verification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-figtree pb-32">
            {/* Top Bar */}
            <div className="px-6 pt-12">
                <div className="w-full h-[6px] rounded-full bg-[#E5E5E5] mb-6 overflow-hidden">
                    <div className="h-full w-full bg-[#031B24] rounded-full" />
                </div>
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1 text-[#030303] text-[16px] font-semibold mb-8">
                    <ChevronLeft size={20} />
                    <span>Save & Exit</span>
                </button>
            </div>

            <div className="flex-1 px-6 max-w-[400px] mx-auto w-full">
                <h1 className="text-[#282934] text-[24px] font-semibold leading-[32px] mb-6">
                    Your Banking Details
                </h1>

                {/* Info Box */}
                <div className="bg-[#F4F4F5] rounded-[12px] p-4 flex gap-3 mb-8 border border-transparent">
                    <InfoIcon size={20} className="text-[#3F3F47] shrink-0 mt-0.5" />
                    <p className="text-[#3F3F47] text-[14px] font-medium leading-[20px]">
                        Bank account should be in the name of registered business or trade name as per GSTIN
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Beneficiary Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-bold text-[#030303]">Beneficiary Name</label>
                        <input
                            type="text"
                            placeholder="Name as per bank account"
                            value={beneficiaryName}
                            onChange={(e) => setBeneficiaryName(e.target.value)}
                            className="w-full px-5 py-4 border border-[#D1D5DB] rounded-2xl outline-none text-[16px] font-medium text-[#030303] focus:border-[#030303] transition-all bg-white placeholder:text-[#9CA3AF]"
                        />
                    </div>

                    {/* Account Number */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[14px] font-bold text-[#030303]">Account Number</label>
                        <input
                            type="text"
                            placeholder="Bank account Number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-5 py-4 border border-[#D1D5DB] rounded-2xl outline-none text-[16px] font-medium text-[#030303] focus:border-[#030303] transition-all bg-white placeholder:text-[#9CA3AF]"
                        />
                    </div>

                    {/* Confirm Account Number */}
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Confirm account number"
                            value={confirmAccount}
                            onChange={(e) => setConfirmAccount(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-5 py-4 border border-[#D1D5DB] rounded-2xl outline-none text-[16px] font-medium text-[#030303] focus:border-[#030303] transition-all bg-white placeholder:text-[#9CA3AF]"
                        />
                    </div>

                    {/* IFSC Code */}
                    <div className="flex flex-col gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="IFSC Code"
                                value={ifsc}
                                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                                className="w-full px-5 py-4 border border-[#D1D5DB] rounded-2xl outline-none text-[16px] font-medium text-[#030303] focus:border-[#030303] transition-all bg-white placeholder:text-[#9CA3AF] uppercase tracking-wider"
                            />
                        </div>
                        <button 
                            onClick={() => {
                                setShowIfscSearch(true);
                                setSearchStep('bank');
                                setSearchTerm('');
                            }}
                            className="text-[#2563EB] text-[14px] font-bold self-start mt-1 active:opacity-70 transition-all"
                        >
                            Don&apos;t remember IFSC Code? <span className="underline">Find IFSC Code</span>
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-red-500 text-[13px] font-medium leading-relaxed">{error}</p>
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
                    disabled={!beneficiaryName || !accountNumber || !confirmAccount || !ifsc || loading}
                    onClick={handleVerifyBank}
                    className={`flex-1 h-16 rounded-[20px] font-bold text-[18px] flex items-center justify-center transition-all ${beneficiaryName && accountNumber && confirmAccount && ifsc && !loading ? 'bg-[#04222D] text-white shadow-lg active:scale-[0.98]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
                >
                    {loading ? 'Verifying...' : 'Continue'}
                </button>
            </div>

            {/* IFSC Search Bottom Sheet */}
            <AnimatePresence>
                {showIfscSearch && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-[2px]"
                            onClick={() => setShowIfscSearch(false)}
                        />
                        <motion.div 
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[101] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-8 pb-6 bg-white shrink-0">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        {searchStep === 'branch' && (
                                            <button 
                                                onClick={() => {
                                                    setSearchStep('bank');
                                                    setSearchTerm('');
                                                    setBankBranches([]);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                            >
                                                <ArrowLeft size={22} className="text-[#282934]" />
                                            </button>
                                        )}
                                        <h2 className="text-[22px] font-bold text-[#282934]">
                                            {searchStep === 'bank' ? 'Select Bank' : selectedBank?.name}
                                        </h2>
                                    </div>
                                    <button onClick={() => setShowIfscSearch(false)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full active:scale-90 transition-all">
                                        <XIcon size={20} className="text-gray-400" />
                                    </button>
                                </div>

                                <div className="relative">
                                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="text" 
                                        placeholder={searchStep === 'bank' ? "Search bank name..." : "Search branch or city (e.g. Munirka)..."}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5E7EB] rounded-2xl outline-none text-[16px] font-medium text-[#282934] focus:border-[#282934] shadow-sm transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto px-6 pb-12 custom-scrollbar min-h-[400px]">
                                {isLoadingData ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="animate-spin text-[#031B24]" size={40} />
                                        <p className="text-[#3F3F47] font-semibold text-[16px]">Fetching Official Records...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredResults.length > 0 ? (
                                            filteredResults.map((item: any, idx: number) => (
                                                <button 
                                                    key={searchStep === 'bank' ? item.code : item.ifsc}
                                                    onClick={() => {
                                                        if (searchStep === 'bank') {
                                                            setSelectedBank(item);
                                                            setSearchStep('branch');
                                                            setSearchTerm('');
                                                        } else {
                                                            setIfsc(item.ifsc);
                                                            setShowIfscSearch(false);
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-5 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between group transition-all rounded-xl"
                                                >
                                                    <div className="flex flex-col pr-4">
                                                        <span className="text-[17px] font-bold text-[#3F3F47] group-hover:text-[#282934] transition-colors">
                                                            {searchStep === 'bank' ? item.name : item.BRANCH}
                                                        </span>
                                                        {searchStep === 'branch' && (
                                                            <div className="flex flex-col mt-1">
                                                                <span className="text-[13px] text-gray-400 font-medium leading-tight mb-1">{item.ADDRESS}</span>
                                                                <span className="text-[13px] text-[#2563EB] font-bold tracking-wider">{item.ifsc}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 shrink-0" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="text-center py-20">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <SearchIcon size={24} className="text-gray-300" />
                                                </div>
                                                <p className="text-gray-400 font-bold text-[16px]">No results found for &quot;{searchTerm}&quot;</p>
                                                <p className="text-gray-400 text-[14px]">Try searching with a broader name</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-white/95 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-[340px] bg-white border border-gray-100 rounded-[40px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                <SuccessIcon size={40} className="text-green-500" />
                            </div>
                            <h2 className="text-[22px] font-bold text-[#030303] mb-3">Verification successful!</h2>
                            <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-8">
                                Your identity and banking documents have been verified. You can now proceed to add your packages.
                            </p>
                            <button 
                                onClick={() => router.push('/dashboard')}
                                className="w-full py-5 bg-[#031B24] text-white rounded-2xl font-bold text-[16px] active:scale-[0.98] transition-all shadow-xl"
                            >
                                Let&apos;s Begin
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
            `}</style>
        </div>
    );
}

export default function BankingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BankingContent />
        </Suspense>
    );
}
