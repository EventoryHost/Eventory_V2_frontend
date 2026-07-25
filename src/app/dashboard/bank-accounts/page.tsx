'use client';
import React, { useState, useEffect, useRef } from 'react';
import { apiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { X, CreditCard, Plus, Info, ArrowLeft, XCircle, CheckCircle2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import BankIcon from '@/components/BankIcon';

type ViewState = 'LIST' | 'ADD';

function BankAccountCard({ account, isPrimary, onSetPrimary, onRemove }: any) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const last4 = account.accountNumber?.slice(-4) || 'XXXX';
    const masked = `•••• ${last4}`;
    const bankName = account.bankName || 'Your Bank';

    return (
        <div className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 flex items-center justify-between mb-3 shadow-sm">
            <div className="flex items-center gap-4">
                <BankIcon 
                    bankName={bankName} 
                    className="w-[42px] h-[42px] bg-white border border-[#F4F4F5] dark:border-[#27272A] rounded-full shadow-sm p-1" 
                />
                <div className="flex flex-col justify-center">
                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] dark:text-white mb-0.5">
                        {bankName} {masked}
                    </h4>
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA]">
                        {isPrimary && (
                            <><span className="text-[#3B82F6] font-semibold tracking-wide uppercase">PRIMARY</span> - </>
                        )}
                        Account XXX {last4}
                    </span>
                </div>
            </div>
            
            <div ref={menuRef} className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F4F4F5] dark:hover:bg-[#27272A] transition-colors active:scale-95"
                >
                    <MoreVertical className="w-5 h-5 text-[#71717B] dark:text-[#A1A1AA]" strokeWidth={1.5} />
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-10 z-50 w-[200px] bg-[#2E2E2E] dark:bg-[#1E1E1B] border border-[#404040] dark:border-[#3F3F47] rounded-[12px] shadow-xl overflow-hidden py-1"
                        >
                            {!isPrimary && (
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onSetPrimary?.();
                                    }}
                                    className="w-full flex items-center px-4 py-3 text-left hover:bg-[#404040] dark:hover:bg-[#27272A] transition-colors"
                                >
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-medium text-white">
                                        Set as Primary
                                    </span>
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onRemove?.();
                                }}
                                className="w-full flex items-center px-4 py-3 text-left hover:bg-[#404040] dark:hover:bg-[#27272A] transition-colors"
                            >
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-medium text-[#F87171]">
                                    Remove Bank Account
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function BankAccountsPage() {
    const router = useRouter();
    const [view, setView] = useState<ViewState>('LIST');
    
    // List View State
    const [vendor, setVendor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [showMockData, setShowMockData] = useState(false);
    
    const bankAccounts = Array.isArray(vendor?.bankDetails) 
        ? vendor.bankDetails 
        : (vendor?.bankDetails?.accountNumber ? [vendor.bankDetails] : []);

    // Add View State
    const [accountNumber, setAccountNumber] = useState('');
    const [confirmAccount, setConfirmAccount] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [ifscResult, setIfscResult] = useState<string | null>(null);
    const [isCheckingIfsc, setIsCheckingIfsc] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Validation errors
    const [accError, setAccError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [ifscError, setIfscError] = useState('');

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
                
                const res = await fetch(apiUrl(`/vendors/${vendorId}`));
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
            
            
            const response = await fetch(apiUrl(`/verification/bank?vendor_id=${vendorId}`), {
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
                const newBankAccount = {
                    accountNumber: accountNumber,
                    ifscCode: ifsc,
                    bankName: data.accountDetails?.bank_name || "Verified Bank",
                    branchName: data.accountDetails?.branch || ifscResult || "Unknown Branch"
                };
                
                const currentBankAccounts = Array.isArray(vendor?.bankDetails) 
                    ? vendor.bankDetails 
                    : (vendor?.bankDetails?.accountNumber ? [vendor.bankDetails] : []);
                
                // Check if updating existing or adding new
                const existingIndex = currentBankAccounts.findIndex((acc: any) => acc.accountNumber === accountNumber && acc.ifscCode === ifsc);
                let updatedAccounts = [...currentBankAccounts];
                if (existingIndex >= 0) {
                    updatedAccounts[existingIndex] = { ...updatedAccounts[existingIndex], ...newBankAccount };
                } else {
                    updatedAccounts.push(newBankAccount);
                }
                
                // Optimistic update
                setVendor({ ...vendor, bankDetails: updatedAccounts });
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

    const isFormValid =
        accountNumber.length >= 9 &&
        accountNumber.length <= 18 &&
        /^\d+$/.test(accountNumber) &&
        confirmAccount === accountNumber &&
        /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc) &&
        !isVerifying;

    // Helper to mask account number
    const maskAccount = (acc: string) => {
        if (!acc || acc.length < 4) return '••••';
        return `•••• ${acc.slice(-4)}`;
    };

    const updateVendorBankDetails = async (newBankAccounts: any[]) => {
        try {
            const vendorId = localStorage.getItem('vendor_id') || 'placeholder_id';
            
            
            // Optimistic update
            setVendor({ ...vendor, bankDetails: newBankAccounts });
            
            const res = await fetch(apiUrl(`/vendors/${vendorId}`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bankDetails: newBankAccounts })
            });
            
            if (!res.ok) throw new Error("Failed to update");
        } catch (error) {
            console.error("Error updating bank details:", error);
            alert("Failed to update bank account. Please try again.");
        }
    };

    const handleSetPrimary = (index: number) => {
        if (index === 0 || index >= bankAccounts.length) return;
        const newBankAccounts = [...bankAccounts];
        const [selected] = newBankAccounts.splice(index, 1);
        newBankAccounts.unshift(selected); // Put at front
        updateVendorBankDetails(newBankAccounts);
    };

    const handleRemoveAccount = (index: number) => {
        const confirmDelete = window.confirm("Are you sure you want to remove this bank account?");
        if (!confirmDelete) return;
        
        const newBankAccounts = bankAccounts.filter((_: any, i: number) => i !== index);
        updateVendorBankDetails(newBankAccounts);
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
            <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center border-b border-[#E4E4E7] dark:border-[#27272A]">
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

                        {/* Real DB Bank Accounts (if exists) */}
                        {bankAccounts.length > 0 && bankAccounts.map((acc: any, index: number) => (
                            <BankAccountCard 
                                key={index} 
                                account={acc} 
                                isPrimary={index === 0} 
                                onSetPrimary={() => handleSetPrimary(index)}
                                onRemove={() => handleRemoveAccount(index)}
                            />
                        ))}

                        {/* Empty State when no bank account exists and mock data is off */}
                        {bankAccounts.length === 0 && !showMockData && (
                            <div className="flex flex-col items-center justify-center mt-[60px] pb-10 text-center">
                                <img src="https://dkuacgndftndz.cloudfront.net/Menu_Components/no%20bank.png" alt="No Bank Account" className="w-[247px] h-[247px] object-contain mb-6 mix-blend-multiply dark:mix-blend-normal" />
                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-2">No bank account linked yet</h3>
                                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] max-w-[260px] mb-6 leading-relaxed">
                                    Link your bank account to start receiving your confirmed booking payouts automatically.
                                </p>
                                <button 
                                    onClick={() => setView('ADD')} 
                                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                                    className="px-6 py-3 bg-[#04222D] dark:bg-[#E95A6E] text-white text-[13px] font-bold rounded-[8px] active:scale-95 transition-transform"
                                >
                                    Link Bank Account
                                </button>
                            </div>
                        )}

                        {/* Mock Accounts from screenshot */}
                        {showMockData && (
                            <>
                                <BankAccountCard 
                                    account={{ bankName: 'HDFC Bank', accountNumber: 'XXXX8829' }} 
                                    isPrimary={bankAccounts.length === 0} 
                                />
                                <BankAccountCard 
                                    account={{ bankName: 'HDFC Bank', accountNumber: 'XXXX8829' }} 
                                    isPrimary={false} 
                                />
                                <BankAccountCard 
                                    account={{ bankName: 'HDFC Bank', accountNumber: 'XXXX8829' }} 
                                    isPrimary={false} 
                                />
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
                                
                                {/* Account Number */}
                                <div>
                                    <input 
                                        type={accountNumber.length > 0 && confirmAccount.length > 0 ? "password" : "text"}
                                        value={accountNumber}
                                        inputMode="numeric"
                                        onChange={(e) => {
                                            // Strip all non-digit characters
                                            const digits = e.target.value.replace(/\D/g, '');
                                            setAccountNumber(digits);
                                            if (digits.length > 0 && digits.length < 9)
                                                setAccError('Account number must be at least 9 digits');
                                            else if (digits.length > 18)
                                                setAccError('Account number cannot exceed 18 digits');
                                            else
                                                setAccError('');
                                            // Re-validate confirm if already filled
                                            if (confirmAccount && confirmAccount !== digits)
                                                setConfirmError('Account numbers do not match');
                                            else
                                                setConfirmError('');
                                        }}
                                        placeholder="Bank account number"
                                        maxLength={18}
                                        className={`w-full h-[52px] px-4 rounded-[12px] border ${
                                            accError ? 'border-red-400 dark:border-red-500' : 'border-[#E4E4E7] dark:border-[#3F3F47]'
                                        } bg-white dark:bg-[#18181B] text-[#030303] dark:text-white focus:outline-none focus:border-[#030303] dark:focus:border-[#E4E4E7] placeholder:text-[#A1A1AA]`}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                    />
                                    {accError && (
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-medium text-red-500 mt-1.5 pl-1">{accError}</p>
                                    )}
                                </div>

                                {/* Confirm Account */}
                                <div>
                                    <input 
                                        type="text"
                                        value={confirmAccount}
                                        inputMode="numeric"
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, '');
                                            setConfirmAccount(digits);
                                            if (digits && digits !== accountNumber)
                                                setConfirmError('Account numbers do not match');
                                            else
                                                setConfirmError('');
                                        }}
                                        placeholder="Confirm account number"
                                        maxLength={18}
                                        className={`w-full h-[52px] px-4 rounded-[12px] border ${
                                            confirmError ? 'border-red-400 dark:border-red-500' : 'border-[#E4E4E7] dark:border-[#3F3F47]'
                                        } bg-white dark:bg-[#18181B] text-[#030303] dark:text-white focus:outline-none focus:border-[#030303] dark:focus:border-[#E4E4E7] placeholder:text-[#A1A1AA]`}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                    />
                                    {confirmError && (
                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-medium text-red-500 mt-1.5 pl-1">{confirmError}</p>
                                    )}
                                </div>
                                
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={ifsc}
                                        onChange={(e) => {
                                            // Allow only uppercase alphanumeric chars
                                            const val = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                                            setIfsc(val);
                                            if (val.length === 11) {
                                                if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(val))
                                                    setIfscError('Invalid IFSC format (e.g. SBIN0001234)');
                                                else
                                                    setIfscError('');
                                            } else if (val.length > 0) {
                                                setIfscError('');
                                            }
                                        }}
                                        placeholder="IFSC Code"
                                        maxLength={11}
                                        className={`w-full h-[52px] px-4 rounded-[12px] border ${
                                            ifscError ? 'border-red-400 dark:border-red-500' : 'border-[#E4E4E7] dark:border-[#3F3F47]'
                                        } bg-white dark:bg-[#18181B] text-[#030303] dark:text-white focus:outline-none focus:border-[#030303] dark:focus:border-[#E4E4E7] placeholder:text-[#A1A1AA] uppercase`}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                    />
                                    {ifsc.length > 0 && (
                                        <button 
                                            onClick={() => { setIfsc(''); setIfscError(''); setIfscResult(null); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#71717B] dark:text-[#A1A1AA]"
                                        >
                                            <XCircle className="w-5 h-5" strokeWidth={1.5} />
                                        </button>
                                    )}
                                </div>
                                {ifscError && (
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-medium text-red-500 mt-1.5 pl-1">{ifscError}</p>
                                )}

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
