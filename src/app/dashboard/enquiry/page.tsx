'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, AlertCircle, RefreshCw, Inbox,
  ChevronRight, IndianRupee, Zap, TrendingUp, Minus, Star, Info
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

type EnquiryStatus = 'NewEnquiry' | 'AwaitingResponse' | 'ProposalSent' | 'Converted' | 'Declined';
type MatchStrength = 'Strong' | 'Good' | 'Weak' | null;

interface Enquiry {
  _id: string;
  enquiryId: string;
  customer: { name: string; phone?: string; email?: string };
  eventType?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  budgetMin?: number;
  budgetMax?: number;
  requests: string[];
  matchStrength?: MatchStrength;
  status: EnquiryStatus;
  receivedAt: string;
  conflictDetected?: boolean;
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'New', value: 'NewEnquiry' },
  { label: 'Awaiting', value: 'AwaitingResponse' },
  { label: 'Proposal Sent', value: 'ProposalSent' },
];

const STATUS_BADGE: Record<EnquiryStatus, { label: string; color: string; bg: string; borderColor: string }> = {
  NewEnquiry:       { label: 'NEW ENQUIRY',     color: '#7C3AED', bg: '#EDE9FE', borderColor: '#C4B5FD' },
  AwaitingResponse: { label: 'AWAITING RESPONSE', color: '#D97706', bg: '#FEF3C7', borderColor: '#FCD34D' },
  ProposalSent:     { label: 'PROPOSAL SENT',   color: '#0369A1', bg: '#E0F2FE', borderColor: '#7DD3FC' },
  Converted:        { label: 'CONVERTED',        color: '#16A34A', bg: '#DCFCE7', borderColor: '#86EFAC' },
  Declined:         { label: 'DECLINED',         color: '#DC2626', bg: '#FEE2E2', borderColor: '#FCA5A5' },
};

const MATCH_ICON: Record<NonNullable<MatchStrength>, { icon: React.ReactNode; label: string; color: string }> = {
  Strong: { icon: <Zap className="w-3 h-3" strokeWidth={2.5} />,      label: 'Strong Match', color: '#16A34A' },
  Good:   { icon: <TrendingUp className="w-3 h-3" strokeWidth={2.5} />, label: 'Good Match',   color: '#D97706' },
  Weak:   { icon: <Minus className="w-3 h-3" strokeWidth={2.5} />,    label: 'Weak Match',   color: '#6B7280' },
};

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function formatTime(t?: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatBudget(min?: number, max?: number) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1).replace('.0', '')}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

const DUMMY_ENQUIRIES: Enquiry[] = [
  {
    _id: 'e1', enquiryId: 'ENQ-DUMMY-001',
    customer: { name: 'Rahul Sharma', phone: '9876543210' },
    eventType: 'Corporate Party',
    eventDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    startTime: '16:00', endTime: '20:00',
    budgetMin: 250000, budgetMax: 400000,
    requests: ['Live Station', 'Chat counter', 'Valet Parking', 'DJ'],
    matchStrength: 'Strong',
    status: 'NewEnquiry',
    receivedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    conflictDetected: true,
  },
  {
    _id: 'e2', enquiryId: 'ENQ-DUMMY-002',
    customer: { name: 'Rahul Sharma', phone: '9876543210' },
    eventType: 'Corporate Party',
    eventDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    startTime: '16:00', endTime: '20:00',
    budgetMin: 250000, budgetMax: 400000,
    requests: ['Live Station', 'Chat counter', 'Valet Parking'],
    matchStrength: 'Strong',
    status: 'AwaitingResponse',
    receivedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    conflictDetected: true,
  },
  {
    _id: 'e3', enquiryId: 'ENQ-DUMMY-003',
    customer: { name: 'Priya Mehta', phone: '9123456789' },
    eventType: 'Wedding',
    eventDate: new Date(Date.now() + 86400000 * 22).toISOString(),
    startTime: '11:00', endTime: '22:00',
    budgetMin: 800000, budgetMax: 1500000,
    requests: ['Floral Decor', 'Catering', 'Photography', 'Mehendi'],
    matchStrength: 'Good',
    status: 'ProposalSent',
    receivedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    conflictDetected: false,
  },
  {
    _id: 'e4', enquiryId: 'ENQ-DUMMY-004',
    customer: { name: 'Rahul Sharma', phone: '9876543210' },
    eventType: 'Corporate Party',
    eventDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    startTime: '16:00', endTime: '20:00',
    budgetMin: 250000, budgetMax: 400000,
    requests: ['Live Station', 'Chat counter', 'Security'],
    matchStrength: 'Strong',
    status: 'ProposalSent',
    receivedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    conflictDetected: true,
  },
];

