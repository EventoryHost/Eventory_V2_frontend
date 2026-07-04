'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Landmark, Info, ChevronRight, ChevronDown, TrendingUp, TrendingDown, Check, Circle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import BankIcon from '@/components/BankIcon';

// Mock Data Fallbacks
const MOCK_EARNINGS = {
  totalRevenue: 285400,
  percentageChange: 12,
  availableToAccept: 92500,
  dueAmount: 12500,
  payoutExpectedDate: '25 April',
  bankDetails: {
    accountNumber: '8829',
    bankName: 'HDFC Bank'
  }
};

const MOCK_ANALYTICS = [
  { day: 'MON', totalAmount: 30000 },
  { day: 'TUE', totalAmount: 50000 },
  { day: 'WED', totalAmount: 25000 },
  { day: 'THU', totalAmount: 120000 },
  { day: 'FRI', totalAmount: 40000 },
  { day: 'SAT', totalAmount: 150000 },
  { day: 'SUN', totalAmount: 75000 },
];

const MOCK_UPCOMING = [
  { _id: '1', customerName: 'Priya Sharma', milestoneType: 'Adv1', eventDate: '2026-05-01', amount: 20000, bookingId: 'EVT1098' },
  { _id: '2', customerName: 'Priya Sharma', milestoneType: 'Adv1', eventDate: '2026-05-01', amount: 20000, bookingId: 'EVT1098' },
  { _id: '3', customerName: 'Priya Sharma', milestoneType: 'Adv1', eventDate: '2026-05-01', amount: 20000, bookingId: 'EVT1098' },
  { _id: '4', customerName: 'Priya Sharma', milestoneType: 'Adv1', eventDate: '2026-05-01', amount: 20000, bookingId: 'EVT1098' },
];

const MOCK_TIMELINE = {
  bookingId: 'EVT1098',
  customerName: 'Priya Sharma',
  totalAmount: 150000,
  totalReceived: 45000,
  eventDate: '2026-10-25',
  nextPaymentDue: {
    milestoneType: 'Advanced2',
    amount: 20000,
    dueDate: '2026-05-20'
  },
  milestones: [
    { type: 'Token', amount: 20000, status: 'Received', receivedDate: '2026-05-01' },
    { type: 'Advanced1', amount: 30000, status: 'Received', receivedDate: '2026-05-10' },
    { type: 'Advanced2', amount: 20000, status: 'PaymentDue', dueDate: '2026-05-20' },
    { type: 'FinalClearance', amount: 70000, status: 'Pending' }
  ]
};

