'use client';

import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface Step4BookingCapacityProps {
    packageId: string | null;
    initialData?: any;
    onNext: () => void;
    onBack: () => void;
}

export default function Step4BookingCapacity({ packageId, initialData, onNext, onBack }: Step4BookingCapacityProps) {
    const [dailyCapacity, setDailyCapacity] = useState<number>(initialData?.dailyCapacity || 1);
    const [simultaneousBookings, setSimultaneousBookings] = useState<number>(initialData?.simultaneousBookings || 1);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveAndContinue = async () => {
        if (!packageId) {
            onNext();
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                dailyCapacity,
                simultaneousBookings,
            };

            const res = await fetch(apiUrl(`/packages/${packageId}/step/8`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save Booking Capacity');

            onNext();
        } catch (error: any) {
            alert(error.message || "Something went wrong while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[480px] mx-auto" style={{ fontFamily: 'Figtree, sans-serif' }}>
            
            {/* Daily Capacity */}
            <div className="flex flex-col gap-3">
                <h2 className="text-[17px] font-bold text-[#04222D]">
                    What is your daily booking capacity
                </h2>
                <p className="text-[13.5px] text-[#A1A1AA] font-medium -mt-2 leading-relaxed pr-4">
                    The maximum number of total events you can accept in a single day
                </p>
                
                <div className="flex items-center justify-between border border-[#E4E4E7] rounded-xl px-4 py-3 mt-2">
                    <button 
                        type="button"
                        onClick={() => setDailyCapacity(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#04222D] text-[#04222D] hover:bg-gray-50 transition-colors"
                    >
                        <Minus size={16} strokeWidth={2.5} />
                    </button>
                    <span className="text-[16px] font-bold text-[#04222D]">
                        {dailyCapacity}
                    </span>
                    <button 
                        type="button"
                        onClick={() => setDailyCapacity(prev => prev + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#04222D] text-[#04222D] hover:bg-gray-50 transition-colors"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Simultaneous Bookings */}
            <div className="flex flex-col gap-3">
                <h2 className="text-[17px] font-bold text-[#04222D]">
                    How many simultaneous bookings can you take ?
                </h2>
                <p className="text-[13.5px] text-[#A1A1AA] font-medium -mt-2 leading-relaxed pr-4">
                    The number of separate events you can actively execute at the exact same time
                </p>
                
                <div className="flex items-center justify-between border border-[#E4E4E7] rounded-xl px-4 py-3 mt-2">
                    <button 
                        type="button"
                        onClick={() => setSimultaneousBookings(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#04222D] text-[#04222D] hover:bg-gray-50 transition-colors"
                    >
                        <Minus size={16} strokeWidth={2.5} />
                    </button>
                    <span className="text-[16px] font-bold text-[#04222D]">
                        {simultaneousBookings}
                    </span>
                    <button 
                        type="button"
                        onClick={() => setSimultaneousBookings(prev => prev + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-[#04222D] text-[#04222D] hover:bg-gray-50 transition-colors"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 mt-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSaving}
                    className="flex-1 py-3.5 px-6 rounded-[14px] border border-[#04222D] bg-white text-[#04222D] font-bold text-[15px] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 focus:outline-none"
                >
                    Back
                </button>
                <button
                    type="button"
                    onClick={handleSaveAndContinue}
                    disabled={isSaving}
                    className="flex-1 py-3.5 px-6 rounded-[14px] bg-[#04222D] text-white font-bold text-[15px] hover:bg-opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70 focus:outline-none"
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
