'use client';

import React from 'react';
import { ChevronDown, PlusCircle } from 'lucide-react';

interface Props {
    packageName: string; setPackageName: (v: string) => void;
    eventCategories: string; setEventCategories: (v: string) => void;
    teamDurationPerPerson: string; setTeamDurationPerPerson: (v: string) => void;
    teamDurationOfSetup: string; setTeamDurationOfSetup: (v: string) => void;
    teamMinPeople: string; setTeamMinPeople: (v: string) => void;
    teamMaxPeople: string; setTeamMaxPeople: (v: string) => void;
    trialOffered: string; setTrialOffered: (v: string) => void;
    parallelServicing: string; setParallelServicing: (v: string) => void;
    venueNeeds: string[]; toggleVenueNeed: (v: string) => void;
    venueRequest: string; setVenueRequest: (v: string) => void;
    venueNeedsOptions: string[];
}

/* ── Shared token classes ── */
const CARD  = 'bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col gap-6';
const LABEL = 'text-[14px] font-normal text-[#3F3F47] leading-[20px]';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const HEAD  = 'text-[14px] font-medium text-[#3F3F47] leading-[20px]';
const RADIO_LABEL = 'text-[16px] font-normal text-[#27272A] leading-[24px]';

export default function MakeupStep1EventAndCrew({
    packageName, setPackageName,
    eventCategories, setEventCategories,
    teamDurationPerPerson, setTeamDurationPerPerson,
    teamDurationOfSetup, setTeamDurationOfSetup,
    teamMinPeople, setTeamMinPeople,
    teamMaxPeople, setTeamMaxPeople,
    trialOffered, setTrialOffered,
    parallelServicing, setParallelServicing,
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
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1">Helper Text according to input field.</p>
                </div>
            </div>

            {/* ── Team ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Team *</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Duration per person</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="hrs"
                                value={teamDurationPerPerson}
                                onChange={(e) => setTeamDurationPerPerson(e.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={INPUT}
                            />
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Duration of setup</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="hrs"
                                value={teamDurationOfSetup}
                                onChange={(e) => setTeamDurationOfSetup(e.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={INPUT}
                            />
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Min no. of people</label>
                        <input
                            type="text"
                            placeholder="Number"
                            value={teamMinPeople}
                            onChange={(e) => setTeamMinPeople(e.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Max no. of people</label>
                        <input
                            type="text"
                            placeholder="Number"
                            value={teamMaxPeople}
                            onChange={(e) => setTeamMaxPeople(e.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>
            </div>

            {/* ── Requirement-Focused ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Requirement-Focused*</h3>

                {/* Trial Offered */}
                <div className="flex flex-col gap-3">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Trial Offered</p>
                    <div className="flex items-center gap-6">
                        {['Yes', 'No'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer" onClick={() => setTrialOffered(opt)}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${trialOffered === opt ? 'border-[#030303]' : 'border-[#D4D4D8]'}`}>
                                    {trialOffered === opt && <div className="w-2.5 h-2.5 rounded-full bg-[#030303]" />}
                                </div>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className={RADIO_LABEL}>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Parallel Servicing */}
                <div className="flex flex-col gap-3">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Parallel servicing possible ?</p>
                    <div className="flex items-center gap-6">
                        {['Yes', 'No'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer" onClick={() => setParallelServicing(opt)}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${parallelServicing === opt ? 'border-[#030303]' : 'border-[#D4D4D8]'}`}>
                                    {parallelServicing === opt && <div className="w-2.5 h-2.5 rounded-full bg-[#030303]" />}
                                </div>
                                <span style={{ fontFamily: 'Figtree, sans-serif' }} className={RADIO_LABEL}>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Venue Needs */}
                <div className="flex flex-col gap-3">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Needs from the Venue</p>
                    <div className="flex flex-wrap gap-2.5">
                        {venueNeedsOptions.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => toggleVenueNeed(opt)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`px-4 py-2 rounded-full text-[14px] font-normal flex items-center gap-2 transition-all leading-[20px] ${venueNeeds.includes(opt) ? 'bg-[#04222D] text-white' : 'bg-[#F4F4F5] text-[#3F3F47]'}`}
                            >
                                <PlusCircle size={16} className={venueNeeds.includes(opt) ? 'text-white' : 'text-[#3F3F47]'} />
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1">
                        <textarea
                            placeholder="Ask for your request here..."
                            value={venueRequest}
                            onChange={(e) => setVenueRequest(e.target.value)}
                            rows={3}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px] resize-none"
                        />
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1">Helper Text according to input field.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
