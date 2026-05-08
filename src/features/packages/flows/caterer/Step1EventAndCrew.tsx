'use client';

import React from 'react';

interface Props {
    tastingSession: string; setTastingSession: (v: string) => void;
    venueNeeds: string[]; toggleVenueNeed: (v: string) => void;
    venueRequest: string; setVenueRequest: (v: string) => void;
    venueNeedsOptions: string[];
}

export default function CatererStep1EventAndCrew({
    tastingSession, setTastingSession,
    venueNeeds, toggleVenueNeed,
    venueRequest, setVenueRequest,
    venueNeedsOptions,
}: Props) {
    return (
        <div className="flex flex-col gap-8 pb-32">
            {/* Tasting Session */}
            <div>
                <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#3F3F47] leading-[20px] mb-3">Tasting session offered before the Booking?</p>
                <div className="flex items-center gap-10">
                    {['Yes', 'No'].map((opt) => (
                        <label key={opt} className="flex items-center gap-[12px] cursor-pointer" onClick={() => setTastingSession(opt)}>
                            <div className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center transition-colors ${tastingSession === opt ? 'border-[#030303]' : 'border-[#D4D4D8]'}`}>
                                {tastingSession === opt && <div className="w-3.5 h-3.5 rounded-full bg-[#030303]" />}
                            </div>
                            <span style={{ fontFamily: 'Figtree, sans-serif', fontSize: '18px', fontWeight: 400, lineHeight: '24px', color: '#27272A' }}>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Venue Needs */}
            <div className="bg-[#FAFAFA] p-5 rounded-[16px] border border-[#E4E4E7]">
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-bold text-[#030303] mb-4">Specific Needs for Venue</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                    {venueNeedsOptions.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => toggleVenueNeed(opt)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`px-6 py-3 rounded-full text-[14px] font-semibold border transition-all ${venueNeeds.includes(opt) ? 'bg-[#04222D] text-white border-[#04222D]' : 'bg-white text-[#3F3F47] border-[#E4E4E7]'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-semibold text-[#3F3F47]">Specific Request</label>
                    <input
                        type="text"
                        placeholder="Type your request"
                        value={venueRequest}
                        onChange={(e) => setVenueRequest(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[15px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9]"
                    />
                </div>
            </div>
        </div>
    );
}
