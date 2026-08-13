'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MoreVertical, Clock, Calendar, AlertCircle, TrendingUp, Star,
  MapPin, MessageSquare, IndianRupee, Users, ExternalLink, Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import { EnquiryData } from '../../components/EnquiryCard';
import { DUMMY_ENQUIRIES, DetailedEnquiry } from '../../data/mockData';



function timeAgo(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Received just now';
  if (diffHrs < 24) return `Received ${diffHrs}hrs ago`;
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

export default function EnquiryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const enquiryId = params?.id as string;
  
  const [enquiry, setEnquiry] = useState<DetailedEnquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMockData, setShowMockData] = useState(false);

  const fetchEnquiry = useCallback(async () => {
    if (!enquiryId) return;

    // Check if it's a dummy enquiry to avoid unnecessary backend calls
    if (DUMMY_ENQUIRIES.some(e => e._id === enquiryId || e.enquiryId === enquiryId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(apiUrl(`/enquiries/${enquiryId}`));
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'SUCCESS' && data.enquiry) {
          setEnquiry(data.enquiry);
        } else if (data.status === 'SUCCESS' && data.data) {
          setEnquiry(data.data);
        } else {
          setEnquiry(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch enquiry', e);
    } finally {
      setIsLoading(false);
    }
  }, [enquiryId]);

  useEffect(() => {
    fetchEnquiry();
  }, [fetchEnquiry]);

  const dummyEnquiryMatch = DUMMY_ENQUIRIES.find(e => e._id === enquiryId || e.enquiryId === enquiryId);
  
  const displayedEnquiry = showMockData 
    ? (dummyEnquiryMatch || DUMMY_ENQUIRIES[0])
    : (dummyEnquiryMatch || enquiry);

  if (isLoading && !showMockData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#04222D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!displayedEnquiry) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-[#A1A1AA] mb-4" />
        <h2 className="text-xl font-bold text-[#030303] mb-2 font-figtree">Enquiry Not Found</h2>
        <p className="text-[#71717B] mb-6 font-figtree">This enquiry may have been deleted or you don't have permission to view it.</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-[#04222D] text-white rounded-xl font-bold font-figtree">Go Back</button>
      </div>
    );
  }

  const isPending = displayedEnquiry.status === 'NewEnquiry' || displayedEnquiry.status === 'AwaitingResponse';
  const dateFormatted = formatDate(displayedEnquiry.eventDate);
  const timeFormatted = [formatTime(displayedEnquiry.startTime), formatTime(displayedEnquiry.endTime)].filter(Boolean).join(' - ');
  const budgetStr = displayedEnquiry.budgetMin && displayedEnquiry.budgetMax 
    ? `${formatMoney(displayedEnquiry.budgetMin)} - ${formatMoney(displayedEnquiry.budgetMax)}`
    : (displayedEnquiry.budgetMin ? `Min ${formatMoney(displayedEnquiry.budgetMin)}` : '—');

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col font-figtree pb-24">
      {/* Solid White Top Bar */}
      <div className="w-full bg-white px-5 pt-14 pb-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="active:scale-95 transition-transform">
            <ArrowLeft size={24} className="text-[#030303]" />
          </button>
          <h1 
            onDoubleClick={() => setShowMockData(v => !v)}
            title="Double-tap to toggle dummy data"
            className="text-[20px] font-bold text-[#030303] cursor-pointer select-none"
          >
            Enquiry Details{showMockData ? ' ✦' : ''}
          </h1>
        </div>
        <button className="active:scale-95 transition-transform">
          <MoreVertical size={24} className="text-[#030303]" />
        </button>
      </div>

      {/* Hero Image */}
      {displayedEnquiry.eventImageUrl && (
        <div className="w-full h-[196px] bg-[#F4F4F5]">
          <img src={displayedEnquiry.eventImageUrl} alt="" className="w-full h-full object-cover text-transparent" />
        </div>
      )}

      {/* Main Content */}
      <div className="px-5 pt-5 relative z-20 flex flex-col gap-6">
        {/* Top Alert Banner */}
        {isPending && (
          <div className="bg-[#FFFAEC] border border-[#FEF3C7] rounded-[16px] p-4 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D97706]" />
              <span className="text-[#D97706] text-[14px] font-bold">Still waiting on your proposal</span>
            </div>
            <span className="text-[#4B5563] text-[13px] ml-4 font-medium">Only 4 hrs left to respond</span>
            <div className="flex items-center gap-1.5 ml-4 mt-1">
              <Clock size={12} className="text-[#9CA3AF]" />
              <span className="text-[#9CA3AF] text-[11px] font-medium">{timeAgo(displayedEnquiry.receivedAt)}</span>
            </div>
          </div>
        )}

        {/* Event Details Card */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[16px] font-bold text-[#030303]">Event details</h2>
          <div className="bg-white rounded-[16px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#F0F0F1] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1.5">
                <div className="w-fit px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#F97316] text-[#F97316] bg-[#FFF7ED]">
                  VIEWED
                </div>
                <h3 className="text-[18px] font-bold text-[#030303]">
                  {displayedEnquiry.customer?.name || 'Unknown'}
                </h3>
              </div>
              <span className="text-[#A1A1AA] text-[12px] font-medium">
                {timeAgo(displayedEnquiry.receivedAt)}
              </span>
            </div>

            {/* Event Info */}
            <div className="flex flex-col gap-2 mb-5">
              <span className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-wider mb-0.5">EVENT</span>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-[#3F3F47]" strokeWidth={1.5} />
                <span className="text-[#3F3F47] text-[14px] font-medium">{displayedEnquiry.eventType || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#3F3F47]" strokeWidth={1.5} />
                <span className="text-[#3F3F47] text-[14px] font-medium">
                  {dateFormatted}{timeFormatted ? ` • ${timeFormatted}` : ''}
                </span>
              </div>
            </div>

            {/* Budget & Requests */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#F0F0F1] border-dashed mb-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-wider">BUDGET</span>
                <span className="text-[#030303] text-[15px] font-bold">{budgetStr}</span>
                {displayedEnquiry.matchStrength === 'Strong' && (
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} className="text-[#10B981]" />
                    <span className="text-[#10B981] text-[11px] font-bold">Strong Match</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-wider">REQUESTS</span>
                <span className="text-[#3F3F47] text-[13px] font-medium leading-tight">
                  {displayedEnquiry.requests?.slice(0, 2).join(', ') || '—'}
                  {displayedEnquiry.requests && displayedEnquiry.requests.length > 2 && (
                    <span> + <span className="font-bold text-[#030303]">{displayedEnquiry.requests.length - 2} Others</span></span>
                  )}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#71717B]" />
                <span className="text-[#71717B] text-[13px] font-medium">{displayedEnquiry.venueName || 'Location not specified'}</span>
              </div>
              {displayedEnquiry.venueName && (
                <button className="flex items-center gap-1 text-[#3B82F6] text-[12px] font-bold">
                  See on map <ExternalLink size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reasons for Enquiry */}
        {(displayedEnquiry.questionnaire && displayedEnquiry.questionnaire.length > 0) && (
          <div className="flex flex-col gap-3">
            <h2 className="text-[16px] font-bold text-[#030303]">Reasons for Enquiry</h2>
            <div className="bg-white rounded-[16px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#F0F0F1] flex flex-col gap-5">
              <div className="w-fit px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#FBBF24] text-[#D97706] bg-[#FFFBEB] flex items-center gap-1">
                <MessageSquare size={10} />
                Enquiry for Price
              </div>
              
              {displayedEnquiry.expectedBudgetStr && (
                <div className="flex flex-col gap-1">
                  <span className="text-[#71717B] text-[11px] font-medium">Expected budget</span>
                  <span className="text-[#030303] text-[14px] font-bold">{displayedEnquiry.expectedBudgetStr}</span>
                </div>
              )}

              {displayedEnquiry.questionnaire.map((q, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <span className="text-[#A1A1AA] text-[11px] font-medium leading-tight">{q.question}</span>
                  {q.question === 'Message from customer' ? (
                    <div className="bg-[#F4F4F5] p-3 rounded-[8px] mt-1">
                      <span className="text-[#71717B] text-[13px] italic leading-snug block">{q.answer}</span>
                    </div>
                  ) : (
                    <span className="text-[#030303] text-[14px] font-bold leading-snug">{q.answer}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirement details */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[16px] font-bold text-[#030303]">Requirement details</h2>
          <div className="bg-white rounded-[16px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#F0F0F1] flex flex-col gap-6">
            
            {/* Primary Package */}
            {displayedEnquiry.primaryPackage && (
              <div className="flex flex-col gap-2">
                <span className="text-[#71717B] text-[13px] font-bold">Primary Package</span>
                <div className="flex items-center gap-3 bg-[#FAFAFA] p-2 rounded-[12px] border border-[#F0F0F1]">
                  <img src={displayedEnquiry.primaryPackage.image} alt="Package" className="w-12 h-12 rounded-[8px] object-cover" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[#3F3F47] text-[13px] font-bold">{displayedEnquiry.primaryPackage.name}</span>
                    <div className="flex items-center gap-0.5">
                      <IndianRupee size={12} className="text-[#030303]" />
                      <span className="text-[#030303] text-[14px] font-bold">{displayedEnquiry.primaryPackage.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="flex flex-col gap-3">
              <span className="text-[#71717B] text-[13px] font-bold">Overview</span>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex flex-col gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-1">
                    <Users size={12} className="text-[#3B82F6]" />
                  </div>
                  <span className="text-[#A1A1AA] text-[11px] font-medium">Guests count</span>
                  <span className="text-[#030303] text-[13px] font-bold">{displayedEnquiry.guestCountStr || displayedEnquiry.guestCountMax || '—'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#F5F3FF] flex items-center justify-center mb-1">
                    <Clock size={12} className="text-[#8B5CF6]" />
                  </div>
                  <span className="text-[#A1A1AA] text-[11px] font-medium">Time Slot</span>
                  <span className="text-[#030303] text-[13px] font-bold">{timeFormatted || '—'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#FFF7ED] flex items-center justify-center mb-1">
                    <Calendar size={12} className="text-[#F97316]" />
                  </div>
                  <span className="text-[#A1A1AA] text-[11px] font-medium">Date</span>
                  <span className="text-[#030303] text-[13px] font-bold">{displayedEnquiry.eventDate ? new Date(displayedEnquiry.eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-1">
                    <MapPin size={12} className="text-[#10B981]" />
                  </div>
                  <span className="text-[#A1A1AA] text-[11px] font-medium">Location</span>
                  <span className="text-[#030303] text-[13px] font-bold">{displayedEnquiry.venueName || '—'}</span>
                </div>
              </div>
            </div>

            {/* New Requests */}
            {displayedEnquiry.detailedRequests && displayedEnquiry.detailedRequests.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-[#71717B] text-[13px] font-bold">New Requests</span>
                <div className="flex flex-col gap-4 bg-[#FAFAFA] rounded-[16px] p-4 border border-[#F0F0F1]">
                  {displayedEnquiry.detailedRequests.map((req, idx) => (
                    <div key={idx} className={`flex flex-col gap-3 ${idx !== displayedEnquiry.detailedRequests!.length - 1 ? 'pb-4 border-b border-[#E4E4E7] border-dashed' : ''}`}>
                      <div className="flex flex-col items-center justify-center mb-1">
                        <span className="text-[#A1A1AA] text-[9px] font-bold uppercase tracking-wider">{req.category}</span>
                        <span className="text-[#030303] text-[12px] font-bold uppercase text-center">{req.title}</span>
                      </div>
                      {/* Flat Fields (Backward compatibility) */}
                      {req.fields && req.fields.length > 0 && (
                        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                          {req.fields.map((field, fIdx) => (
                            <div key={fIdx} className="flex flex-col gap-1">
                              <span className="text-[#A1A1AA] text-[10px] font-medium leading-tight">{field.label}</span>
                              <span className="text-[#030303] text-[12px] font-bold leading-tight">{field.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Nested Sections (For Decorator/Caterer) */}
                      {req.sections && req.sections.length > 0 && (
                        <div className="flex flex-col gap-6">
                          {req.sections.map((sec, sIdx) => (
                            <div key={sIdx} className="flex flex-col gap-3">
                              {/* Divider Text */}
                              {sec.dividerText && (
                                <div className="flex items-center justify-center gap-2 mb-2">
                                  <div className="flex-1 h-[1px] bg-[#FEE2E2]"></div>
                                  <span className="text-[#F59E0B] text-[10px] font-bold tracking-wider">{sec.dividerText}</span>
                                  <div className="flex-1 h-[1px] bg-[#FEE2E2]"></div>
                                </div>
                              )}

                              {/* Section Title (e.g., FLORAL ARCH) */}
                              {sec.title && (
                                <div className="flex justify-center mb-1">
                                  <span className="text-[#030303] text-[12px] font-bold uppercase tracking-wider">{sec.title}</span>
                                </div>
                              )}

                              {/* Subtitle with Optional Label (e.g., Setup Name: NAME OF ITEM) */}
                              {sec.subtitle && (
                                <div className="flex flex-col items-center justify-center mb-2">
                                  {sec.subtitleLabel && <span className="text-[#A1A1AA] text-[9px] font-medium tracking-wider mb-0.5">{sec.subtitleLabel}</span>}
                                  <span className="text-[#030303] text-[11px] font-bold uppercase tracking-wider">{sec.subtitle}</span>
                                </div>
                              )}
                              
                              {/* Section Fields */}
                              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                {sec.fields.map((field, fIdx) => {
                                  // Simple hack to render +2more in blue if present in string
                                  const parts = field.value.split(/(?=\+\d+more)/);
                                  return (
                                    <div key={fIdx} className="flex flex-col gap-1">
                                      <span className="text-[#A1A1AA] text-[10px] font-medium leading-tight">{field.label}</span>
                                      <span className="text-[#030303] text-[12px] font-bold leading-tight">
                                        {parts.map((p, i) => 
                                          p.startsWith('+') ? <span key={i} className="text-[#3B82F6] font-medium ml-1">{p}</span> : p
                                        )}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inspiration & Attachments */}
            {displayedEnquiry.attachments && displayedEnquiry.attachments.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Paperclip size={14} className="text-[#71717B]" />
                  <span className="text-[#030303] text-[14px] font-bold">Inspiration & Attachments</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {displayedEnquiry.attachments.map((att, idx) => (
                    <div key={idx} className="relative w-[120px] h-[120px] rounded-[12px] overflow-hidden shrink-0 bg-[#F4F4F5] border border-[#E4E4E7]">
                      {att.url.includes('unsplash') || att.url.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                        <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#A1A1AA]">
                          <ImageIcon size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                      <span className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-medium truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F1] p-4 flex gap-3 z-50 pb-safe">
        <button 
          onClick={() => router.push(`/dashboard/bookings/enquiry/${enquiryId}/customise`)}
          className="flex-1 h-[48px] border-2 border-[#04222D] text-[#04222D] rounded-[12px] font-bold text-[14px] active:bg-[#04222D] active:text-white transition-colors"
        >
          Customise Proposal
        </button>
        <button className="flex-1 h-[48px] bg-[#04222D] text-white rounded-[12px] font-bold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <MessageSquare size={18} />
          Chat with E.M
        </button>
      </div>

    </div>
  );
}
