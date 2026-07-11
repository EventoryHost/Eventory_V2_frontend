'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarIcon, Umbrella, CheckCircle2 } from 'lucide-react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function DailyViewPage() {
    const params = useParams();
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState<Date>(() => {
        try {
            return parseISO(params.date as string);
        } catch {
            return new Date();
        }
    });

    const [isLoading, setIsLoading] = useState(true);
    const [todayBlocks, setTodayBlocks] = useState<any[]>([]);
    const [todayBookings, setTodayBookings] = useState<any[]>([]);
    
    // Bottom Sheet States
    const [sheetState, setSheetState] = useState<'none' | 'action' | 'holidayForm' | 'offlineForm' | 'success' | 'unblockConfirm' | 'unblockSuccess' | 'offlineSuccess' | 'incompletePackage'>('none');
    const [unblockTargetId, setUnblockTargetId] = useState<string | null>(null);
    const [hStartDate, setHStartDate] = useState(format(currentDate, 'yyyy-MM-dd'));
    const [hEndDate, setHEndDate] = useState(format(currentDate, 'yyyy-MM-dd'));
    const [hReason, setHReason] = useState('Holiday');
    const [hDescription, setHDescription] = useState('');

    // Offline Booking States
    const [oStartDate, setOStartDate] = useState(format(currentDate, 'yyyy-MM-dd'));
    const [oEndDate, setOEndDate] = useState(format(currentDate, 'yyyy-MM-dd'));
    const [oStartTime, setOStartTime] = useState('10:00 AM');
    const [oEndTime, setOEndTime] = useState('10:00 PM');
    const [oServiceType, setOServiceType] = useState('Decorator');
    const [oEventName, setOEventName] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') || 'placeholder_id' : 'placeholder_id';
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

    const fetchDailyData = useCallback(async (date: Date) => {
        setIsLoading(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const [scheduleRes, bookingsRes] = await Promise.all([
                fetch(`${baseUrl}/calendar/vendor/${vendorId}/schedule?date=${dateStr}`),
                fetch(`${baseUrl}/bookings/vendor/${vendorId}?startDate=${dateStr}&endDate=${dateStr}&limit=100`)
            ]);

            const scheduleData = await scheduleRes.json();
            const bookingsData = await bookingsRes.json();

            if (scheduleData.status === 'SUCCESS') setTodayBlocks(scheduleData.todaySchedule?.items || []);
            if (bookingsData.status === 'SUCCESS') setTodayBookings(bookingsData.bookings || []);

        } catch (error) {
            console.error("Error fetching daily data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [vendorId, baseUrl]);

    useEffect(() => {
        fetchDailyData(currentDate);
        setHStartDate(format(currentDate, 'yyyy-MM-dd'));
        setHEndDate(format(currentDate, 'yyyy-MM-dd'));
        setOStartDate(format(currentDate, 'yyyy-MM-dd'));
        setOEndDate(format(currentDate, 'yyyy-MM-dd'));
    }, [currentDate, fetchDailyData]);

    const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
    const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));

    const handleMarkHoliday = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`${baseUrl}/calendar/vendor/${vendorId}/block/holiday`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: hStartDate,
                    endDate: hEndDate,
                    reason: hReason
                })
            });
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                setSheetState('success');
                fetchDailyData(currentDate);
            } else {
                alert(data.message || 'Error marking holiday');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOfflineBooking = async () => {
        setIsSubmitting(true);
        try {
            const serviceTypeMap: Record<string, string> = {
                'Decorator': 'Decorator',
                'Caterer': 'Caterer',
                'DJ Artist': 'DJArtist',
                'Photographer and Videographer': 'PAV',
                'Makeup Artist': 'MakeupArtist',
                'Venue Provider': 'VenueProvider'
            };
            const mappedServiceType = serviceTypeMap[oServiceType] || 'Decorator';

            const res = await fetch(`${baseUrl}/calendar/vendor/${vendorId}/block/offline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: oStartDate,
                    endDate: oEndDate,
                    startTime: oStartTime,
                    endTime: oEndTime,
                    eventName: oEventName || 'Offline Event',
                    serviceType: mappedServiceType
                })
            });
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                setSheetState('offlineSuccess');
                fetchDailyData(currentDate);
            } else {
                alert(data.message || 'Error creating offline booking');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmUnblock = async () => {
        if (!unblockTargetId) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${baseUrl}/calendar/block/${unblockTargetId}/unblock`, {
                method: 'PUT'
            });
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                setSheetState('unblockSuccess');
                fetchDailyData(currentDate);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const holidayBlock = todayBlocks.find(b => b.blockType === 'Holiday');
    const offlineBlock = todayBlocks.find(b => b.blockType !== 'Holiday');
    const hasNoSchedule = todayBlocks.length === 0 && todayBookings.length === 0;

    return (
        <div className="min-h-screen bg-white dark:bg-[#09090B] font-sans flex flex-col">
            {/* Header Sticky */}
            <div className="bg-white dark:bg-[#09090B] sticky top-0 z-30 pt-12 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <div className="px-5 flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-gray-700 dark:text-gray-300 p-2 -ml-2">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                            {format(currentDate, 'EEEE')}
                        </span>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {format(currentDate, 'd MMMM, yyyy')}
                        </h1>
                    </div>
                    <button onClick={handleNextDay} className="text-gray-700 dark:text-gray-300 p-2 -mr-2">
                        <ArrowRight size={22} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-5">
                {isLoading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : holidayBlock ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                        <div className="w-28 h-28 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center mb-6 text-7xl shadow-inner">🏝️</div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Date Blocked as holiday</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 max-w-[280px] leading-relaxed">You marked this day as a personal holiday, sick day, or for travel reasons.</p>
                        <button 
                            onClick={() => {
                                setUnblockTargetId(holidayBlock._id);
                                setSheetState('unblockConfirm');
                            }}
                            className="w-full max-w-[300px] bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px]"
                        >
                            Set date as Available
                        </button>
                    </div>
                ) : offlineBlock && todayBookings.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                        <div className="w-28 h-28 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-6 relative">
                            <div className="absolute text-6xl">🤝</div>
                            <div className="absolute -top-1 right-2 text-3xl">📄</div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Date blocked</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 max-w-[250px] leading-relaxed">Date was blocked due to an offline event</p>
                        <button 
                            onClick={() => {
                                setUnblockTargetId(offlineBlock._id);
                                setSheetState('unblockConfirm');
                            }}
                            className="w-full max-w-[300px] bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px]"
                        >
                            Set date as available
                        </button>
                    </div>
                ) : hasNoSchedule ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center -mt-20">
                        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6 relative">
                            {/* Graphic mimicking the image */}
                            <div className="absolute text-5xl">📅</div>
                            <div className="absolute -top-1 right-3 text-2xl text-red-500">📌</div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings today</h2>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[220px]">
                            You're all clear. Stay open for new clients or take the day off.
                        </p>
                    </div>
                ) : (
                    <div className="flex-1">
                        {/* If there are bookings, render them here. For brevity, relying on main dashboard view. */}
                        <p className="text-center text-gray-500 mt-10">You have {todayBookings.length} bookings and {todayBlocks.length} blocks today.</p>
                        <button 
                            onClick={() => router.back()} 
                            className="mt-4 text-[#04222D] dark:text-white underline font-bold w-full text-center"
                        >
                            View details on main calendar
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Button (Only shown if no bookings, based on screenshot) */}
            {hasNoSchedule && !isLoading && (
                <div className="p-5 pb-8 bg-white dark:bg-[#09090B]">
                    <button 
                        onClick={() => setSheetState('action')}
                        className="w-full bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px] shadow-lg"
                    >
                        Block Date
                    </button>
                </div>
            )}

            {/* Bottom Sheets Modal Overlays */}
            <AnimatePresence>
                {sheetState !== 'none' && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="fixed inset-0 bg-black/40 z-[60]"
                            onClick={() => setSheetState('none')}
                        />
                        <motion.div 
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} 
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#121214] rounded-t-3xl z-[70] overflow-hidden shadow-2xl"
                        >
                            {sheetState === 'action' && (
                                <div className="p-6 pb-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Set Availability</p>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {format(currentDate, 'EEEE d MMMM')}
                                            </h3>
                                        </div>
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">✕</button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => setSheetState('offlineForm')}
                                            className="w-full flex items-center p-4 border border-gray-100 dark:border-gray-800 rounded-2xl gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                                <CalendarIcon size={18} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">Offline booking block date</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">Mark day unavailable</p>
                                            </div>
                                        </button>
                                        
                                        <button 
                                            onClick={() => setSheetState('holidayForm')}
                                            className="w-full flex items-center p-4 border border-gray-100 dark:border-gray-800 rounded-2xl gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl flex items-center justify-center shrink-0">
                                                <Umbrella size={18} />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-bold text-gray-900 dark:text-white text-[15px]">Mark as Holiday</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">Block the date for personal reasons</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {sheetState === 'offlineForm' && (
                                <div className="p-6 pb-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add offline booking</h3>
                                            <p className="text-xs text-gray-500 mt-1">A booking made outside the app</p>
                                        </div>
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">✕</button>
                                    </div>

                                    <div className="flex gap-3 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Start Date</label>
                                            <input type="date" value={oStartDate} onChange={e => setOStartDate(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm dark:bg-[#121214] dark:text-white focus:ring-2 focus:ring-[#04222D] outline-none" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">End Date</label>
                                            <input type="date" value={oEndDate} onChange={e => setOEndDate(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm dark:bg-[#121214] dark:text-white focus:ring-2 focus:ring-[#04222D] outline-none" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mb-6">
                                        <div className="flex-1 min-w-0">
                                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">Start Time</label>
                                            <select value={oStartTime} onChange={e => setOStartTime(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm dark:bg-[#121214] dark:text-white focus:ring-2 focus:ring-[#04222D] outline-none">
                                                <option value="10:00 AM">10:00 AM</option>
                                                <option value="11:20 AM">11:20 AM</option>
                                                <option value="12:00 PM">12:00 PM</option>
                                            </select>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">End Time</label>
                                            <select value={oEndTime} onChange={e => setOEndTime(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm dark:bg-[#121214] dark:text-white focus:ring-2 focus:ring-[#04222D] outline-none">
                                                <option value="04:00 PM">04:00 PM</option>
                                                <option value="08:00 PM">08:00 PM</option>
                                                <option value="10:00 PM">10:00 PM</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="text-[11px] font-bold text-gray-900 dark:text-white mb-3 block">What service for this event</label>
                                        <div className="space-y-3">
                                            {['Decorator', 'Caterer', 'DJ Artist', 'Photographer and Videographer'].map(srv => (
                                                <label key={srv} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${oServiceType === srv ? 'bg-[#04222D] border-[#04222D]' : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'}`}>
                                                        {oServiceType === srv && <CheckCircle2 size={14} className="text-white" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{srv}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 block">Reason</label>
                                        <textarea 
                                            placeholder="Event reason..."
                                            value={oEventName}
                                            onChange={e => setOEventName(e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm dark:bg-[#121214] dark:text-white resize-none h-20 focus:ring-2 focus:ring-[#04222D] outline-none"
                                        ></textarea>
                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">Helper Text according to input field.</p>
                                    </div>

                                    <button 
                                        onClick={handleOfflineBooking}
                                        disabled={isSubmitting || !oEventName}
                                        className={`w-full rounded-xl py-3.5 font-bold text-[15px] transition-colors ${oEventName ? 'bg-[#04222D] text-white' : 'bg-gray-200 text-gray-400'}`}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Continue'}
                                    </button>
                                </div>
                            )}

                            {sheetState === 'holidayForm' && (
                                <div className="p-6 pb-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Mark as Holiday</h3>
                                            <p className="text-xs text-gray-500 mt-1">Block the date for personal reasons</p>
                                        </div>
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">✕</button>
                                    </div>
                                    
                                    <div className="flex gap-3 mb-6">
                                        <div className="flex-1 min-w-0">
                                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">Start Date</label>
                                            <input 
                                                type="date" 
                                                value={hStartDate}
                                                onChange={e => setHStartDate(e.target.value)}
                                                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm dark:bg-[#121214] dark:text-white font-medium focus:ring-2 focus:ring-[#04222D] outline-none"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">End Date</label>
                                            <input 
                                                type="date" 
                                                value={hEndDate}
                                                onChange={e => setHEndDate(e.target.value)}
                                                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm dark:bg-[#121214] dark:text-white font-medium focus:ring-2 focus:ring-[#04222D] outline-none"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 block uppercase tracking-wider">
                                            Reason <span className="bg-gray-200 dark:bg-gray-700 w-3 h-3 inline-flex items-center justify-center rounded-full text-[8px] ml-1">?</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Holiday', 'Sick', 'Travel', 'Others'].map(r => (
                                                <button 
                                                    key={r}
                                                    onClick={() => setHReason(r)}
                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                        hReason === r 
                                                            ? 'bg-[#04222D] text-white border border-[#04222D]' 
                                                            : 'bg-white dark:bg-[#121214] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-8">
                                        <textarea 
                                            placeholder="Description"
                                            value={hDescription}
                                            onChange={e => setHDescription(e.target.value)}
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm dark:bg-[#121214] dark:text-white resize-none h-24 focus:ring-2 focus:ring-[#04222D] outline-none"
                                        ></textarea>
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">This date will have no packages available and will be marked as unavailable to customers.</p>
                                    </div>
                                    
                                    <button 
                                        onClick={handleMarkHoliday}
                                        disabled={isSubmitting}
                                        className="w-full bg-[#04222D] text-white rounded-xl py-3.5 font-bold disabled:opacity-70 text-[15px]"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Mark as Holiday'}
                                    </button>
                                </div>
                            )}

                            {sheetState === 'success' && (
                                <div className="p-6 pt-12 pb-10 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="absolute top-6 right-6 z-10">
                                        <button onClick={() => {
                                            setSheetState('none');
                                            router.back();
                                        }} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">✕</button>
                                    </div>
                                    <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 opacity-70 -z-10" style={{ background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 60%)' }}></div>
                                    <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center text-white mb-6 shadow-[0_0_25px_rgba(34,197,94,0.3)]">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 max-w-[200px] leading-snug">
                                        {format(currentDate, 'EEEE d MMMM yyyy')} marked holiday
                                    </h3>
                                    <button 
                                        onClick={() => {
                                            setSheetState('none');
                                            router.back(); // Take them back to calendar since they blocked the date
                                        }}
                                        className="w-full bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px]"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}

                            {sheetState === 'unblockConfirm' && (
                                <div className="p-6 pt-12 pb-10 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="absolute top-6 right-6 z-10">
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">✕</button>
                                    </div>
                                    <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center mb-6 text-6xl shadow-[0_0_25px_rgba(249,115,22,0.15)] relative">
                                        <span className="absolute -left-2 top-6 text-2xl text-orange-400">✨</span>
                                        <span className="absolute right-0 bottom-4 text-2xl text-orange-400">✨</span>
                                        🔓
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Are you sure to Unblock Date?</h3>
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-8 max-w-[250px] leading-relaxed">
                                        You will now receive online bookings, and this data will be deleted. The date will be available in the calendar.
                                    </p>
                                    <button 
                                        onClick={confirmUnblock}
                                        disabled={isSubmitting}
                                        className="w-full bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px] disabled:opacity-70"
                                    >
                                        {isSubmitting ? 'Unblocking...' : 'Unblock Date'}
                                    </button>
                                </div>
                            )}

                            {sheetState === 'unblockSuccess' && (
                                <div className="p-6 pt-12 pb-10 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="absolute top-6 right-6 z-10">
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">✕</button>
                                    </div>
                                    <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 opacity-70 -z-10" style={{ background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 60%)' }}></div>
                                    <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center text-white mb-6 shadow-[0_0_25px_rgba(34,197,94,0.3)]">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 max-w-[200px] leading-snug">
                                        {format(currentDate, 'EEEE d MMMM')} Marked available for bookings
                                    </h3>
                                    <button 
                                        onClick={() => setSheetState('none')}
                                        className="w-full bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px]"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}

                            {sheetState === 'incompletePackage' && (
                                <div className="p-6 pt-12 pb-10 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="absolute top-6 right-6 z-10">
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">✕</button>
                                    </div>
                                    <div className="w-24 h-24 bg-yellow-50 dark:bg-yellow-900/10 rounded-full flex items-center justify-center mb-6 text-6xl shadow-[0_0_25px_rgba(234,179,8,0.15)] relative">
                                        <span className="absolute text-yellow-500">💬</span>
                                        <span className="absolute top-4 text-3xl text-white">!</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Some packages are incomplete</h3>
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-8 max-w-[250px] leading-relaxed">
                                        You started <strong>Standard Package</strong> but didn't complete it
                                    </p>
                                    <button 
                                        onClick={() => setSheetState('none')}
                                        className="w-full bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px]"
                                    >
                                        Unblock Date
                                    </button>
                                </div>
                            )}

                            {sheetState === 'offlineSuccess' && (
                                <div className="p-6 pt-12 pb-10 flex flex-col items-center text-center relative overflow-hidden">
                                    <div className="absolute top-6 right-6 z-10">
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">✕</button>
                                    </div>
                                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mb-6 text-6xl shadow-[0_0_25px_rgba(59,130,246,0.15)] relative">
                                        <div className="absolute text-5xl">📅</div>
                                        <div className="absolute -bottom-1 right-2 w-8 h-8 bg-blue-500 rounded-full border-[3px] border-white dark:border-[#121214] flex items-center justify-center text-white">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Package availability changed</h3>
                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6 max-w-[280px] leading-relaxed">
                                        Package booking availability decreased by 1 for today, {format(parseISO(oStartDate), 'MMMM d, yyyy')}, to {format(parseISO(oEndDate), 'MMMM d, yyyy')}.
                                    </p>
                                    
                                    <button 
                                        onClick={() => setSheetState('none')}
                                        className="w-full bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px]"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
