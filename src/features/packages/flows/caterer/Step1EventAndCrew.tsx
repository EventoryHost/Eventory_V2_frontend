'use client';

import React from 'react';
import { Check, Plus } from 'lucide-react';

interface Props {
    // Basic Information
    packageName: string; setPackageName: (v: string) => void;
    eventCategories: string; setEventCategories: (v: string) => void;

    // Technical Setup
    minDuration: string; setMinDuration: (v: string) => void;
    maxDuration: string; setMaxDuration: (v: string) => void;
    minCrewSize: string; setMinCrewSize: (v: string) => void;
    maxCrewSize: string; setMaxCrewSize: (v: string) => void;
    minCapacity: string; setMinCapacity: (v: string) => void;
    maxCapacity: string; setMaxCapacity: (v: string) => void;

    // Requirement-Focused
    tastingSession: string; setTastingSession: (v: string) => void;
    venueNeeds: string[]; toggleVenueNeed: (v: string) => void;
    venueRequest: string; setVenueRequest: (v: string) => void;
    venueNeedsOptions: string[];
}

const CARD  = 'bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col gap-6';
const LABEL = 'text-[14px] font-normal text-[#3F3F47] leading-[20px]';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const HEAD  = 'text-[18px] font-bold text-[#030303] leading-[24px]';
const RADIO_LABEL = 'text-[16px] font-normal text-[#27272A] leading-[24px]';

export default function CatererStep1EventAndCrew({
    packageName, setPackageName,
    eventCategories, setEventCategories,
    minDuration, setMinDuration,
    maxDuration, setMaxDuration,
    minCrewSize, setMinCrewSize,
    maxCrewSize, setMaxCrewSize,
    minCapacity, setMinCapacity,
    maxCapacity, setMaxCapacity,
    tastingSession, setTastingSession,
    venueNeeds, toggleVenueNeed,
    venueRequest, setVenueRequest,
    venueNeedsOptions,
}: Props) {
    return (
        <div className="flex flex-col gap-6 pb-32">

            {/* ── Basic Information ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Basic Information*</h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Name of the package</label>
                    <input
                        type="text"
                        placeholder="Package Name"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={INPUT}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Select Categories of Events</label>
                    <input
                        type="text"
                        placeholder="Type Events Categories"
                        value={eventCategories}
                        onChange={(e) => setEventCategories(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={INPUT}
                    />
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1">Helper Text according to Input field.</p>
                </div>
            </div>

            {/* ── Technical Setup ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Technical Setup</h3>

                {/* Duration */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Min Duration</label>
                        <input
                            type="text"
                            placeholder="Number"
                            value={minDuration}
                            onChange={(e) => setMinDuration(e.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Max Duration</label>
                        <input
                            type="text"
                            placeholder="Number"
                            value={maxDuration}
                            onChange={(e) => setMaxDuration(e.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>

                {/* Crew Size */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Min. Crew Size</label>
                        <input
                            type="text"
                            placeholder="Number"
                            value={minCrewSize}
                            onChange={(e) => setMinCrewSize(e.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Max. Crew Size</label>
                        <input
                            type="text"
                            placeholder="Number"
                            value={maxCrewSize}
                            onChange={(e) => setMaxCrewSize(e.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>

                {/* Guests Capacity */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Min Capacity(Guests)</label>
                        <input
                            type="text"
                            placeholder="Number"
                            value={minCapacity}
                            onChange={(e) => setMinCapacity(e.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Max Capacity(Guests)</label>
                        <input
                            type="text"
                            placeholder="Number"
                            value={maxCapacity}
                            onChange={(e) => setMaxCapacity(e.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>
            </div>

            {/* ── Requirement-Focused ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Requirement-Focused*</h3>

                {/* Tasting Session */}
                <div className="flex flex-col gap-3">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Tasting session offered before the Booking?</p>
                    <div className="flex items-center gap-6">
                        {['Yes', 'No'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer" onClick={() => setTastingSession(opt)}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${tastingSession === opt ? 'border-[#030303]' : 'border-[#D4D4D8]'}`}>
                                    {tastingSession === opt && <div className="w-2.5 h-2.5 rounded-full bg-[#030303]" />}
                                </div>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className={RADIO_LABEL}>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Needs from the Venue */}
                <div className="flex flex-col gap-3">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Needs from the Venue</p>
                    <div className="flex flex-wrap gap-2.5">
                        {[...venueNeedsOptions, ...venueNeeds.filter(n => !venueNeedsOptions.includes(n))].map((opt) => {
                            const isSelected = venueNeeds.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => toggleVenueNeed(opt)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`px-4 py-2 rounded-full text-[14px] font-normal flex items-center gap-2 transition-all leading-[20px] ${
                                        isSelected 
                                            ? 'bg-[#04222D] text-white' 
                                            : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-200'
                                    }`}
                                >
                                    {isSelected ? (
                                        <Check size={14} className="text-white" />
                                    ) : (
                                        <Plus size={14} className="text-[#3F3F47]" />
                                    )}
                                    <span>{opt}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Specific Request with Send Button */}
                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Specific Request</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Ask for your request here..."
                            value={venueRequest}
                            onChange={(e) => setVenueRequest(e.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`${INPUT} flex-1`}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const req = venueRequest.trim();
                                if (req) {
                                    if (!venueNeeds.includes(req)) {
                                        toggleVenueNeed(req);
                                    }
                                    setVenueRequest('');
                                }
                            }}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="bg-[#04222D] hover:bg-[#063445] text-white px-6 py-4 rounded-[8px] font-bold text-[14px] active:scale-[0.98] transition-transform"
                        >
                            Send
                        </button>
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1">Helper Text according to Input field.</p>
                </div>
            </div>
        </div>
    );
}
