'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Clock, Calendar, Trash2, PlusCircle, Check } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface Step2AvailabilityProps {
    packageId: string | null;
    initialData?: any;
    onNext: () => void;
    onBack: () => void;
}

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAY_ITEMS = [
    { label: 'Mon', value: 'Monday' },
    { label: 'Tue', value: 'Tuesday' },
    { label: 'Wed', value: 'Wednesday' },
    { label: 'Thu', value: 'Thursday' },
    { label: 'Fri', value: 'Friday' },
    { label: 'Sat', value: 'Saturday' },
    { label: 'Sun', value: 'Sunday' },
];

const TIME_OPTIONS = [
    "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
    "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM",
    "12:00 AM"
];

const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
};

export default function Step2Availability({ packageId, initialData, onNext, onBack }: Step2AvailabilityProps) {
    const [selectedDays, setSelectedDays] = useState<string[]>(
        initialData?.weeklyAvailability?.length 
            ? initialData.weeklyAvailability 
            : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    );
    const [repeatType, setRepeatType] = useState<'30 DAYS' | '3 MONTHS' | 'CUSTOM'>(
        initialData?.repeatType || '30 DAYS'
    );
    const [customStart, setCustomStart] = useState<string>(
        initialData?.customDateRange?.startDate 
            ? new Date(initialData.customDateRange.startDate).toISOString().split('T')[0] 
            : ''
    );
    const [customEnd, setCustomEnd] = useState<string>(
        initialData?.customDateRange?.endDate 
            ? new Date(initialData.customDateRange.endDate).toISOString().split('T')[0] 
            : ''
    );
    const [workMode, setWorkMode] = useState<'FULL_DAY' | 'TIME_SLOTS'>(
        initialData?.workMode || 'FULL_DAY'
    );
    const [timeSlots, setTimeSlots] = useState<{ startTime: string; endTime: string }[]>(
        initialData?.timeSlots?.length ? initialData.timeSlots : [{ startTime: "10:00 AM", endTime: "02:00 PM" }]
    );
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            if (initialData.weeklyAvailability?.length) setSelectedDays(initialData.weeklyAvailability);
            if (initialData.repeatType) setRepeatType(initialData.repeatType);
            if (initialData.customDateRange) {
                if (initialData.customDateRange.startDate) {
                    setCustomStart(new Date(initialData.customDateRange.startDate).toISOString().split('T')[0]);
                }
                if (initialData.customDateRange.endDate) {
                    setCustomEnd(new Date(initialData.customDateRange.endDate).toISOString().split('T')[0]);
                }
            }
            if (initialData.workMode) setWorkMode(initialData.workMode);
            if (initialData.timeSlots?.length) setTimeSlots(initialData.timeSlots);
        }
    }, [initialData]);

    const isEverydaySelected = ALL_DAYS.every(day => selectedDays.includes(day));

    const handleEverydayToggle = () => {
        if (isEverydaySelected) {
            setSelectedDays([]);
        } else {
            setSelectedDays([...ALL_DAYS]);
        }
    };

    const handleDayToggle = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleSlotChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
        const updated = [...timeSlots];
        updated[index] = { ...updated[index], [field]: value };
        setTimeSlots(updated);
    };

    const addSlot = () => {
        const lastSlot = timeSlots[timeSlots.length - 1];
        let newStart = "02:00 PM";
        let newEnd = "06:00 PM";
        if (lastSlot && lastSlot.endTime === "02:00 PM") {
            newStart = "04:00 PM";
            newEnd = "08:00 PM";
        }
        setTimeSlots([...timeSlots, { startTime: newStart, endTime: newEnd }]);
    };

    const removeSlot = (index: number) => {
        if (timeSlots.length <= 1) return;
        setTimeSlots(timeSlots.filter((_, idx) => idx !== index));
    };

    const handleSaveAndContinue = async () => {
        if (selectedDays.length === 0) {
            alert("Please select at least one day of availability.");
            return;
        }

        if (repeatType === 'CUSTOM') {
            if (!customStart || !customEnd) {
                alert("Please pick both start and end dates for your custom date range.");
                return;
            }
            if (new Date(customStart) > new Date(customEnd)) {
                alert("Start date cannot be later than end date.");
                return;
            }
        }

        if (!packageId) {
            console.warn("No packageId provided. Proceeding to next step directly in local/mock mode.");
            onNext();
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                weeklyAvailability: selectedDays,
                repeatType,
                workMode,
            };

            if (repeatType === 'CUSTOM' && customStart && customEnd) {
                payload.customDateRange = {
                    startDate: new Date(customStart).toISOString(),
                    endDate: new Date(customEnd).toISOString(),
                };
            }

            if (workMode === 'TIME_SLOTS') {
                payload.timeSlots = timeSlots;
            }

            // Backend step 7 corresponds to "availabilitySettings"
            const res = await fetch(apiUrl(`/packages/${packageId}/step/7`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to save Availability details');
            }

            onNext();
        } catch (error: any) {
            console.error("Error saving availability step:", error);
            alert(error.message || "Something went wrong while saving. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12 w-full max-w-[480px] mx-auto" style={{ fontFamily: 'Figtree, sans-serif' }}>
            {/* Section 1: Weekly availability */}
            <div className="flex flex-col gap-3">
                <div>
                    <h2 className="text-[17px] font-bold text-[#04222D]">
                        Weekly availability
                    </h2>
                    <p className="text-[13.5px] text-[#71717B] mt-0.5">
                        Which days do you usually work?
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2.5 mt-1">
                    {/* Everyday pill */}
                    <button
                        type="button"
                        onClick={handleEverydayToggle}
                        className={`py-2 px-4.5 rounded-full font-semibold text-[14px] transition-all focus:outline-none ${
                            isEverydaySelected
                                ? 'bg-[#04222D] text-white shadow-xs'
                                : 'bg-[#EEF2F4] text-[#3F3F46] hover:bg-[#DCE0E5]'
                        }`}
                    >
                        Everyday
                    </button>

                    {/* Day pills */}
                    {DAY_ITEMS.map((item) => {
                        const isSelected = selectedDays.includes(item.value);
                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => handleDayToggle(item.value)}
                                className={`py-2 px-4.5 rounded-full font-semibold text-[14px] transition-all focus:outline-none ${
                                    isSelected
                                        ? 'bg-[#04222D] text-white shadow-xs'
                                        : 'bg-[#EEF2F4] text-[#3F3F46] hover:bg-[#DCE0E5]'
                                }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Section 2: Repeat Schedule */}
            <div className="flex flex-col gap-3">
                <h2 className="text-[17px] font-bold text-[#04222D]">
                    How long should this schedule repeat ?
                </h2>

                <div className="flex flex-col gap-2.5">
                    {/* Next 30 days option */}
                    <div
                        onClick={() => setRepeatType('30 DAYS')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            repeatType === '30 DAYS'
                                ? 'bg-[#EEF2F4] border-[#04222D] shadow-2xs text-[#04222D]'
                                : 'bg-white border-[#E4E4E7] text-[#27272A] hover:border-gray-300'
                        }`}
                    >
                        <span className="text-[15px] font-semibold">
                            Next 30 days
                        </span>
                        <div className={`w-[20px] h-[20px] rounded-[6px] flex items-center justify-center transition-all ${
                            repeatType === '30 DAYS'
                                ? 'bg-[#04222D] text-white'
                                : 'border-2 border-[#525252] bg-white'
                        }`}>
                            {repeatType === '30 DAYS' && <Check size={14} strokeWidth={3} />}
                        </div>
                    </div>

                    {/* Next 3 months option */}
                    <div
                        onClick={() => setRepeatType('3 MONTHS')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            repeatType === '3 MONTHS'
                                ? 'bg-[#EEF2F4] border-[#04222D] shadow-2xs text-[#04222D]'
                                : 'bg-white border-[#E4E4E7] text-[#27272A] hover:border-gray-300'
                        }`}
                    >
                        <span className="text-[15px] font-semibold">
                            Next 3 months
                        </span>
                        <div className={`w-[20px] h-[20px] rounded-[6px] flex items-center justify-center transition-all ${
                            repeatType === '3 MONTHS'
                                ? 'bg-[#04222D] text-white'
                                : 'border-2 border-[#525252] bg-white'
                        }`}>
                            {repeatType === '3 MONTHS' && <Check size={14} strokeWidth={3} />}
                        </div>
                    </div>

                    {/* Set custom date range option card */}
                    <div
                        onClick={() => setRepeatType('CUSTOM')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            repeatType === 'CUSTOM'
                                ? 'bg-[#F3F4F6] border-[#04222D] shadow-2xs'
                                : 'bg-white border-[#E4E4E7] hover:border-gray-300'
                        }`}
                    >
                        <span className={`text-[15px] font-semibold ${
                            repeatType === 'CUSTOM' ? 'text-[#04222D]' : 'text-[#27272A]'
                        }`}>
                            Set custom date range
                        </span>
                        <div className="w-7 h-7 bg-[#04222D] text-white rounded-lg flex items-center justify-center">
                            <Calendar size={17} />
                        </div>
                    </div>

                    {/* Separate Start & End Date boxes underneath when CUSTOM is selected */}
                    {repeatType === 'CUSTOM' && (
                        <div className="flex items-center gap-3 mt-1 animate-fadeIn">
                            {/* Start Date Box */}
                            <div className="flex-1 flex flex-col gap-1.5">
                                <label className="text-[13.5px] font-medium text-[#525252]">
                                    Start
                                </label>
                                <div className="bg-white border border-[#E4E4E7] rounded-[14px] px-4 py-3 flex items-center justify-between shadow-2xs cursor-pointer hover:border-[#04222D] transition-colors relative">
                                    <span className={customStart ? "text-[14.5px] font-bold text-[#04222D]" : "text-[14.5px] font-normal text-[#A1A1AA]"}>
                                        {customStart ? formatDisplayDate(customStart) : "Select"}
                                    </span>
                                    <Calendar size={18} className="text-[#A1A1AA]" />
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    />
                                </div>
                            </div>

                            {/* End Date Box */}
                            <div className="flex-1 flex flex-col gap-1.5">
                                <label className="text-[13.5px] font-medium text-[#525252]">
                                    End
                                </label>
                                <div className="bg-white border border-[#E4E4E7] rounded-[14px] px-4 py-3 flex items-center justify-between shadow-2xs cursor-pointer hover:border-[#04222D] transition-colors relative">
                                    <span className={customEnd ? "text-[14.5px] font-bold text-[#04222D]" : "text-[14.5px] font-normal text-[#A1A1AA]"}>
                                        {customEnd ? formatDisplayDate(customEnd) : "Select"}
                                    </span>
                                    <Calendar size={18} className="text-[#A1A1AA]" />
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 3: Work Mode */}
            <div className="flex flex-col gap-3">
                <h2 className="text-[17px] font-bold text-[#04222D]">
                    How do you usually work ?
                </h2>

                <div className="flex flex-col gap-3">
                    {/* Full-day availability Card */}
                    <div
                        onClick={() => setWorkMode('FULL_DAY')}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                            workMode === 'FULL_DAY'
                                ? 'bg-[#EEF2F4] border-[#04222D] shadow-xs'
                                : 'bg-white border-[#E4E4E7] hover:border-gray-300'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            workMode === 'FULL_DAY' ? 'bg-[#04222D] text-white' : 'bg-[#F4F4F5] text-[#27272A]'
                        }`}>
                            <Sun size={22} />
                        </div>
                        <div>
                            <h3 className={`text-[16px] font-bold mb-0.5 ${
                                workMode === 'FULL_DAY' ? 'text-[#04222D]' : 'text-[#27272A]'
                            }`}>
                                Full-day availibility
                            </h3>
                            <p className="text-[13.5px] text-[#71717B]">
                                Customers can book you for the entire day.
                            </p>
                        </div>
                    </div>

                    {/* Specific time slots Card */}
                    <div
                        onClick={() => setWorkMode('TIME_SLOTS')}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                            workMode === 'TIME_SLOTS'
                                ? 'bg-[#EEF2F4] border-[#04222D] shadow-xs'
                                : 'bg-white border-[#E4E4E7] hover:border-gray-300'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            workMode === 'TIME_SLOTS' ? 'bg-[#04222D] text-white' : 'bg-[#F4F4F5] text-[#27272A]'
                        }`}>
                            <Clock size={22} />
                        </div>
                        <div>
                            <h3 className={`text-[16px] font-bold mb-0.5 ${
                                workMode === 'TIME_SLOTS' ? 'text-[#04222D]' : 'text-[#27272A]'
                            }`}>
                                Specific time slots
                            </h3>
                            <p className="text-[13.5px] text-[#71717B]">
                                Customers can book you within selected hours.
                            </p>
                        </div>
                    </div>

                    {/* Working Hours Editor when Specific time slots is selected */}
                    {workMode === 'TIME_SLOTS' && (
                        <div className="bg-[#FAFBFD] border border-[#E4E4E7] rounded-2xl p-5 flex flex-col gap-4 mt-1 shadow-2xs">
                            <h3 className="text-[15px] font-bold text-[#04222D]">
                                Set your working hours
                            </h3>

                            <div className="flex flex-col gap-3">
                                {timeSlots.map((slot, idx) => (
                                    <div key={idx} className="flex items-center gap-2.5">
                                        <select
                                            value={slot.startTime}
                                            onChange={(e) => handleSlotChange(idx, 'startTime', e.target.value)}
                                            className="flex-1 bg-white border border-[#E4E4E7] rounded-xl py-2.5 px-3 text-[15px] font-semibold text-[#27272A] text-center focus:outline-none focus:border-[#04222D] shadow-2xs"
                                        >
                                            {TIME_OPTIONS.map((time) => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>

                                        <span className="text-[#A1A1AA] font-bold text-lg px-1">
                                            —
                                        </span>

                                        <select
                                            value={slot.endTime}
                                            onChange={(e) => handleSlotChange(idx, 'endTime', e.target.value)}
                                            className="flex-1 bg-white border border-[#E4E4E7] rounded-xl py-2.5 px-3 text-[15px] font-semibold text-[#27272A] text-center focus:outline-none focus:border-[#04222D] shadow-2xs"
                                        >
                                            {TIME_OPTIONS.map((time) => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => removeSlot(idx)}
                                            disabled={timeSlots.length <= 1}
                                            className="text-[#EF4444] hover:text-[#DC2626] p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none shrink-0"
                                            title="Delete time slot"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addSlot}
                                className="flex items-center gap-2 text-[#04222D] hover:text-black font-bold text-[14.5px] mt-1 transition-colors focus:outline-none w-fit"
                            >
                                <PlusCircle size={18} />
                                <span>Add another time slot</span>
                            </button>
                        </div>
                    )}
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