export default function EnquiryPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showMockData, setShowMockData] = useState(false);

  
  const vendorId = typeof window !== 'undefined' ? localStorage.getItem('vendor_id') || '' : '';

  const fetchEnquiries = useCallback(async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const statusParam = activeTab ? `&status=${activeTab}` : '';
      const res = await fetch(apiUrl(`/enquiries/vendor/${vendorId}?limit=50${statusParam}`));
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (e) {
      console.error('Failed to fetch enquiries', e);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, activeTab]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const updateStatus = async (enquiryId: string, newStatus: EnquiryStatus) => {
    setUpdatingId(enquiryId);
    try {
      const res = await fetch(apiUrl(`/enquiries/${enquiryId}/status`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEnquiries(prev =>
          prev.map(e => e.enquiryId === enquiryId ? { ...e, status: newStatus } : e)
        );
      }
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const displayedEnquiries = showMockData ? DUMMY_ENQUIRIES : enquiries;

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
            Enquiry{showMockData ? ' ✦' : ''}
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchEnquiries} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <RefreshCw className="w-4 h-4 text-[#3F3F47] dark:text-[#E4E4E7]" />
            </button>
            <button onClick={() => router.push('/dashboard/menu')} className="w-[36px] h-[36px] bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center active:scale-95 transition-transform">
              <X className="w-5 h-5 text-[#3F3F47] dark:text-[#E4E4E7]" />
            </button>
          </div>
        </div>
        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
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
          View and manage your enquiries
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
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full w-24" />
                  <div className="h-3 bg-[#F4F4F5] dark:bg-[#27272A] rounded w-20" />
                </div>
                <div className="h-5 bg-[#F4F4F5] dark:bg-[#27272A] rounded w-36 mb-3" />
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="h-14 bg-[#F4F4F5] dark:bg-[#27272A] rounded-[10px]" />
                  <div className="h-14 bg-[#F4F4F5] dark:bg-[#27272A] rounded-[10px]" />
                </div>
                <div className="h-10 bg-[#F4F4F5] dark:bg-[#27272A] rounded-[10px]" />
              </div>
            ))}
          </div>
        ) : (!showMockData && enquiries.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-[#A1A1AA]" strokeWidth={1.5} />
            </div>
            <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-2">
              No enquiries yet
            </h3>
            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#71717B] dark:text-[#A1A1AA] max-w-[220px]">
              Customer enquiries and leads will show up here.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div className="flex flex-col gap-4">
              {displayedEnquiries.map((enq, idx) => {
                const badge = STATUS_BADGE[enq.status];
                const match = enq.matchStrength ? MATCH_ICON[enq.matchStrength] : null;
                const budget = formatBudget(enq.budgetMin, enq.budgetMax);
                const isUpdating = updatingId === enq.enquiryId;
                const isTerminal = enq.status === 'Converted' || enq.status === 'Declined';
                const extraRequests = enq.requests.length > 2 ? enq.requests.length - 2 : 0;

                return (
                  <motion.div
                    key={enq._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-[#1E1E1B] border border-[#F4F4F5] dark:border-[#27272A] rounded-[16px] p-4 shadow-sm"
                  >
                    {/* Status badge + time */}
                    <div className="flex justify-between items-center mb-2">
                      <span
                        style={{
                          fontFamily: 'Figtree, sans-serif',
                          color: badge.color,
                          backgroundColor: badge.bg,
                          borderColor: badge.borderColor,
                        }}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider"
                      >
                        {badge.label}
                      </span>
                      <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] text-[#A1A1AA]">
                        Received {timeAgo(enq.receivedAt)}
                      </span>
                    </div>

                    {/* Customer name */}
                    <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] dark:text-white mb-3">
                      {enq.customer.name}
                    </h3>

                    {/* Event details */}
                    {(enq.eventType || enq.eventDate) && (
                      <div className="mb-3">
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
                          EVENT
                        </p>
                        {enq.eventType && (
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Star className="w-4 h-4 text-[#3F3F47] dark:text-[#E4E4E7]" strokeWidth={1.5} />
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47] dark:text-[#E4E4E7]">
                              {enq.eventType}
                            </span>
                          </div>
                        )}
                        {enq.eventDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#A1A1AA]" strokeWidth={1.5} />
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47] dark:text-[#E4E4E7]">
                              {formatDate(enq.eventDate)}
                              {(enq.startTime || enq.endTime) && ` • ${formatTime(enq.startTime)} – ${formatTime(enq.endTime)}`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Budget + Requests */}
                    {(budget || enq.requests.length > 0) && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {budget && (
                          <div>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
                              BUDGET
                            </p>
                            <div className="flex items-center">
                              <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#000] dark:text-white">
                                {budget}
                              </span>
                            </div>
                            {match && (
                              <div className="flex items-center gap-1 mt-1" style={{ color: match.color }}>
                                {match.icon}
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[11px] font-semibold">
                                  {match.label}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        {enq.requests.length > 0 && (
                          <div>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
                              REQUESTS
                            </p>
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[13px] text-[#3F3F47] dark:text-[#E4E4E7]">
                              {enq.requests.slice(0, 2).join(', ')}
                              {extraRequests > 0 && (
                                <span className="text-[#71717B]"> + {extraRequests} Others</span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Conflict warning */}
                    {enq.conflictDetected && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Info className="w-4 h-4 text-[#E11D48] shrink-0" strokeWidth={2} />
                        <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] text-[#E11D48] font-medium flex items-center gap-1">
                          Dates conflicting with another event.
                          <button style={{ color: '#1447E6' }} className="text-[14px] font-semibold underline">Check</button>
                        </span>
                      </div>
                    )}

                    {/* Quick status change + view */}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => router.push(`/dashboard/enquiry/${enq.enquiryId}`)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="flex-1 h-[42px] border border-[#E4E4E7] dark:border-[#3F3F47] bg-white dark:bg-[#18181B] text-[#3F3F47] dark:text-[#E4E4E7] text-[13px] font-bold rounded-[10px] flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
                      >
                        View Details
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
