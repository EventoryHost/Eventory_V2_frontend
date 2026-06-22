'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, CreditCard, Plus, Info, ArrowLeft, XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';

type ViewState = 'LIST' | 'ADD';

export default function BankAccountsPage() {
    const router = useRouter();
    const [view, setView] = useState<ViewState>('LIST');
    
    // List View State
    const [vendor, setVendor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [showMockData, setShowMockData] = useState(false);
    
    // Add View State
    const [accountNumber, setAccountNumber] = useState('');
    const [confirmAccount, setConfirmAccount] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [ifscResult, setIfscResult] = useState<string | null>(null);
    const [isCheckingIfsc, setIsCheckingIfsc] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                const res = await fetch(`${baseUrl}/vendors/${vendorId}`);
                if (res.ok) {
                    const responseJson = await res.json();
                    setVendor(responseJson.data || responseJson);
                }
            } catch (error) {
                console.error("Failed to fetch vendor", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendor();
    }, []);

    // Mock IFSC check
    useEffect(() => {
        if (ifsc.length === 11) {
            setIsCheckingIfsc(true);
            setTimeout(() => {
                if (ifsc.toUpperCase() === 'SBIN0002416') {
                    setIfscResult('Manali, Himachal pradesh');
                } else {
                    setIfscResult('Valid IFSC Branch Name'); // generic success for mockup
                }
                setIsCheckingIfsc(false);
            }, 500);
        } else {
            setIfscResult(null);
        }
    }, [ifsc]);

    const handleSaveBank = async () => {
        if (accountNumber !== confirmAccount) {
            alert("Account numbers do not match.");
            return;
        }
        
        setIsVerifying(true);
        try {
            const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
            
            const response = await fetch(`${baseUrl}/verification/bank?vendor_id=${vendorId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bank_account: accountNumber,
                    ifsc: ifsc,
                    name: vendor?.businessName || vendor?.pocName || "Vendor Name",
                    phone: vendor?.phone || ""
                })
            });

            const data = await response.json();
            
            if (response.ok && data.status === "SUCCESS") {
                const bankDetails = {
                    accountNumber: accountNumber,
                    ifscCode: ifsc,
                    bankName: data.accountDetails?.bank_name || "Verified Bank",
                    branchName: data.accountDetails?.branch || ifscResult || "Unknown Branch"
                };
                
                // Optimistic update
                setVendor({ ...vendor, bankDetails });
                setView('LIST');
                
                // Clear form
                setAccountNumber('');
                setConfirmAccount('');
                setIfsc('');
            } else {
                alert(data.message || data.error?.message || "Bank account could not be verified. Please check details.");
            }
        } catch (error) {
            console.error("Failed to verify bank details", error);
            alert("Failed to verify bank details due to a network error.");
        } finally {
            setIsVerifying(false);
        }
    };

    const isFormValid = accountNumber.length > 5 && confirmAccount === accountNumber && ifsc.length === 11 && !isVerifying;

    // Helper to mask account number
    const maskAccount = (acc: string) => {
        if (!acc || acc.length < 4) return '••••';
        return `•••• ${acc.slice(-4)}`;
    };

    if (isLoading && view === 'LIST') {
        return (
            <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#E95A6E] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center border-b border-transparent">
                <h1 
                    onDoubleClick={() => setShowMockData(!showMockData)}
                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                    className="text-[20px] font-bold text-[#030303] dark:text-white cursor-pointer select-none"
                    title="Double click to toggle real/mock data"
                >
                    {view === 'LIST' ? 'Bank Account' : 'Add New Bank Account'}
                </h1>
                <button 
                    onClick={() => view === 'LIST' ? router.push('/dashboard/menu') : setView('LIST')} 
                    className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform"
                >
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {view === 'LIST' ? (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-5 mt-4"
                    >
                        <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white mb-2">Bank Accounts</h2>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] leading-relaxed mb-6">
                            Your confirmed booking payouts are currently directed to your selected primary account.
                        </p>

                        {/* Real DB Bank Account (if exists) */}
                        {vendor?.bankDetails?.accountNumber && (
                            <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 flex items-center justify-between mb-3 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F4F4F5] dark:bg-[#27272A] flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] dark:text-white mb-0.5">
                                            {vendor.bankDetails.bankName || "Your Bank"} {maskAccount(vendor.bankDetails.accountNumber)}
                                        </h4>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA]">
                                            Account {maskAccount(vendor.bankDetails.accountNumber)}
                                        </span>
                                    </div>
                                </div>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 text-[#3B82F6] dark:text-[#60A5FA] text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider">
                                    PRIMARY
                                </span>
                            </div>
                        )}

                        {/* Empty State when no bank account exists and mock data is off */}
                        {!vendor?.bankDetails?.accountNumber && !showMockData && (
                            <div className="bg-white dark:bg-[#1E1E1B] border border-dashed border-[#E4E4E7] dark:border-[#3F3F47] rounded-[16px] p-8 flex flex-col items-center justify-center mb-6 text-center">
                                <div className="w-12 h-12 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center mb-4">
                                    <CreditCard className="w-6 h-6 text-[#A1A1AA]" strokeWidth={1.5} />
                                </div>
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-2">No bank accounts yet</h3>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] max-w-[200px]">
                                    Add a bank account to receive your payouts securely.
                                </p>
                            </div>
                        )}

                        {/* Mock Accounts from screenshot */}
                        {showMockData && (
                            <>
                                <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 flex items-center justify-between mb-3 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F4F4F5] dark:bg-[#27272A] flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] dark:text-white mb-0.5">
                                                HDFC Bank •••• 8829
                                            </h4>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA]">
                                                Account •••• 8829
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717B] dark:text-[#A1A1AA] text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider">
                                        {!vendor?.bankDetails?.accountNumber ? 'PRIMARY' : 'LINKED'}
                                    </span>
                                </div>

                                <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 flex items-center justify-between mb-3 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F4F4F5] dark:bg-[#27272A] flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] dark:text-white mb-0.5">
                                                PNB Bank •••• 4593
                                            </h4>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA]">
                                                Account •••• 4593
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717B] dark:text-[#A1A1AA] text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider">
                                        LINKED
                                    </span>
                                </div>

                                <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 flex items-center justify-between mb-6 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F4F4F5] dark:bg-[#27272A] flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] dark:text-white mb-0.5">
                                                SBI Bank •••• 2168
                                            </h4>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA]">
                                                Account •••• 2168
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="bg-[#F4F4F5] dark:bg-[#27272A] text-[#71717B] dark:text-[#A1A1AA] text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider">
                                        LINKED
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Add New Bank Account Button */}
                        <button 
                            onClick={() => setView('ADD')}
                            className="w-full bg-white dark:bg-[#1E1E1B] border border-dashed border-[#E4E4E7] dark:border-[#3F3F47] rounded-[16px] p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#27272A]/50 transition-colors active:scale-[0.98]"
                        >
                            <div className="w-[42px] h-[42px] rounded-full border border-dashed border-[#3B82F6] dark:border-[#60A5FA] flex items-center justify-center bg-[#EFF6FF] dark:bg-[#1E3A8A]/20">
                                <Plus className="w-5 h-5 text-[#3B82F6] dark:text-[#60A5FA]" strokeWidth={2} />
                            </div>
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                                Add New Bank Account
                            </span>
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="add"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="px-5 mt-4 flex flex-col min-h-[calc(100vh-120px)]"
                    >
                        <div className="flex-1">
                            <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white mb-6">Your Banking Details</h2>
                            
                            {/* Info Box */}
                            <div className="bg-[#F4F4F5] dark:bg-[#27272A] rounded-[12px] p-4 flex gap-3 mb-8">
                                <Info className="w-5 h-5 text-[#71717B] dark:text-[#A1A1AA] shrink-0 mt-0.5" strokeWidth={1.5} />
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47] dark:text-[#E4E4E7] leading-relaxed">
                                    Bank account should be in the name of registered business or trade name as per GSTIN
                                </p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47] dark:text-[#E4E4E7] mb-2">Account Number</h3>
                                
                                <input 
                                    type={accountNumber.length > 0 && confirmAccount.length > 0 ? "password" : "text"}
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="Bank account Number"
                                    className="w-full h-[52px] px-4 rounded-[12px] border border-[#E4E4E7] dark:border-[#3F3F47] bg-white dark:bg-[#18181B] text-[#030303] dark:text-white focus:outline-none focus:border-[#030303] dark:focus:border-[#E4E4E7] placeholder:text-[#A1A1AA]"
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                />
                                
                                <input 
                                    type="text"
                                    value={confirmAccount}
                                    onChange={(e) => setConfirmAccount(e.target.value)}
                                    placeholder="Confirm account number"
                                    className="w-full h-[52px] px-4 rounded-[12px] border border-[#E4E4E7] dark:border-[#3F3F47] bg-white dark:bg-[#18181B] text-[#030303] dark:text-white focus:outline-none focus:border-[#030303] dark:focus:border-[#E4E4E7] placeholder:text-[#A1A1AA]"
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                />
                                
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={ifsc}
                                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                                        placeholder="IFSC Code"
                                        maxLength={11}
                                        className="w-full h-[52px] px-4 rounded-[12px] border border-[#E4E4E7] dark:border-[#3F3F47] bg-white dark:bg-[#18181B] text-[#030303] dark:text-white focus:outline-none focus:border-[#030303] dark:focus:border-[#E4E4E7] placeholder:text-[#A1A1AA] uppercase"
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                    />
                                    {ifsc.length > 0 && (
                                        <button 
                                            onClick={() => setIfsc('')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#71717B] dark:text-[#A1A1AA]"
                                        >
                                            <XCircle className="w-5 h-5" strokeWidth={1.5} />
                                        </button>
                                    )}
                                </div>

                                {/* IFSC Result */}
                                <AnimatePresence>
                                    {ifscResult && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-2 mt-2 px-1"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#10B981]">{ifscResult}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="pt-2">
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#3F3F47] dark:text-[#A1A1AA] font-medium">
                                        Don't remember IFSC Code? <button className="text-[#3B82F6] dark:text-[#60A5FA]">Find IFSC Code</button>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex gap-4 pt-6 pb-8">
                            <button 
                                onClick={() => setView('LIST')}
                                className="w-[56px] h-[56px] shrink-0 border border-[#E4E4E7] dark:border-[#3F3F47] rounded-[12px] flex items-center justify-center bg-white dark:bg-[#18181B] active:scale-95 transition-transform"
                            >
                                <ArrowLeft className="w-6 h-6 text-[#3F3F47] dark:text-[#E4E4E7]" strokeWidth={1.5} />
                            </button>
                            <button 
                                onClick={handleSaveBank}
                                disabled={!isFormValid}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`flex-1 h-[56px] rounded-[12px] text-[16px] font-bold transition-all active:scale-[0.98] flex items-center justify-center
                                    ${isFormValid 
                                        ? 'bg-[#04222D] dark:bg-[#E95A6E] text-white' 
                                        : 'bg-[#94A3B8] dark:bg-[#475569] text-white/90 cursor-not-allowed'
                                    }`}
                            >
                                {isVerifying ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Continue'
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {view === 'LIST' && <BottomNav />}
        </div>
    );
}
