'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, Package, AlertCircle, CheckCircle,
  ChevronRight, RefreshCw, Inbox, IndianRupee
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type PaymentType = 'FreeBooking' | 'AdvancePaid' | 'FullPaid';
type BookingStatus = 'Pending' | 'Accepted' | 'Declined' | 'Cancelled' | 'Completed';

interface Booking {
  _id: string;
  bookingId: string;
  customer: { name: string; phone?: string; email?: string };
  eventType?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  packageSnapshot: { name: string; price: number; image?: string; variantType?: string };
  paymentType: PaymentType;
  status: BookingStatus;
  totalAmount: number;
  totalReceived: number;
  conflictDetected?: boolean;
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Accepted', value: 'Accepted' },
  { label: 'Completed', value: 'Completed' },
];

const PAYMENT_BADGE: Record<PaymentType, { label: string; color: string; bg: string; border: string }> = {
  FreeBooking:  { label: 'FREE BOOKING',  color: '#000000', bg: '#E6E9EA', border: '#000000' },
  AdvancePaid:  { label: 'ADVANCE PAID',  color: '#16A34A', bg: '#DCFCE7', border: '#16A34A' },
  FullPaid:     { label: 'FULL PAID',     color: '#7C3AED', bg: '#EDE9FE', border: '#7C3AED' },
};

