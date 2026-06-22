'use client';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const PasswordInput = ({ label, value, onChange, show, setShow, hint }: any) => (
    <div className="mb-6">
        <label style={{ fontFamily: 'Figtree, sans-serif' }} className="block text-[12px] font-bold text-[#71717B] dark:text-[#A1A1AA] uppercase tracking-wider mb-2">
            {label}
        </label>
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                placeholder="Placeholder"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ fontFamily: 'Figtree, sans-serif' }}
                className="w-full p-4 pr-12 bg-white dark:bg-[#1E1E1B] border border-[#E4E4E7] dark:border-[#27272A] rounded-[12px] text-[15px] font-medium text-[#030303] dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 placeholder:text-[#9F9FA9] dark:placeholder:text-[#52525B] transition-colors"
            />
            <button 
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] dark:text-[#71717B]"
            >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
        </div>
        {hint && (
            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#A1A1AA] dark:text-[#71717B] mt-2 ml-1">
                {hint}
            </p>
        )}
    </div>
);

export default function ChangePasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const handleUpdate = () => {
        // Here we would normally call the backend API.
        // Since it doesn't exist yet, we just show success.
        setIsSuccessModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 pt-8 px-5 transition-colors duration-300">
            <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white mb-8 px-1 transition-colors">Change Password</h1>

            <PasswordInput 
                label="Current Password" 
                value={currentPassword} 
                onChange={setCurrentPassword} 
                show={showCurrent} 
                setShow={setShowCurrent} 
            />

            <PasswordInput 
                label="New Password" 
                value={newPassword} 
                onChange={setNewPassword} 
                show={showNew} 
                setShow={setShowNew} 
                hint="At least 8 characters, one number, one special character."
            />

            <PasswordInput 
                label="Confirm New Password" 
                value={confirmPassword} 
                onChange={setConfirmPassword} 
                show={showConfirm} 
                setShow={setShowConfirm} 
            />

            <div className="mt-8 flex flex-col items-center">
                <button 
                    onClick={handleUpdate}
                    style={{ fontFamily: 'Figtree, sans-serif' }}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                    className="w-full bg-[#04222D] dark:bg-[#E95A6E] text-white font-bold py-4 rounded-[16px] text-[15px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md mb-5"
                >
                    Update Password
                </button>
                
                <Link href="/dashboard/settings/forgot-password" style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#3F3F47] dark:text-[#A1A1AA] hover:opacity-80 transition-opacity">
                    Forgot Password
                </Link>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {isSuccessModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white dark:bg-[#1E1E1B] w-full max-w-[340px] rounded-[28px] p-7 flex flex-col items-center text-center shadow-2xl"
                        >
                            <div className="w-[72px] h-[72px] rounded-full bg-[#10B981] flex items-center justify-center mb-5 shadow-[0_4px_20px_rgba(16,185,129,0.3)]">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white mb-3 leading-tight">Password Changed Successfully</h3>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] mb-8 leading-relaxed font-medium px-2">Your account security has been updated. Please use your new password for all future logins.</p>
                            
                            <button 
                                onClick={() => {
                                    setIsSuccessModalOpen(false);
                                    router.push('/dashboard/settings');
                                }}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="flex justify-center items-center gap-4 w-full py-[16px] px-[32px] bg-[#04222D] dark:bg-[#E95A6E] text-white font-bold rounded-[8px] text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
                            >
                                Back to Settings
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
