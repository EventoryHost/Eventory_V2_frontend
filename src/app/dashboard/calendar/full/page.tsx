'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
    CalendarCheck, 
    ArrowLeft, 
    CalendarPlus, 
    AlertCircle, 
    Umbrella,
    CalendarIcon
} from 'lucide-react';
import { 
    format, 
    startOfWeek, 
    endOfWeek,
    addDays, 
    addMonths,
    isSameDay, 
    isSameMonth,
    parseISO, 
    startOfMonth, 
    endOfMonth, 
    isToday 
} from 'date-fns';
import { useRouter } from 'next/navigation';

export default function FullCalendarPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [overview, setOverview] = useState<Record<string, string[]>>({});
    const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});
    
    // We will render 6 months from the current date
    const [startMonthDate] = useState(() => startOfMonth(new Date()));
    const months = Array.from({ length: 6 }).map((_, i) => addMonths(startMonthDate, i));
    
    const [activeMonth, setActiveMonth] = useState(0);
    const monthRefs = useRef<(HTMLDivElement | null)[]>([]);

    const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') || 'placeholder_id' : 'placeholder_id';
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

    useEffect(() => {
        const fetchMultipleMonths = async () => {
            setIsLoading(true);
            try {
                const startDateStr = format(startOfMonth(startMonthDate), 'yyyy-MM-dd');
                const endDateStr = format(endOfMonth(months[months.length - 1]), 'yyyy-MM-dd');

                const [overviewRes, bookingsRes] = await Promise.all([
                    fetch(`${baseUrl}/calendar/vendor/${vendorId}/overview?startDate=${startDateStr}&endDate=${endDateStr}`),
                    fetch(`${baseUrl}/bookings/vendor/${vendorId}?startDate=${startDateStr}&endDate=${endDateStr}&limit=500`)
                ]);

                const overviewData = await overviewRes.json();
                const bookingsData = await bookingsRes.json();

                if (overviewData.status === 'SUCCESS') setOverview(overviewData.dates || {});
                if (bookingsData.status === 'SUCCESS') {
                    // Pre-calculate booking counts per date for fast rendering
                    const counts: Record<string, number> = {};
                    bookingsData.bookings.forEach((b: any) => {
                        const dStr = b.eventDate.split('T')[0];
                        counts[dStr] = (counts[dStr] || 0) + 1;
                    });
                    setBookingCounts(counts);
                }

            } catch (error) {
                console.error("Error fetching full calendar data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMultipleMonths();
    }, [vendorId, baseUrl, startMonthDate]);

    // Intersection observer for scrolling months
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Number(entry.target.getAttribute('data-index'));
                    if (!isNaN(index)) {
                        setActiveMonth(index);
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '-50% 0px -50% 0px', // Trigger when month is in the middle of screen
            threshold: 0
        });

        monthRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToMonth = (index: number) => {
        setActiveMonth(index);
        monthRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const renderDateDots = (dateStr: string) => {
        const types = overview[dateStr] || [];
        const bookingCount = bookingCounts[dateStr] || 0;

        if (types.includes('Conflict')) {
            return (
                <div className="absolute -bottom-2 flex justify-center w-full">
                    <div className="bg-red-100 text-red-600 rounded-sm p-[2px]">
                        <CalendarPlus size={10} />
                    </div>
                </div>
            );
        }

        if (types.includes('Holiday')) {
            return (
                <div className="absolute -bottom-2 flex justify-center w-full">
                    <Umbrella size={12} className="text-gray-400" />
                </div>
            );
        }

        if (types.includes('OfflineBooking')) {
            return (
                <div className="absolute -bottom-2 flex justify-center w-full">
                    <div className="bg-blue-50 text-blue-500 p-[2px] rounded-sm">
                        <CalendarIcon size={10} />
                    </div>
                </div>
            );
        }

        if (bookingCount > 0) {
            if (bookingCount <= 3) {
                return (
                    <div className="absolute -bottom-1 flex justify-center w-full gap-[2px]">
                        {Array.from({ length: bookingCount }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="absolute -bottom-2 flex justify-center w-full">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                            {bookingCount}
                        </div>
                    </div>
                );
            }
        }
        return null;
    };

    const generateMonthGrid = (monthDate: Date) => {
        const mStart = startOfMonth(monthDate);
        const mEnd = endOfMonth(monthDate);
        const cStart = startOfWeek(mStart);
        const cEnd = endOfWeek(mEnd);
        
        const days = [];
        let d = new Date(cStart);
        while (d <= cEnd) {
            days.push(new Date(d));
            d = addDays(d, 1);
        }
        return days;
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#09090B] font-sans flex flex-col">
            {/* Header Sticky */}
            <div className="bg-white dark:bg-[#09090B] sticky top-0 z-30 pt-12 shadow-sm">
                <div className="px-5 flex items-center justify-between pb-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-gray-700 dark:text-gray-300">
                            <ArrowLeft size={22} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Full Calendar</h1>
                    </div>
                    <button className="text-[#04222D] dark:text-white relative">
                        <CalendarCheck size={22} />
                    </button>
                </div>

                {/* Month Pill Scroll */}
                <div className="flex items-center px-5 py-3 gap-3 overflow-x-auto scrollbar-hide border-b border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-sm text-gray-900 dark:text-white shrink-0 mr-2">{format(startMonthDate, 'yyyy')}</span>
                    {months.map((m, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollToMonth(idx)}
                            className={`px-4 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors shrink-0
                                ${activeMonth === idx 
                                    ? 'bg-[#04222D] text-white' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
                            `}
                        >
                            {format(m, 'MMMM')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content list of months */}
            <div className="flex-1 overflow-y-auto pb-24">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {months.map((m, idx) => {
                            const gridDays = generateMonthGrid(m);
                            
                            return (
                                <div 
                                    key={idx} 
                                    ref={el => { monthRefs.current[idx] = el }}
                                    data-index={idx}
                                    className="px-4 pt-6"
                                >
                                    <h2 className="text-center font-bold text-gray-900 dark:text-white mb-6">
                                        {format(m, 'MMMM yyyy')}
                                    </h2>
                                    
                                    <div className="flex justify-between text-[10px] font-semibold text-gray-400 mb-3 px-2 uppercase tracking-wider">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="w-10 text-center flex-1">{day}</div>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-y-4 px-2 relative">
                                        {gridDays.map(date => {
                                            const dateStr = format(date, 'yyyy-MM-dd');
                                            const isCurrentMonth = isSameMonth(date, m);
                                            const isCurrentDate = isToday(date);
                                            const types = overview[dateStr] || [];
                                            const isConflict = types.includes('Conflict');
                                            const isHoliday = types.includes('Holiday');
                                            
                                            // The dark bg for the selected date doesn't make as much sense here unless we keep track of selectedDate globally.
                                            // But let's highlight Today or Conflict.
                                            
                                            return (
                                                <button 
                                                    key={dateStr}
                                                    onClick={() => router.push(`/dashboard/calendar/${dateStr}`)}
                                                    className={`relative flex flex-col items-center justify-center h-12 rounded-xl mx-1 border transition-all
                                                        ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''} 
                                                        ${isCurrentDate ? (isConflict ? 'border-red-500 bg-red-50' : 'bg-[#04222D] text-white shadow-sm border-[#04222D]') : 'border-gray-200 dark:border-gray-800 bg-transparent'}
                                                        ${isHoliday && !isCurrentDate ? 'bg-gray-50 dark:bg-gray-800/50 border-transparent text-gray-400' : ''}
                                                    `}
                                                >
                                                    <span className={`text-sm font-semibold ${isCurrentDate ? (isConflict ? 'text-[#04222D]' : 'text-white') : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {format(date, 'd')}
                                                    </span>
                                                    {renderDateDots(dateStr)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