export default function EarningsPage() {
    const router = useRouter();
    const [period, setPeriod] = useState('1M');
    
    // Start with empty data until API returns it, or user double-clicks title
    const [earnings, setEarnings] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [upcoming, setUpcoming] = useState<any[]>([]);
    
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [timeline, setTimeline] = useState<any>(null);
    const [isTimelineLoading, setIsTimelineLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const vendorId = localStorage.getItem('vendor_id') || 'VEN-placeholder';
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
                
                const [earningRes, analyticsRes, upcomingRes] = await Promise.all([
                    fetch(`${baseUrl}/transactions/vendor/${vendorId}/earnings?period=${period}`),
                    fetch(`${baseUrl}/transactions/vendor/${vendorId}/analytics?period=${period}`),
                    fetch(`${baseUrl}/transactions/vendor/${vendorId}/upcoming`)
                ]);

                if (earningRes.ok) {
                    const data = await earningRes.json();
                    if (data?.totalRevenue !== undefined) setEarnings(data);
                }
                if (analyticsRes.ok) {
                    const data = await analyticsRes.json();
                    if (data?.chartData) setAnalytics(data.chartData);
                }
                if (upcomingRes.ok) {
                    const data = await upcomingRes.json();
                    if (data?.data) setUpcoming(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            }
        };

        if (typeof window !== 'undefined') {
            fetchDashboardData();
        }
    }, [period]);

    const handleBookingClick = async (bookingId: string) => {
        setSelectedBooking(bookingId);
        setIsTimelineLoading(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
            const res = await fetch(`${baseUrl}/transactions/booking/${bookingId}/timeline`);
            if (res.ok) {
                const data = await res.json();
                setTimeline(data);
            } else {
                setTimeline(MOCK_TIMELINE);
            }
        } catch (err) {
            console.error('Failed to fetch timeline:', err);
            setTimeline(MOCK_TIMELINE);
        } finally {
            setIsTimelineLoading(false);
        }
    };

    const [isMockDataVisible, setIsMockDataVisible] = useState(false);

    const toggleMockData = () => {
        if (isMockDataVisible) {
            setEarnings(null);
            setAnalytics([]);
            setUpcoming([]);
            setIsMockDataVisible(false);
        } else {
            setEarnings(MOCK_EARNINGS);
            setAnalytics(MOCK_ANALYTICS);
            setUpcoming(MOCK_UPCOMING);
            setIsMockDataVisible(true);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN').format(val);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 flex justify-between items-center">
                <h1 
                    onDoubleClick={toggleMockData}
                    style={{ fontFamily: 'Figtree, sans-serif' }} 
                    className="text-[24px] font-bold text-[#030303] dark:text-white select-none cursor-default"
                >
                    Earnings
                </h1>
                <button onClick={() => router.back()} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                    <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                </button>
            </div>

            {(!earnings || earnings.totalRevenue === 0) && !isMockDataVisible ? (
                <div className="px-5 mt-4">
                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[24px] font-bold text-[#030303] dark:text-white mb-2">Your Earnings</h2>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] leading-relaxed mb-6">
                        See what clients are saying about your services and track your business reputation over time
                    </p>
                    
                    <div className="flex flex-col items-center justify-center mt-[60px] pb-10 text-center">
                        <img src="https://dkuacgndftndz.cloudfront.net/Menu_Components/earnings.png" alt="No Earnings" className="w-[247px] h-[247px] object-contain mb-6" />
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-2">No earnings yet</h3>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] max-w-[260px] mb-6 leading-relaxed">
                            Your earning breakdowns will appear here as soon as you complete your first booking.
                        </p>
                        <button 
                            onClick={() => router.push('/dashboard/packages')} 
                            style={{ fontFamily: 'Figtree, sans-serif' }} 
                            className="px-6 py-3 bg-[#04222D] dark:bg-[#E95A6E] text-white text-[13px] font-bold rounded-[8px] active:scale-95 transition-transform"
                        >
                            Create Package
                        </button>
                    </div>
                </div>
            ) : (
                <div className="px-5">
                    {/* Time Filters */}
                <div className="flex justify-center mb-6">
                    <div className="flex bg-[#F4F4F5] dark:bg-[#27272A] p-1 rounded-full">
                        {['1W', '1M', '6M', '1Y'].map(p => (
                            <button 
                                key={p}
                                onClick={() => setPeriod(p)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-all ${period === p ? 'bg-[#04222D] text-white dark:bg-[#E95A6E]' : 'text-[#71717B] dark:text-[#A1A1AA]'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="flex flex-col items-center mb-8">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] text-[#71717B] dark:text-[#A1A1AA] font-medium mb-1">Total Revenue</span>
                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[40px] font-bold text-[#030303] dark:text-white leading-tight mb-2">
                        ₹{formatCurrency(earnings?.totalRevenue || 0)}
                    </h2>
                    <div className="bg-[#ECFDF5] dark:bg-[#064E3B] px-3 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-[#10B981] dark:text-[#34D399]" />
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#10B981] dark:text-[#34D399]">
                            {earnings?.percentageChange || 0}% Vs Last month
                        </span>
                    </div>
                </div>

                {/* Accept / Due Cards */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 bg-white dark:bg-[#1E1E1B] p-4 rounded-[16px] border border-[#F4F4F5] dark:border-[#27272A] shadow-sm">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-widest block mb-1">Available to accept</span>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white">₹{formatCurrency(earnings?.availableToAccept || 0)}</span>
                    </div>
                    <div className="flex-1 bg-white dark:bg-[#1E1E1B] p-4 rounded-[16px] border border-[#F4F4F5] dark:border-[#27272A] shadow-sm">
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-widest block mb-1">Due Amount</span>
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white">₹{formatCurrency(earnings?.dueAmount || 0)}</span>
                    </div>
                </div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-center text-[#A1A1AA] font-medium mb-8">
                    Payout expected date - {earnings?.payoutExpectedDate || 'N/A'}
                </p>

                {/* Bank Account */}
                <div className="bg-white dark:bg-[#1E1E1B] p-5 rounded-[20px] border border-[#F4F4F5] dark:border-[#27272A] shadow-sm mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <BankIcon 
                            bankName={earnings?.bankDetails?.bankName} 
                            className="w-[42px] h-[42px] bg-white border border-[#F4F4F5] dark:border-[#27272A] dark:bg-[#0C4A6E] rounded-full text-[#0EA5E9] shadow-sm p-1.5" 
                        />
                        <div>
                            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-1">
                                {earnings?.bankDetails?.bankName} •••• {earnings?.bankDetails?.accountNumber}
                            </h3>
                            <div className="inline-block bg-[#E0F2FE] dark:bg-[#0284C7]/30 text-[#0284C7] dark:text-[#7DD3FC] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                Primary Payout Account
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#F8FAFC] dark:bg-[#0F172A]/50 rounded-[12px] p-3 flex gap-2.5 mb-4">
                        <Info className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0 mt-0.5" />
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                            Automated payouts will be credited to this account within <span className="font-bold text-[#334155] dark:text-[#CBD5E1]">2-3 business days</span> of milestone completion.
                        </p>
                    </div>
                    <button style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] dark:text-white flex items-center gap-1 hover:opacity-80 transition-opacity">
                        Change Account <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Analytics Chart */}
                <div className="bg-[#F4F4F5] dark:bg-[#1E1E1B] p-5 rounded-[16px] mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white">Analytics</h3>
                        <div className="flex gap-1 text-[11px] font-bold text-[#71717B] dark:text-[#A1A1AA]">
                            {['1W', '1M', '6M', '1Y'].map(p => (
                                <span 
                                    key={p} 
                                    className={`px-3 py-1.5 rounded-[8px] cursor-pointer transition-colors ${period === p ? 'text-white bg-[#04222D] dark:bg-[#E95A6E]' : 'hover:bg-gray-200 dark:hover:bg-[#27272A]'}`}
                                    onClick={() => setPeriod(p)}
                                >
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Simplified Bar Chart */}
                    <div className="h-[180px] flex items-end justify-between relative mt-8 border-b-0 pb-0">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 bottom-6 flex flex-col justify-between h-[150px] text-[10px] text-[#71717B] dark:text-[#A1A1AA] font-medium z-0 pointer-events-none">
                            <span>150k</span>
                            <span>100k</span>
                            <span>50k</span>
                            <span>0</span>
                        </div>
                        {/* Threshold line */}
                        <div className="absolute left-8 right-0 bottom-[106px] border-b border-dashed border-[#D4D4D8] dark:border-[#3F3F47] z-0"></div>
                        
                        <div className="flex items-end justify-between w-full pl-9 pr-1 gap-1.5 h-full relative z-10 pb-6">
                            {analytics.map((item, idx) => {
                                const maxAmt = 150000;
                                const heightPct = Math.min(100, (item.totalAmount / maxAmt) * 100);
                                return (
                                    <div key={idx} className="flex flex-col items-center gap-3 w-full h-full justify-end group">
                                        <div className="w-full max-w-[36px] h-[150px] flex items-end relative">
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#04222D] dark:bg-white text-white dark:text-[#04222D] text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                {formatCurrency(item.totalAmount)}
                                            </div>
                                            {/* Bar */}
                                            <div 
                                                className="w-full bg-[#1447E6] dark:bg-[#3B82F6] rounded-t-[32px] transition-all duration-500 ease-out relative z-10 hover:opacity-90" 
                                                style={{ height: `${heightPct}%` }}
                                            />
                                        </div>
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA] font-bold absolute bottom-0">{item.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Upcoming */}
                <div className="mb-8">
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-4 pl-1">Upcoming</h3>
                    <div className="bg-white dark:bg-[#1E1E1B] rounded-[20px] border border-[#F4F4F5] dark:border-[#27272A] shadow-sm overflow-hidden">
                        {upcoming.map((item, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => handleBookingClick(item.bookingId || item._id)}
                                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-[#27272A]/50 transition-colors ${idx !== upcoming.length - 1 ? 'border-b border-[#F4F4F5] dark:border-[#27272A]' : ''}`}
                            >
                                <div>
                                    <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] dark:text-white mb-0.5">{item.customerName}</h4>
                                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#A1A1AA] font-medium">{item.milestoneType} • {formatDate(item.eventDate)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] dark:text-white">+ ₹{formatCurrency(item.amount)}</span>
                                    <ChevronRight className="w-4 h-4 text-[#A1A1AA]" strokeWidth={2} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            )}

            {/* Upcoming Payment Details Modal Overlay */}
            <AnimatePresence>
                {selectedBooking && (
                    <motion.div 
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        className="fixed inset-0 z-[100] bg-white dark:bg-[#09090B] flex flex-col overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-4 border-b border-[#F4F4F5] dark:border-[#27272A] flex justify-between items-center">
                            <h1 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[20px] font-bold text-[#030303] dark:text-white">Upcoming Payment</h1>
                            <button onClick={() => setSelectedBooking(null)} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
                                <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
                            </button>
                        </div>

                        {isTimelineLoading || !timeline ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="animate-spin w-8 h-8 border-4 border-[#E95A6E] border-t-transparent rounded-full"></div>
                            </div>
                        ) : (
                            <div className="flex-1 px-5 pt-10 pb-32">
                                <div className="flex flex-col items-center mb-10">
                                    <h2 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[48px] font-bold text-[#030303] dark:text-white leading-tight">
                                        ₹{formatCurrency(timeline.nextPaymentDue?.amount || 0)}
                                    </h2>
                                    <div className="bg-[#F4F4F5] dark:bg-[#27272A] px-3 py-1 rounded-full mt-2">
                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#3F3F47] dark:text-[#E4E4E7]">Due amount</span>
                                    </div>
                                </div>

                                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-4 pl-1">Payment Timeline</h3>
                                
                                <div className="bg-white dark:bg-[#1E1E1B] rounded-[20px] border border-[#F4F4F5] dark:border-[#27272A] shadow-sm p-5 mb-8">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h4 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-0.5">{timeline.customerName}</h4>
                                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">BOOKING ID : {timeline.bookingId}</p>
                                        </div>
                                        <div className="text-right">
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#E85D04] block mb-0.5">₹{formatCurrency(timeline.nextPaymentDue?.amount || 0)}</span>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#030303] dark:text-white">Next Payment Due</span>
                                        </div>
                                    </div>

                                    {/* Horizontal Timeline Progress */}
                                    <div className="relative flex justify-between items-center mb-8 px-2">
                                        <div className="absolute left-6 right-6 top-[11px] h-1 bg-[#F4F4F5] dark:bg-[#27272A] -z-10"></div>
                                        <div className="absolute left-6 top-[11px] h-1 bg-[#3B82F6] -z-10" style={{ width: '40%' }}></div>

                                        {timeline.milestones.map((m: any, i: number) => {
                                            const isReceived = m.status === 'Received';
                                            const isDue = m.status === 'PaymentDue';
                                            
                                            let dotClass = "bg-[#E4E4E7] dark:bg-[#3F3F47]";
                                            let icon = <Circle className="w-3 h-3 text-[#A1A1AA]" />;
                                            
                                            if (isReceived) {
                                                dotClass = "bg-[#3B82F6]";
                                                icon = <Check className="w-3 h-3 text-white" strokeWidth={3} />;
                                            } else if (isDue) {
                                                dotClass = "bg-[#F59E0B]";
                                                icon = <Circle className="w-3 h-3 text-white fill-white" />;
                                            } else if (m.type === 'FinalClearance') {
                                                icon = <Lock className="w-3 h-3 text-[#A1A1AA]" strokeWidth={2.5} />;
                                            }

                                            return (
                                                <div key={i} className="flex flex-col items-center gap-2">
                                                    <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center ${dotClass} ring-4 ring-white dark:ring-[#1E1E1B]`}>
                                                        {icon}
                                                    </div>
                                                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[8px] font-bold text-[#3F3F47] dark:text-[#A1A1AA] uppercase">{m.type.replace('Advanced', 'ADVANCE ')}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="border-t border-[#F4F4F5] dark:border-[#27272A] pt-4 mb-4 flex justify-between items-center">
                                        <div>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-bold text-[#030303] dark:text-white block mb-0.5">₹{formatCurrency(timeline.totalReceived)} / ₹{formatCurrency(timeline.totalAmount)} Received</span>
                                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">EVENT : {formatDate(timeline.eventDate)}</span>
                                        </div>
                                        <ChevronDown className="w-5 h-5 text-[#A1A1AA]" />
                                    </div>

                                    {/* Vertical Milestones List */}
                                    <div className="flex flex-col gap-3">
                                        {timeline.milestones.map((m: any, i: number) => {
                                            const isReceived = m.status === 'Received';
                                            const isDue = m.status === 'PaymentDue';
                                            
                                            return (
                                                <div key={i} className={`flex items-center p-3 rounded-[12px] border border-[#F4F4F5] dark:border-[#27272A] ${isReceived ? 'bg-[#FAFAFA] dark:bg-[#27272A]' : 'bg-white dark:bg-[#1E1E1B]'}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isReceived ? 'bg-[#D1FAE5] dark:bg-[#064E3B]' : isDue ? 'bg-[#FEF3C7] dark:bg-[#78350F]' : 'bg-[#F4F4F5] dark:bg-[#27272A]'}`}>
                                                        {isReceived ? <Check className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} /> :
                                                         isDue ? <Circle className="w-4 h-4 text-[#F59E0B]" strokeWidth={2.5} /> :
                                                         <Lock className="w-4 h-4 text-[#A1A1AA]" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] dark:text-white mb-0.5">{m.type.replace('Advanced', 'Advanced ')}</h5>
                                                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] text-[#A1A1AA]">
                                                            {isReceived ? `Received on ${formatDate(m.receivedDate)}` : isDue ? `Due on ${formatDate(m.dueDate)}` : 'Pending project completion'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className={`text-[13px] font-bold block mb-0.5 ${isReceived ? 'text-[#030303] dark:text-white' : isDue ? 'text-[#030303] dark:text-white' : 'text-[#A1A1AA]'}`}>₹{formatCurrency(m.amount)}</span>
                                                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className={`text-[9px] font-bold uppercase tracking-wider ${isReceived ? 'text-[#10B981]' : isDue ? 'text-[#F59E0B]' : 'text-[#A1A1AA]'}`}>
                                                            {m.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
