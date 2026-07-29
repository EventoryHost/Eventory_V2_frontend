'use client';

import React, { useState, useEffect } from 'react';
import { Info, Minus, Plus } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface Step1BookingTypeProps {
    packageId: string | null;
    initialData?: any;
    onNext: () => void;
    onBack: () => void;
}

export default function Step1BookingType({ packageId, initialData, onNext, onBack }: Step1BookingTypeProps) {
    const [bookingType, setBookingType] = useState<'Ready-to-Book' | 'Enquiry/Quote'>(
        initialData?.bookingType || 'Ready-to-Book'
    );
    const [paymentType, setPaymentType] = useState<'Free' | 'Token'>(
        initialData?.paymentType || 'Token'
    );
    const [tokenType, setTokenType] = useState<'Percentage' | 'Fixed'>(
        initialData?.token?.tokenType || 'Percentage'
    );
    const [tokenPercentage, setTokenPercentage] = useState<number>(
        initialData?.token?.tokenType === 'Percentage' && initialData?.token?.value !== undefined
            ? initialData.token.value
            : 30
    );
    const [tokenFixedAmount, setTokenFixedAmount] = useState<string>(
        initialData?.token?.tokenType === 'Fixed' && initialData?.token?.value !== undefined
            ? Number(initialData.token.value).toLocaleString('en-IN')
            : '2,000'
    );
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            if (initialData.bookingType) setBookingType(initialData.bookingType);
            if (initialData.paymentType) setPaymentType(initialData.paymentType);
            if (initialData.token) {
                if (initialData.token.tokenType) setTokenType(initialData.token.tokenType);
                if (initialData.token.value !== undefined) {
                    if (initialData.token.tokenType === 'Percentage') {
                        setTokenPercentage(initialData.token.value);
                    } else {
                        setTokenFixedAmount(Number(initialData.token.value).toLocaleString('en-IN'));
                    }
                }
            }
        }
    }, [initialData]);

    const handlePercentageChange = (delta: number) => {
        setTokenPercentage(prev => Math.min(100, Math.max(0, prev + delta)));
    };

    const handleFixedAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        if (raw === '') {
            setTokenFixedAmount('');
            return;
        }
        const num = parseInt(raw, 10);
        setTokenFixedAmount(num.toLocaleString('en-IN'));
    };

    const handleSaveAndContinue = async () => {
        if (!packageId) {
            console.warn("No packageId provided. Proceeding to next step directly in local/mock mode.");
            onNext();
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                bookingType,
            };

            if (bookingType === 'Ready-to-Book') {
                payload.paymentType = paymentType;
                if (paymentType === 'Token') {
                    payload.token = {
                        tokenType,
                        value: tokenType === 'Percentage' 
                            ? tokenPercentage 
                            : parseInt(tokenFixedAmount.replace(/[^0-9]/g, ''), 10) || 0,
                    };
                }
            }

            const res = await fetch(apiUrl(`/packages/${packageId}/step/5`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to save Booking Type details');
            }

            onNext();
        } catch (error: any) {
            console.error("Error saving booking type step:", error);
            alert(error.message || "Something went wrong while saving. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[480px] mx-auto" style={{ fontFamily: 'Figtree, sans-serif' }}>
            {/* Question 1: Booking Method */}
            <div className="flex flex-col gap-3">
                <h2 className="text-[17px] font-bold text-[#04222D]">
                    How can customers book you?
                </h2>
                <div className="flex flex-col gap-3">
                    {/* Book Instantly Card */}
                    <div
                        onClick={() => setBookingType('Ready-to-Book')}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                            bookingType === 'Ready-to-Book'
                                ? 'bg-[#EEF2F4] border-[#04222D] shadow-xs'
                                : 'bg-white border-[#E4E4E7] hover:border-gray-300'
                        }`}
                    >
                        <h3 className={`text-[16px] font-bold mb-1 ${
                            bookingType === 'Ready-to-Book' ? 'text-[#04222D]' : 'text-[#27272A]'
                        }`}>
                            Book Instantly
                        </h3>
                        <p className="text-[13.5px] text-[#71717B]">
                            Customers can directly book your service
                        </p>
                    </div>

                    {/* Enquiry First Card */}
                    <div
                        onClick={() => setBookingType('Enquiry/Quote')}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                            bookingType === 'Enquiry/Quote'
                                ? 'bg-[#EEF2F4] border-[#04222D] shadow-xs'
                                : 'bg-white border-[#E4E4E7] hover:border-gray-300'
                        }`}
                    >
                        <h3 className={`text-[16px] font-bold mb-1 ${
                            bookingType === 'Enquiry/Quote' ? 'text-[#04222D]' : 'text-[#27272A]'
                        }`}>
                            Enquiry First
                        </h3>
                        <p className="text-[13.5px] text-[#71717B]">
                            Customers will contact you before booking
                        </p>
                    </div>
                </div>
            </div>

            {/* Question 2: Payment Type (Only when Book Instantly is chosen) */}
            {bookingType === 'Ready-to-Book' && (
                <div className="flex flex-col gap-3">
                    <h2 className="text-[17px] font-bold text-[#04222D]">
                        How do you want the booking to be ?
                    </h2>

                    <div className="flex flex-col gap-3">
                        {/* Free Booking Radio Card */}
                        <div
                            onClick={() => setPaymentType('Free')}
                            className={`p-5 rounded-2xl cursor-pointer transition-all border flex items-start gap-3.5 ${
                                paymentType === 'Free'
                                    ? 'bg-white border-[#04222D] shadow-xs'
                                    : 'bg-white border-[#E4E4E7] hover:border-gray-300'
                            }`}
                        >
                            <div className="mt-1 flex-shrink-0">
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    paymentType === 'Free' ? 'border-[#04222D] border-2' : 'border-[#A1A1AA]'
                                }`}>
                                    {paymentType === 'Free' && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#04222D]" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[15.5px] font-bold text-[#04222D] mb-1">
                                    Free Booking
                                </h3>
                                <p className="text-[13px] text-[#71717B]">
                                    Customers will book directly without token amount
                                </p>
                            </div>
                        </div>

                        {/* Token amount for booking Radio Card */}
                        <div
                            className={`p-5 rounded-2xl transition-all border flex flex-col gap-4 ${
                                paymentType === 'Token'
                                    ? 'bg-white border-[#04222D] shadow-xs'
                                    : 'bg-white border-[#E4E4E7]'
                            }`}
                        >
                            <div 
                                onClick={() => setPaymentType('Token')} 
                                className="flex items-start gap-3.5 cursor-pointer"
                            >
                                <div className="mt-1 flex-shrink-0">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                        paymentType === 'Token' ? 'border-[#04222D] border-2' : 'border-[#A1A1AA]'
                                    }`}>
                                        {paymentType === 'Token' && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#04222D]" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[15.5px] font-bold text-[#04222D] mb-1">
                                        Token amount for booking
                                    </h3>
                                    <p className="text-[13px] text-[#71717B]">
                                        Customers will pay small amount to confirm the booking
                                    </p>
                                </div>
                            </div>

                            {/* Controls appear inside when Token payment type is active */}
                            {paymentType === 'Token' && (
                                <div className="flex flex-col mt-1 pt-2 border-t border-transparent">
                                    {/* Segmented Switcher */}
                                    <div className="flex bg-[#F1F3F5] p-1.5 rounded-xl gap-1 mb-5">
                                        <button
                                            type="button"
                                            onClick={() => setTokenType('Percentage')}
                                            className={`flex-1 py-2 text-[13.5px] font-semibold rounded-lg transition-all ${
                                                tokenType === 'Percentage'
                                                    ? 'bg-white text-[#04222D] shadow-xs'
                                                    : 'text-[#71717B] hover:text-[#3F3F46]'
                                            }`}
                                        >
                                            Percentage
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTokenType('Fixed')}
                                            className={`flex-1 py-2 text-[13.5px] font-semibold rounded-lg transition-all ${
                                                tokenType === 'Fixed'
                                                    ? 'bg-white text-[#04222D] shadow-xs'
                                                    : 'text-[#71717B] hover:text-[#3F3F46]'
                                            }`}
                                        >
                                            Fixed amount
                                        </button>
                                    </div>

                                    {/* Percentage Input Controls */}
                                    {tokenType === 'Percentage' ? (
                                        <div className="flex flex-col gap-2 mb-5">
                                            <label className="text-[13px] text-[#52525B] font-medium">
                                                Enter Advance amount percentage(%)
                                            </label>
                                            <div className="flex items-center justify-between border border-[#E4E4E7] rounded-xl px-4 py-2 bg-white">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePercentageChange(-5)}
                                                    className="w-8 h-8 flex items-center justify-center text-[#71717B] hover:text-[#04222D] transition-colors focus:outline-none"
                                                >
                                                    <Minus size={18} />
                                                </button>
                                                <div className="flex items-center text-[18px] font-bold text-[#04222D]">
                                                    <input
                                                        type="number"
                                                        value={tokenPercentage}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value, 10);
                                                            if (isNaN(val)) setTokenPercentage(0);
                                                            else setTokenPercentage(Math.min(100, Math.max(0, val)));
                                                        }}
                                                        className="w-12 text-center bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-bold text-[18px] text-[#04222D]"
                                                    />
                                                    <span>%</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handlePercentageChange(5)}
                                                    className="w-8 h-8 flex items-center justify-center text-[#71717B] hover:text-[#04222D] transition-colors focus:outline-none"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Fixed Amount Input Controls */
                                        <div className="flex flex-col gap-2 mb-5">
                                            <label className="text-[13px] text-[#52525B] font-medium">
                                                Enter advance amount
                                            </label>
                                            <div className="flex items-center border border-[#E4E4E7] rounded-xl overflow-hidden bg-white focus-within:border-[#04222D]">
                                                <div className="bg-[#F4F4F5] px-4 py-3 border-r border-[#E4E4E7] text-[#71717B] font-semibold text-[16px]">
                                                    ₹
                                                </div>
                                                <input
                                                    type="text"
                                                    value={tokenFixedAmount}
                                                    onChange={handleFixedAmountChange}
                                                    placeholder="0"
                                                    className="w-full px-4 py-2 text-[17px] font-bold text-[#04222D] focus:outline-none bg-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Note Box */}
                                    <div className="bg-[#EEF5FD] border border-[#DCE8F8] text-[#2D5B99] rounded-xl p-3.5 flex items-start gap-2.5">
                                        <Info size={17} className="text-[#3A76C4] shrink-0 mt-0.5" />
                                        <span className="text-[12.5px] font-medium leading-normal text-[#274B80]">
                                            Maximum of 10% of Package price can be taken as token amount.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 mt-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSaving}
                    className="flex-1 py-3.5 px-6 rounded-[14px] border border-[#04222D] bg-white text-[#04222D] font-bold text-[15px] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleSaveAndContinue}
                    disabled={isSaving}
                    className="flex-1 py-3.5 px-6 rounded-[14px] bg-[#04222D] text-white font-bold text-[15px] hover:bg-opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        'Save & Continue'
                    )}
                </button>
            </div>
        </div>
    );
}
