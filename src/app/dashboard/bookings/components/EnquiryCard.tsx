import React from 'react';
import { Clock, Calendar, AlertCircle, CheckCircle, TrendingUp, Star } from 'lucide-react';

export interface EnquiryData {
  _id: string;
  enquiryId: string;
  customer: { name: string; phone?: string; email?: string };
  eventType?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  budgetMin?: number;
  budgetMax?: number;
  requests?: string[];
  matchStrength?: string;
  conflictDetected?: boolean;
  status: string;
  receivedAt: string;
}

interface Props {
  enquiry: EnquiryData;
  onViewDetails: (id: string) => void;
}

function timeAgo(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Received just now';
  if (diffHrs < 24) return `Received ${diffHrs} hrs ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `Received ${diffDays} days ago`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function formatTime(t?: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatMoney(amount?: number) {
  if (!amount) return '0';
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function EnquiryCard({ enquiry, onViewDetails }: Props) {
  const getStatusBadge = () => {
    switch (enquiry.status) {
      case 'NewEnquiry':
        return { label: 'NEW ENQUIRY', color: '#8B5CF6', border: '#C4B5FD', bg: '#F5F3FF' };
      case 'ProposalSent':
        return { label: 'PROPOSAL SENT', color: '#3B82F6', border: '#93C5FD', bg: '#EFF6FF' };
      case 'Converted':
        return { label: 'PROPOSAL CONFIRMED', color: '#10B981', border: '#6EE7B7', bg: '#ECFDF5' };
      default:
        return { label: enquiry.status.toUpperCase(), color: '#6B7280', border: '#D1D5DB', bg: '#F3F4F6' };
    }
  };

  const badge = getStatusBadge();
  const dateFormatted = formatDate(enquiry.eventDate);
  const timeFormatted = [formatTime(enquiry.startTime), formatTime(enquiry.endTime)].filter(Boolean).join(' - ');
  
  const displayRequests = () => {
    if (!enquiry.requests || enquiry.requests.length === 0) return '—';
    const firstTwo = enquiry.requests.slice(0, 2).join(', ');
    const rest = enquiry.requests.length - 2;
    if (rest > 0) {
      return (
        <span className="text-[#3F3F47] text-[13px] font-medium font-figtree">
          {firstTwo} + <span className="font-bold text-[#030303]">{rest} Others</span>
        </span>
      );
    }
    return <span className="text-[#3F3F47] text-[13px] font-medium font-figtree">{firstTwo}</span>;
  };

  const budgetStr = enquiry.budgetMin && enquiry.budgetMax 
    ? `${formatMoney(enquiry.budgetMin)} - ${formatMoney(enquiry.budgetMax)}`
    : (enquiry.budgetMin ? `Min ${formatMoney(enquiry.budgetMin)}` : '—');

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-[#F0F0F1] flex flex-col relative overflow-hidden">
      {/* Left indicator bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: badge.color }} />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div 
          className="px-2.5 py-1 rounded-full text-[10px] font-bold border"
          style={{ color: badge.color, borderColor: badge.border, backgroundColor: badge.bg, fontFamily: 'Figtree, sans-serif' }}
        >
          {badge.label}
        </div>
        <span className="text-[#A1A1AA] text-[12px] font-medium font-figtree">
          {timeAgo(enquiry.receivedAt)}
        </span>
      </div>

      {/* Customer Name */}
      <h3 className="text-[18px] font-bold text-[#030303] font-figtree mb-4">
        {enquiry.customer?.name || 'Unknown'}
      </h3>

      {/* Event Details */}
      <div className="flex flex-col gap-2 mb-5">
        <span className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-wider font-figtree mb-0.5">EVENT</span>
        <div className="flex items-center gap-2">
          <Star size={16} className="text-[#3F3F47]" strokeWidth={1.5} />
          <span className="text-[#3F3F47] text-[14px] font-medium font-figtree">{enquiry.eventType || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#3F3F47]" strokeWidth={1.5} />
          <span className="text-[#3F3F47] text-[14px] font-medium font-figtree">
            {dateFormatted}{timeFormatted ? ` • ${timeFormatted}` : ''}
          </span>
        </div>
      </div>

      {/* Budget and Requests Row */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-wider font-figtree">BUDGET</span>
          <span className="text-[#030303] text-[15px] font-bold font-figtree">{budgetStr}</span>
          {enquiry.matchStrength === 'Strong' && (
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-[#10B981]" />
              <span className="text-[#10B981] text-[11px] font-bold font-figtree">Strong Match</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-wider font-figtree">REQUESTS</span>
          {displayRequests()}
        </div>
      </div>

      {/* Conflict Warning */}
      {enquiry.conflictDetected && (
        <div className="flex items-center gap-2 mb-5">
          <AlertCircle size={16} className="text-[#EF4444]" />
          <span className="text-[#EF4444] text-[13px] font-medium font-figtree">
            Dates conflicting with another event. <span className="text-[#3B82F6] font-bold cursor-pointer">Check</span>
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-[#F0F0F1] border-dashed flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#71717B]" />
          <span className="text-[#71717B] text-[13px] font-medium font-figtree">
            {enquiry.status === 'NewEnquiry' ? 'Respond within 24hrs' : 
             enquiry.status === 'AwaitingResponse' ? 'Awaiting response' : 'Awaiting response'}
          </span>
        </div>
        <button 
          onClick={() => onViewDetails(enquiry._id)}
          className="border border-[#04222D] text-[#04222D] px-4 py-2 rounded-xl text-[14px] font-bold font-figtree active:bg-[#04222D] active:text-white transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