const STATUS_BADGE: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  Pending:   { label: 'PENDING',   color: '#D97706', bg: '#FEF3C7' },
  Accepted:  { label: 'ACCEPTED',  color: '#16A34A', bg: '#DCFCE7' },
  Declined:  { label: 'DECLINED',  color: '#DC2626', bg: '#FEE2E2' },
  Cancelled: { label: 'CANCELLED', color: '#6B7280', bg: '#F3F4F6' },
  Completed: { label: 'COMPLETED', color: '#7C3AED', bg: '#EDE9FE' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function formatTime(t?: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const DUMMY_BOOKINGS: Booking[] = [
  {
    _id: 'd1', bookingId: 'EVT-DUMMY-001',
    customer: { name: 'Rahul Sharma', phone: '9876543210' },
    eventType: 'Corporate Party',
    eventDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    startTime: '16:00', endTime: '20:00',
    packageSnapshot: { name: 'Corporate Premium Package', price: 25000, variantType: 'Premium' },
    paymentType: 'FreeBooking', status: 'Pending',
    totalAmount: 25000, totalReceived: 0, conflictDetected: true,
  },
  {
    _id: 'd2', bookingId: 'EVT-DUMMY-002',
    customer: { name: 'Rahul Sharma', phone: '9876543210' },
    eventType: 'Corporate Party',
    eventDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    startTime: '16:00', endTime: '20:00',
    packageSnapshot: { name: 'Corporate Premium Package', price: 25000, variantType: 'Premium' },
    paymentType: 'AdvancePaid', status: 'Accepted',
    totalAmount: 25000, totalReceived: 10000, conflictDetected: false,
  },
  {
    _id: 'd3', bookingId: 'EVT-DUMMY-003',
    customer: { name: 'Priya Mehta', phone: '9123456789' },
    eventType: 'Wedding',
    eventDate: new Date(Date.now() + 86400000 * 15).toISOString(),
    startTime: '11:00', endTime: '22:00',
    packageSnapshot: { name: 'Royal Wedding Package', price: 85000, variantType: 'Deluxe' },
    paymentType: 'FullPaid', status: 'Completed',
    totalAmount: 85000, totalReceived: 85000, conflictDetected: false,
  },
  {
    _id: 'd4', bookingId: 'EVT-DUMMY-004',
    customer: { name: 'Arjun Singh', phone: '9988776655' },
    eventType: 'Birthday Party',
    eventDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    startTime: '18:00', endTime: '22:00',
    packageSnapshot: { name: 'Party Starter Package', price: 15000, variantType: 'Standard' },
    paymentType: 'FreeBooking', status: 'Pending',
    totalAmount: 15000, totalReceived: 0, conflictDetected: false,
  },
];

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [showMockData, setShowMockData] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
  const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') || '' : '';

  const fetchBookings = useCallback(async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const statusParam = activeTab ? `&status=${activeTab}` : '';
      const res = await fetch(`${baseUrl}/bookings/vendor/${vendorId}?limit=50${statusParam}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error('Failed to fetch bookings', e);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, activeTab, baseUrl]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const displayedBookings = showMockData ? DUMMY_BOOKINGS : bookings;

  const handleAccept = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`${baseUrl}/bookings/${bookingId}/accept`, { method: 'PUT' });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'Accepted' } : b));
      }
    } catch (e) { console.error(e); }
    finally { setActionLoadingId(null); }
  };

  const handleDecline = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(`${baseUrl}/bookings/${bookingId}/decline`, { method: 'PUT' });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, status: 'Declined' } : b));
      }
    } catch (e) { console.error(e); }
    finally { setActionLoadingId(null); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] pb-32 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#09090B]/90 backdrop-blur-md z-40 px-5 pt-8 pb-0 border-b border-[#F4F4F5] dark:border-[#27272A]">
        <div className="flex justify-between items-center mb-4">
          <h1
            onDoubleClick={() => setShowMockData(v => !v)}
            title="Double-tap to toggle dummy data"
            style={{ fontFamily: 'Figtree, sans-serif' }}
            className={`text-[20px] font-bold cursor-pointer select-none transition-colors ${
              showMockData ? 'text-[#E95A6E]' : 'text-[#030303] dark:text-white'
            }`}
          >
            Bookings{showMockData ? ' ✦' : ''}
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchBookings} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <RefreshCw className="w-4 h-4 text-[#3F3F47] dark:text-[#E4E4E7]" />
            </button>
            <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
            </button>
          </div>
        </div>
        {/* Status Tabs */}
        <div className="flex gap-1 pb-0 overflow-x-auto scrollbar-hide">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{ fontFamily: 'Figtree, sans-serif' }}
              className={`px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap rounded-t-lg transition-all border-b-2 ${
                activeTab === tab.value
                  ? 'text-[#E95A6E] border-[#E95A6E] bg-[#FFF1F2] dark:bg-[#E95A6E]/10'
                  : 'text-[#71717B] dark:text-[#A1A1AA] border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] mb-5">
          View and manage your bookings
        </p>

        {showMockData && (
          <div className="mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-[10px] flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400 text-[11px] font-bold">✦ DUMMY DATA — double-click heading to hide</span>
          </div>
        )}
        {(!showMockData && isLoading) ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-[#1E1E1B] rounded-[16px] p-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-[#F4F4F5] dark:bg-[#27272A] rounded w-32" />
                  <div className="h-5 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full w-24" />
                </div>
                <div className="h-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded w-40 mb-2" />
                <div className="h-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded w-48 mb-4" />
                <div className="flex gap-3 p-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded-[12px] mb-4">
                  <div className="w-12 h-12 bg-[#E4E4E7] dark:bg-[#3F3F47] rounded-[8px]" />
                  <div className="flex-1">
                    <div className="h-3 bg-[#E4E4E7] dark:bg-[#3F3F47] rounded w-32 mb-2" />
                    <div className="h-4 bg-[#E4E4E7] dark:bg-[#3F3F47] rounded w-20" />
                  </div>
                </div>
                <div className="h-10 bg-[#F4F4F5] dark:bg-[#27272A] rounded-[10px]" />
              </div>
            ))}
          </div>
        ) : (!showMockData && bookings.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-[#A1A1AA]" strokeWidth={1.5} />
            </div>
            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-2">
              No bookings yet
            </h3>
            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] max-w-[220px]">
              {activeTab ? `No ${activeTab.toLowerCase()} bookings found.` : 'Your confirmed event bookings will appear here.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div className="flex flex-col gap-4">
              {displayedBookings.map((booking, idx) => {
                const payBadge = PAYMENT_BADGE[booking.paymentType];
                const statusBadge = STATUS_BADGE[booking.status];
                const isActionLoading = actionLoadingId === booking.bookingId;
                const isPending = booking.status === 'Pending';

                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 shadow-sm"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[15px] font-bold text-[#030303] dark:text-white">
                          {booking.customer.name}
                        </h3>
                      </div>
                      <div
                        style={{ 
                          fontFamily: 'Figtree, sans-serif', 
                          color: payBadge.color, 
                          backgroundColor: payBadge.bg,
                          border: `1px solid ${payBadge.border}`
                        }}
                        className="flex min-h-[24px] px-[12px] py-[4px] justify-end items-end gap-1 rounded-[999px] text-[10px] font-bold uppercase tracking-wider"
                      >
                        {payBadge.label}
                      </div>
                    </div>

                    {/* Event details */}
                    <div className="flex flex-col gap-1 mb-3">
                      {booking.eventType && (
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.5} />
                          <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA]">
                            {booking.eventType}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.5} />
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA]">
                          {formatDate(booking.eventDate)}
                          {(booking.startTime || booking.endTime) && (
                            <span className="ml-1">
                              • {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Package snapshot */}
                    <div className="flex gap-3 p-3 bg-[#F8F8F8] dark:bg-[#18181B] rounded-[12px] mb-3">
                      {booking.packageSnapshot.image ? (
                        <img src={booking.packageSnapshot.image} alt="pkg" className="w-12 h-12 object-cover rounded-[8px] shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-[#E4E4E7] dark:bg-[#3F3F47] rounded-[8px] flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-[#A1A1AA]" strokeWidth={1.5} />
                        </div>
                      )}
                      <div>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#71717B] dark:text-[#A1A1AA] mb-0.5">
                          {booking.packageSnapshot.variantType || 'Package'}
                        </p>
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-bold text-[#030303] dark:text-white">
                          {booking.packageSnapshot.name}
                        </p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <IndianRupee className="w-3 h-3 text-[#030303] dark:text-white" strokeWidth={2} />
                          <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] font-bold text-[#030303] dark:text-white">
                            {(booking.totalAmount || booking.packageSnapshot.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Conflict warning */}
                    {booking.conflictDetected && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <AlertCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" strokeWidth={2} />
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#EF4444] font-medium">
                          Dates conflicting with another event.{' '}
                          <button className="underline">Check</button>
                        </span>
                      </div>
                    )}

                    {/* Status info for non-pending */}
                    {!isPending && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <CheckCircle className="w-3.5 h-3.5 text-[#71717B] shrink-0" strokeWidth={1.5} />
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#71717B] dark:text-[#A1A1AA] font-medium">
                          {booking.status === 'Accepted' ? 'Your booking is confirmed' :
                           booking.status === 'Completed' ? 'This event has been completed' :
                           booking.status === 'Declined' ? 'This booking was declined' :
                           'This booking was cancelled'}
                        </span>
                      </div>
                    )}

                    {/* FreeBooking note */}
                    {isPending && booking.paymentType === 'FreeBooking' && (
                      <div className="flex items-start gap-1.5 mb-3">
                        <AlertCircle className="w-3.5 h-3.5 text-[#71717B] shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#71717B] dark:text-[#A1A1AA] font-medium">
                          This is a free booking, you can either accept or decline it.
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isPending && (
                        <button
                          onClick={() => handleAccept(booking.bookingId)}
                          disabled={isActionLoading}
                          style={{ fontFamily: 'Figtree, sans-serif' }}
                          className="flex-1 h-[42px] bg-[#04222D] dark:bg-[#E95A6E] text-white text-[13px] font-bold rounded-[10px] flex items-center justify-center active:scale-[0.98] transition-transform disabled:opacity-60"
                        >
                          {isActionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Accept booking'}
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/dashboard/bookings/${booking.bookingId}`)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`h-[42px] text-[13px] font-bold rounded-[10px] border border-[#E4E4E7] dark:border-[#3F3F47] bg-white dark:bg-[#18181B] text-[#3F3F47] dark:text-[#E4E4E7] flex items-center justify-center gap-1 active:scale-[0.98] transition-transform ${isPending ? 'px-4' : 'flex-1'}`}
                      >
                        View Details
                        <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
