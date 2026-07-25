'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '@/lib/api';
import { 
    Calendar as CalendarIcon, 
    Bell, 
    ChevronDown, 
    Clock, 
    MapPin, 
    CheckCircle2, 
    CalendarPlus, 
    AlertCircle, 
    Umbrella,
    Filter,
    ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    format, 
    startOfWeek, 
    endOfWeek,
    addDays, 
    subDays,
    isSameDay, 
    isSameMonth,
    parseISO, 
    startOfMonth, 
    endOfMonth, 
    isToday 
} from 'date-fns';

interface CalendarBlock {
    _id: string;
    blockType: 'OfflineBooking' | 'Holiday';
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    eventName?: string;
    serviceType?: string;
    description?: string;
    reason?: string;
}

interface Booking {
    _id: string;
    bookingId: string;
    customer: { name: string; phone?: string; email?: string };
    eventDate: string;
    startTime: string;
    endTime: string;
    status: string;
    packageSnapshot: {
        name: string;
        price: number;
        image: string;
        vendorType: string;
        variantType: string;
    };
}

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date()));
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Action Bottom Sheet States
    const [sheetState, setSheetState] = useState<'none' | 'action' | 'holidayForm' | 'offlineForm' | 'success' | 'unblockConfirm' | 'unblockSuccess' | 'offlineSuccess'>('none');
    const [unblockTargetId, setUnblockTargetId] = useState<string | null>(null);
    const [hStartDate, setHStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [hEndDate, setHEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [hReason, setHReason] = useState('Holiday');
    const [hDescription, setHDescription] = useState('');

    // Offline Booking States
    const [oStartDate, setOStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [oEndDate, setOEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [oStartTime, setOStartTime] = useState('10:00 AM');
    const [oEndTime, setOEndTime] = useState('10:00 PM');
    const [oServiceType, setOServiceType] = useState('Decorator');
    const [oEventName, setOEventName] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastMarkedDate, setLastMarkedDate] = useState(selectedDate);
    
    const [overview, setOverview] = useState<Record<string, string[]>>({});
    const [monthlyBookings, setMonthlyBookings] = useState<Booking[]>([]);
    const [todayBlocks, setTodayBlocks] = useState<CalendarBlock[]>([]);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    
    const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') || 'placeholder_id' : 'placeholder_id';
    

    const populateDummyData = () => {
        const dummyBookings: Booking[] = [
            {
                _id: 'b1',
                bookingId: 'EVT1',
                customer: { name: 'Rahul Sharma' },
                eventDate: format(selectedDate, 'yyyy-MM-dd') + 'T00:00:00.000Z',
                startTime: '04:00 AM',
                endTime: '08:00 PM',
                status: 'Booked',
                packageSnapshot: {
                    name: 'Premium Package',
                    price: 25000,
                    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=200&h=200&fit=crop',
                    vendorType: 'Makeup Artist',
                    variantType: 'Premium'
                }
            },
            {
                _id: 'b2',
                bookingId: 'EVT2',
                customer: { name: 'Rahul Sharma' },
                eventDate: format(addDays(selectedDate, 1), 'yyyy-MM-dd') + 'T00:00:00.000Z',
                startTime: '04:00 AM',
                endTime: '08:00 PM',
                status: 'Cancelled',
                packageSnapshot: {
                    name: 'Premium Package',
                    price: 25000,
                    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=200&h=200&fit=crop',
                    vendorType: 'Makeup Artist',
                    variantType: 'Premium'
                }
            },
            {
                _id: 'b3',
                bookingId: 'EVT3',
                customer: { name: 'Rahul Sharma' },
                eventDate: format(addDays(selectedDate, 2), 'yyyy-MM-dd') + 'T00:00:00.000Z',
                startTime: '04:00 AM',
                endTime: '08:00 PM',
                status: 'Booked',
                packageSnapshot: {
                    name: 'Premium Package',
                    price: 25000,
                    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=200&h=200&fit=crop',
                    vendorType: 'Makeup Artist',
                    variantType: 'Premium'
                }
            }
        ];
        
        const dummyOverview: Record<string, string[]> = {
            [format(selectedDate, 'yyyy-MM-dd')]: ['Booked'],
            [format(addDays(selectedDate, 1), 'yyyy-MM-dd')]: ['Booked'],
            [format(addDays(selectedDate, 2), 'yyyy-MM-dd')]: ['Booked'],
            [format(addDays(selectedDate, 3), 'yyyy-MM-dd')]: ['OfflineBooking'],
            [format(addDays(selectedDate, 4), 'yyyy-MM-dd')]: ['Conflict'],
        };
        
        setMonthlyBookings(dummyBookings);
        setOverview(dummyOverview);
    };

    const handleMarkHoliday = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(apiUrl(`/calendar/vendor/${vendorId}/block/holiday`), {
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
                setLastMarkedDate(parseISO(hStartDate));
                setSheetState('success');
                fetchCalendarData(selectedDate);
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

            const res = await fetch(apiUrl(`/calendar/vendor/${vendorId}/block/offline`), {
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
                setLastMarkedDate(parseISO(oStartDate));
                setSheetState('offlineSuccess');
                fetchCalendarData(selectedDate);
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
            const res = await fetch(apiUrl(`/calendar/block/${unblockTargetId}/unblock`), {
                method: 'PUT'
            });
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                setSheetState('unblockSuccess');
                fetchCalendarData(selectedDate);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchCalendarData = useCallback(async (date: Date) => {
        setIsLoading(true);
        try {
            const start = format(startOfMonth(date), 'yyyy-MM-dd');
            const end = format(endOfMonth(date), 'yyyy-MM-dd');
            const targetDateStr = format(date, 'yyyy-MM-dd');

            const [overviewRes, bookingsRes, scheduleRes] = await Promise.all([
                fetch(apiUrl(`/calendar/vendor/${vendorId}/overview?startDate=${start}&endDate=${end}`)),
                fetch(apiUrl(`/bookings/vendor/${vendorId}?startDate=${start}&endDate=${end}&limit=100`)),
                fetch(apiUrl(`/calendar/vendor/${vendorId}/schedule?date=${targetDateStr}`))
            ]);

            const overviewData = await overviewRes.json();
            const bookingsData = await bookingsRes.json();
            const scheduleData = await scheduleRes.json();

            if (overviewData.status === 'SUCCESS') setOverview(overviewData.dates || {});
            if (bookingsData.status === 'SUCCESS') setMonthlyBookings(bookingsData.bookings || []);
            if (scheduleData.status === 'SUCCESS') setTodayBlocks(scheduleData.todaySchedule?.items || []);

        } catch (error) {
            console.error("Error fetching calendar data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [vendorId]);

    // Fetch when selected month changes (we approximate by just fetching on week or date change)
    useEffect(() => {
        fetchCalendarData(selectedDate);
    }, [selectedDate, fetchCalendarData]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handlePrevWeek = () => {
        const newStart = subDays(currentWeekStart, 7);
        setCurrentWeekStart(newStart);
        setSelectedDate(newStart);
    };

    const handleNextWeek = () => {
        const newStart = addDays(currentWeekStart, 7);
        setCurrentWeekStart(newStart);
        setSelectedDate(newStart);
    };

    const getCalendarDays = () => {
        if (!isExpanded) {
            return Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));
        } else {
            const monthStart = startOfMonth(selectedDate);
            const monthEnd = endOfMonth(selectedDate);
            const calendarStart = startOfWeek(monthStart);
            const calendarEnd = endOfWeek(monthEnd);
            
            const days = [];
            let d = new Date(calendarStart);
            while (d <= calendarEnd) {
                days.push(new Date(d));
                d = addDays(d, 1);
            }
            return days;
        }
    };

    const calendarDays = getCalendarDays();
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Filter bookings for the selected date
    const todayBookings = monthlyBookings.filter(b => {
        const bDate = b.eventDate.split('T')[0];
        return bDate === selectedDateStr;
    });

    const renderDateDots = (dateStr: string) => {
        const types = overview[dateStr] || [];
        const dateBookings = monthlyBookings.filter(b => b.eventDate.split('T')[0] === dateStr);
        const bookingCount = dateBookings.length;

        // If Conflict
        if (types.includes('Conflict')) {
            return (
                <div className="absolute -bottom-2 flex justify-center w-full">
                    <div className="bg-red-100 text-red-600 rounded-sm p-[2px]">
                        <CalendarPlus size={10} />
                    </div>
                </div>
            );
        }

        // If Holiday
        if (types.includes('Holiday')) {
            return (
                <div className="absolute -bottom-2 flex justify-center w-full">
                    <Umbrella size={12} className="text-gray-400" />
                </div>
            );
        }

        // Problem (Mock - using a random condition or if status is cancelled/issue, but we just show if offline)
        if (types.includes('OfflineBooking')) {
            return (
                <div className="absolute -bottom-2 flex justify-center w-full">
                    <div className="bg-blue-50 text-blue-500 p-[2px] rounded-sm">
                        <CalendarIcon size={10} />
                    </div>
                </div>
            );
        }

        // Online Bookings (Green Dots)
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

    const holidayBlock = todayBlocks.find(b => b.blockType === 'Holiday');

    const renderVendorChip = (vendorType: string, priority: string = 'Booking First') => {
        const config: Record<string, { bg: string, text: string, icon: string }> = {
            'MAKEUP ARTIST': { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-400', icon: '💄' },
            'PHOTOGRAPHER': { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', icon: '📸' },
            'DJ ARTIST': { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', icon: '💿' },
            'CATERER': { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', icon: '🍲' },
            'VENUE PROVIDER': { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', icon: '🏛️' },
            'DECORATOR': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', icon: '🎈' },
        };

        // Normalize vendor type to uppercase
        const typeUpper = vendorType?.toUpperCase().replace('_', ' ') || 'VENUE PROVIDER';
        const c = config[typeUpper] || config['VENUE PROVIDER'];

        return (
            <div className="mb-3 flex items-center gap-2">
                <div className={`${c.bg} ${c.text} px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider`}>
                    <span className="text-[10px]">{c.icon}</span> {typeUpper}
                </div>
                <span className="text-gray-200 dark:text-gray-700">|</span>
                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-medium">{priority}</span>
            </div>
        );
    };

    const renderStatusPill = (status: string, isBlock: boolean = false) => {
        if (isBlock) {
            if (status === 'Holiday') {
                return (
                    <div className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 py-2.5 flex items-center justify-center gap-2 font-bold text-[11px] w-full uppercase tracking-wider">
                        <Umbrella size={12} /> Vendor Holiday
                    </div>
                );
            }
            return (
                <div className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-500 py-2.5 flex items-center justify-center gap-1.5 font-bold text-[11px] w-full uppercase tracking-wider">
                    <CalendarIcon size={12} /> Offline Booking
                </div>
            );
        }

        const config: Record<string, { bg: string, text: string, icon: React.ReactNode }> = {
            'Booked': { 
                bg: 'bg-green-50 dark:bg-green-900/10', 
                text: 'text-green-600 dark:text-green-500', 
                icon: <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 
            },
            'Event Cancelled': { 
                bg: 'bg-red-50 dark:bg-red-900/10', 
                text: 'text-red-600 dark:text-red-500', 
                icon: <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            },
            'Payment Pending': { 
                bg: 'bg-yellow-50 dark:bg-yellow-900/10', 
                text: 'text-yellow-600 dark:text-yellow-500', 
                icon: <Clock size={12} />
            },
            'Date Conflict': { 
                bg: 'bg-red-50 dark:bg-red-900/10', 
                text: 'text-red-600 dark:text-red-500', 
                icon: <CalendarPlus size={12} />
            }
        };
        
        // Normalize status
        const normalizedStatus = status === 'Cancelled' ? 'Event Cancelled' : status;
        const c = config[normalizedStatus] || config['Booked'];

        return (
            <div className={`${c.bg} ${c.text} py-2.5 flex items-center justify-center gap-1.5 font-bold text-[11px] w-full uppercase tracking-wider`}>
                {c.icon} {normalizedStatus}
            </div>
        );
    };

    const Legend = () => (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 px-2 text-[10px] text-gray-600 dark:text-gray-400 font-medium">
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Online Booking
            </div>
            <div className="flex items-center gap-1.5 text-blue-500">
                <CalendarIcon size={12} />
                <span className="text-gray-600 dark:text-gray-400">Offline Booking</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-500">
                <AlertCircle size={12} />
                <span className="text-gray-600 dark:text-gray-400">Booking issues</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-500">
                <CalendarPlus size={12} />
                <span className="text-gray-600 dark:text-gray-400">Date Conflict</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
                <Umbrella size={12} />
                <span className="text-gray-600 dark:text-gray-400">Holiday</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] pb-24 font-sans">
            {/* Header */}
            <div className="bg-white dark:bg-[#09090B] px-5 pt-12 pb-4 sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer select-none" onDoubleClick={populateDummyData}>
                        {isToday(selectedDate) ? 'Today, ' : ''}{format(selectedDate, 'd MMMM')}
                    </h1>
                    <div className="flex items-center gap-4">
                        <button 
                            className="text-gray-600 dark:text-gray-300"
                            onClick={() => window.location.href = '/dashboard/calendar/full'}
                        >
                            <CalendarIcon size={22} />
                        </button>
                        <button className="text-gray-600 dark:text-gray-300 relative">
                            <Bell size={22} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </div>

                {/* Week Calendar */}
                <div>
                    <div className="flex justify-between text-[10px] font-semibold text-gray-400 mb-2 px-2 uppercase tracking-wider">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="w-10 text-center flex-1">{day}</div>
                        ))}
                    </div>
                    
                    <div className={`grid grid-cols-7 gap-y-3 relative ${isExpanded ? 'px-2' : 'px-1'}`}>
                        {/* Swipe buttons for desktop/testing - hide when expanded */}
                        {!isExpanded && (
                            <>
                                <button onClick={handlePrevWeek} className="absolute -left-2 top-3 p-1 text-gray-300 hover:text-gray-600 z-10"><ChevronDown className="rotate-90" size={16}/></button>
                                <button onClick={handleNextWeek} className="absolute -right-2 top-3 p-1 text-gray-300 hover:text-gray-600 z-10"><ChevronDown className="-rotate-90" size={16}/></button>
                            </>
                        )}
                        
                        {calendarDays.map(date => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            const isSelected = isSameDay(date, selectedDate);
                            const isCurrentMonth = isSameMonth(date, selectedDate);
                            const types = overview[dateStr] || [];
                            const isHoliday = types.includes('Holiday');
                            const isConflict = types.includes('Conflict');
                            
                            return (
                                <button 
                                    key={dateStr}
                                    onClick={() => handleDateSelect(date)}
                                    className={`relative flex flex-col items-center justify-center h-12 rounded-xl border transition-all mx-1
                                        ${!isCurrentMonth ? 'opacity-30' : ''}
                                        ${isSelected ? (isConflict ? 'border-red-500 bg-red-50' : (isExpanded ? 'bg-[#04222D] shadow-sm' : 'border-[#04222D] shadow-sm')) : 'border-gray-200 dark:border-gray-700 bg-transparent'}
                                        ${isHoliday && !isSelected ? 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-semibold ${isSelected ? (isExpanded && !isConflict ? 'text-white' : 'text-[#04222D] dark:text-white') : 'text-gray-700 dark:text-gray-300'}`}>
                                        {format(date, 'd')}
                                    </span>
                                    {renderDateDots(dateStr)}
                                </button>
                            );
                        })}
                    </div>
                    
                    <Legend />

                    <div className="flex justify-center mt-4">
                        <button 
                            className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full text-gray-500"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-5">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : holidayBlock ? (
                    <div className="flex flex-col items-center justify-center pt-10 pb-8 text-center bg-white dark:bg-[#121214] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 mt-4">
                        <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center mb-6 text-6xl">🏝️</div>
                        <h3 className="text-[22px] font-bold text-gray-900 dark:text-white mb-3">Date Blocked as holiday</h3>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-10 max-w-[250px] leading-relaxed">You marked this day as a personal holiday, sick day, or for travel reasons.</p>
                        <button 
                            onClick={() => {
                                setUnblockTargetId(holidayBlock._id);
                                setSheetState('unblockConfirm');
                            }}
                            className="w-full bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px]"
                        >
                            Set date as Available
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Today's Schedule */}
                        <div className="mb-8">
                            <div className="flex items-end gap-2 mb-4">
                                <h2 className="text-xl font-bold text-[#04222D] dark:text-white">Today's Schedule</h2>
                                <span className="text-xs text-gray-400 font-medium mb-1">{todayBookings.length + todayBlocks.length} bookings</span>
                            </div>

                            <div className="space-y-4">
                                {todayBookings.length === 0 && todayBlocks.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                                        <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CalendarIcon className="text-gray-400" size={28} />
                                        </div>
                                        <h3 className="text-gray-900 dark:text-white font-semibold">No schedule for today</h3>
                                        <p className="text-sm text-gray-500 mt-1">Take a break or update your availability.</p>
                                    </div>
                                ) : (
                                    <>
                                        {todayBookings.map(booking => (
                                            <div key={booking._id} className="bg-white dark:bg-[#121214] rounded-2xl pt-4 border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                                                <div className="px-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">{booking.customer.name}</h3>
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-1.5 font-medium">
                                                                <Clock size={14} className="text-gray-400" />
                                                                {booking.startTime} - {booking.endTime}
                                                            </div>
                                                        </div>
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 flex flex-col items-center min-w-[50px] border border-gray-200 dark:border-gray-700">
                                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{format(parseISO(booking.eventDate), 'd')}</span>
                                                            <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">{format(parseISO(booking.eventDate), 'MMM')}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <hr className="border-t border-dashed border-gray-200 dark:border-gray-800 my-3" />

                                                    {renderVendorChip(booking.packageSnapshot.vendorType || booking.packageSnapshot.variantType)}

                                                    <div className="flex gap-3 items-center mb-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                                            {booking.packageSnapshot.image ? (
                                                                <img src={booking.packageSnapshot.image} alt="Package" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-[#04222D] dark:text-gray-300 font-bold">{booking.packageSnapshot.name}</p>
                                                            <p className="text-[15px] font-bold text-gray-900 dark:text-white mt-0.5">₹{booking.packageSnapshot.price.toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {renderStatusPill(booking.status)}
                                            </div>
                                        ))}

                                        {todayBlocks.map(block => (
                                            <div key={block._id} className="bg-white dark:bg-[#121214] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">
                                                            {block.blockType === 'Holiday' ? 'Holiday / Off Day' : block.eventName || 'Offline Booking'}
                                                        </h3>
                                                        {block.startTime && block.endTime && (
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-1.5 font-medium">
                                                                <Clock size={14} className="text-gray-400" />
                                                                {block.startTime} - {block.endTime}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 flex flex-col items-center min-w-[50px]">
                                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{format(parseISO(block.startDate), 'd')}</span>
                                                        <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">{format(parseISO(block.startDate), 'MMM')}</span>
                                                    </div>
                                                </div>

                                                {renderStatusPill(block.blockType, true)}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* All Schedule */}
                        <div>
                            <div className="flex items-end gap-2 mb-4">
                                <h2 className="text-xl font-bold text-[#04222D] dark:text-white">All Schedule</h2>
                                <span className="text-xs text-gray-400 font-medium mb-1">
                                    {activeFilter ? monthlyBookings.filter(b => {
                                        const vt = (b.packageSnapshot.vendorType || b.packageSnapshot.variantType || '').toUpperCase().replace('_', ' ');
                                        return vt === activeFilter;
                                    }).length : monthlyBookings.length} bookings
                                </span>
                            </div>
                            
                            {/* Dynamic Filter Chips */}
                            <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
                                {(() => {
                                    const uniqueTypes = Array.from(new Set(monthlyBookings.map(b => (b.packageSnapshot.vendorType || b.packageSnapshot.variantType || 'VENUE PROVIDER').toUpperCase().replace('_', ' '))));
                                    
                                    const icons: Record<string, string> = {
                                        'MAKEUP ARTIST': '💄',
                                        'PHOTOGRAPHER': '📸',
                                        'DJ ARTIST': '💿',
                                        'CATERER': '🍲',
                                        'VENUE PROVIDER': '🏛️',
                                        'DECORATOR': '🎈'
                                    };

                                    return uniqueTypes.map(type => {
                                        const isActive = activeFilter === type;
                                        return (
                                            <button 
                                                key={type}
                                                onClick={() => setActiveFilter(isActive ? null : type)}
                                                className={`${isActive ? 'bg-[#04222D] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'} px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-2 shrink-0 transition-colors`}
                                            >
                                                <span className="text-sm">{icons[type] || '🎫'}</span> 
                                                {type.split(' ').map((w: string) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                                                {isActive && <span className="text-gray-400 ml-1">✕</span>}
                                            </button>
                                        );
                                    });
                                })()}
                            </div>

                            {/* List of upcoming bookings */}
                            <div className="space-y-4">
                                {monthlyBookings.filter(b => {
                                    if (!activeFilter) return true;
                                    const vt = (b.packageSnapshot.vendorType || b.packageSnapshot.variantType || '').toUpperCase().replace('_', ' ');
                                    return vt === activeFilter;
                                }).map(booking => (
                                    <div key={booking._id} className="bg-white dark:bg-[#121214] rounded-2xl pt-4 border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                                        <div className="px-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white text-[15px]">{booking.customer.name}</h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-1.5 font-medium">
                                                        <Clock size={14} className="text-gray-400" />
                                                        {booking.startTime} - {booking.endTime}
                                                    </div>
                                                </div>
                                                <div className="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 flex flex-col items-center min-w-[50px] border border-gray-200 dark:border-gray-700">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{format(parseISO(booking.eventDate), 'd')}</span>
                                                    <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">{format(parseISO(booking.eventDate), 'MMM')}</span>
                                                </div>
                                            </div>
                                            
                                            <hr className="border-t border-dashed border-gray-200 dark:border-gray-800 my-3" />

                                            {renderVendorChip(booking.packageSnapshot.vendorType || booking.packageSnapshot.variantType)}

                                            <div className="flex gap-3 items-center mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                                    {booking.packageSnapshot.image ? (
                                                        <img src={booking.packageSnapshot.image} alt="Package" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs text-[#04222D] dark:text-gray-300 font-bold">{booking.packageSnapshot.name}</p>
                                                    <p className="text-[15px] font-bold text-gray-900 dark:text-white mt-0.5">₹{booking.packageSnapshot.price.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {renderStatusPill(booking.status)}
                                    </div>
                                ))}
                                {monthlyBookings.length > 0 && monthlyBookings.filter(b => {
                                    if (!activeFilter) return true;
                                    const vt = (b.packageSnapshot.vendorType || b.packageSnapshot.variantType || '').toUpperCase().replace('_', ' ');
                                    return vt === activeFilter;
                                }).length === 0 && (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                                        No bookings match this filter.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            
            {/* FAB */}
            <button 
                onClick={() => {
                    setHStartDate(format(selectedDate, 'yyyy-MM-dd'));
                    setHEndDate(format(selectedDate, 'yyyy-MM-dd'));
                    setSheetState('action');
                }}
                className="fixed bottom-24 right-5 w-14 h-14 bg-[#04222D] rounded-full shadow-lg flex items-center justify-center text-white z-20 hover:scale-105 active:scale-95 transition-transform"
            >
                <CalendarIcon size={24} />
            </button>

            {/* Bottom Sheets */}
            <AnimatePresence>
                {sheetState !== 'none' && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="fixed inset-0 bg-black/40 z-[60]"
                            onClick={() => setSheetState('none')}
                        />
                        <motion.div 
                            initial={{ y: '100%' }} 
                            animate={{ y: 0 }} 
                            exit={{ y: '100%' }} 
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#121214] rounded-t-3xl z-[70] overflow-hidden shadow-2xl"
                        >
                            {sheetState === 'action' && (
                                <div className="p-6 pb-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Set Availability</p>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {format(selectedDate, 'EEEE d MMMM')}
                                            </h3>
                                        </div>
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">
                                            ✕
                                        </button>
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
                                                <p className="text-xs text-gray-500 mt-0.5">Holiday for sick, travel, or other reasons</p>
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
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">
                                            ✕
                                        </button>
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
                                        <button onClick={() => setSheetState('none')} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500">✕</button>
                                    </div>
                                    <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 opacity-70 -z-10" style={{ background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 60%)' }}></div>
                                    <div className="w-16 h-16 bg-[#16A34A] rounded-full flex items-center justify-center text-white mb-6 shadow-[0_0_25px_rgba(34,197,94,0.3)]">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 max-w-[200px] leading-snug">
                                        {format(lastMarkedDate, 'EEEE d MMMM yyyy')} marked holiday
                                    </h3>
                                    <button 
                                        onClick={() => setSheetState('none')}
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
                                        {format(selectedDate, 'EEEE d MMMM')} Marked available for bookings
                                    </h3>
                                    <button 
                                        onClick={() => setSheetState('none')}
                                        className="w-full bg-[#04222D] text-white rounded-xl py-3.5 font-bold text-[15px]"
                                    >
                                        Continue
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
                                    
                                    {/* Preview Card */}
                                    <div className="w-full bg-white dark:bg-[#1E1E22] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-left shadow-sm mb-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-[13px] font-bold text-gray-900 dark:text-white">Offline Event</h4>
                                                <p className="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                                                    <Clock size={10} /> {oStartTime} - {oEndTime}
                                                </p>
                                            </div>
                                            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                                                <div className="text-[10px] font-bold text-gray-500 uppercase">{format(parseISO(oStartDate), 'MMM')}</div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">{format(parseISO(oStartDate), 'd')}</div>
                                            </div>
                                        </div>
                                        {renderVendorChip(oServiceType)}
                                    </div>

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
