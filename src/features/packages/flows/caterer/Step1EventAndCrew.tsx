'use client';

import React from 'react';
import { Check, Plus, X, ChevronDown } from 'lucide-react';

interface Props {
    // Basic Information
    packageName: string; setPackageName: (v: string) => void;
    eventCategories: string; setEventCategories: (v: string) => void;

    // Technical Setup
    minDuration: string; setMinDuration: (v: string) => void;
    maxDuration: string; setMaxDuration: (v: string) => void;
    setupDuration: string; setSetupDuration: (v: string) => void;
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

const CARD  = 'bg-white p-6 rounded-[20px] border border-[#E4E4E7] flex flex-col gap-6';
const LABEL = 'text-[14px] font-bold text-[#3F3F47] leading-[20px]';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const HEAD  = 'text-[18px] font-bold text-[#030303] leading-[24px]';
const HELPER = 'text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1';

const categorySuggestions = ['Corporate', 'Haldi', 'Wedding', 'Birthday', 'Baby shower', 'Anniversary'];

export default function CatererStep1EventAndCrew({
    packageName, setPackageName,
    eventCategories, setEventCategories,
    minDuration, setMinDuration,
    maxDuration, setMaxDuration,
    setupDuration, setSetupDuration,
    minCrewSize, setMinCrewSize,
    maxCrewSize, setMaxCrewSize,
    minCapacity, setMinCapacity,
    maxCapacity, setMaxCapacity,
    tastingSession, setTastingSession,
    venueNeeds, toggleVenueNeed,
    venueRequest, setVenueRequest,
    venueNeedsOptions,
}: Props) {
    const categories = eventCategories.split(',').map((category) => category.trim()).filter(Boolean);
    const [categoryInput, setCategoryInput] = React.useState('');

    const addCategory = (name: string) => {
        const target = name.trim();
        if (!target) return;
        if (!categories.includes(target)) {
            setEventCategories([...categories, target].join(', '));
        }
    };

    const toggleCategory = (category: string) => {
        if (categories.includes(category)) {
            setEventCategories(categories.filter((c) => c !== category).join(', '));
        } else {
            addCategory(category);
        }
    };

    const removeCategory = (categoryToRemove: string) => {
        setEventCategories(categories.filter((category) => category !== categoryToRemove).join(', '));
    };

    const addVenueRequest = () => {
        const request = venueRequest.trim();
        if (!request) return;
        if (!venueNeeds.includes(request)) {
            toggleVenueNeed(request);
        }
        setVenueRequest('');
    };

    return (
        <div className="flex flex-col gap-6 pb-32">

            {/* ── Package Details ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Package and Event Details <span className="text-[#E11D48]">*</span></h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Package name</label>
                    <input
                        type="text"
                        placeholder="e.g., Premium Wedding Buffet"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={INPUT}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Event Types</label>
                    
                    {/* Tag Box Display */}
                    <div className="flex min-h-[140px] flex-col gap-3 rounded-[12px] border border-[#E4E4E7] bg-white p-4 focus-within:ring-1 focus-within:ring-gray-300">
                        <div className="flex flex-wrap gap-2">
                            {categorySuggestions.filter(s => !categories.includes(s)).map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => toggleCategory(suggestion)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="px-4 py-2 rounded-[20px] text-[13px] font-medium transition-all bg-[#F4F4F5] text-[#3F3F47] border border-transparent hover:bg-[#E4E4E7]"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                            {categories.map((category) => (
                                <span key={category} className="flex items-center gap-1.5 rounded-[20px] bg-[#04222D] px-4 py-2 text-[14px] font-medium leading-[20px] text-white">
                                    {category}
                                    <button
                                        type="button"
                                        onClick={() => removeCategory(category)}
                                        aria-label={`Remove ${category}`}
                                        className="flex items-center justify-center text-white hover:text-gray-300"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="Type Events Categories"
                                value={categoryInput}
                                onChange={(e) => setCategoryInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCategory(categoryInput);
                                        setCategoryInput('');
                                    }
                                }}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="bg-transparent text-[16px] font-normal text-[#030303] placeholder:text-[#9F9FA9] focus:outline-none flex-1 min-w-[120px]"
                            />
                        </div>
                    </div>
                </div>

                {/* Event duration */}
                <div className="flex flex-col gap-2 mt-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Event duration</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#3F3F47]">Min Duration</label>
                            <div className="relative">
                                <select
                                    value={minDuration}
                                    onChange={(e) => setMinDuration(e.target.value)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`${INPUT} appearance-none bg-transparent relative z-10 text-[#030303] pr-10`}
                                >
                                    <option value="" disabled hidden>hrs</option>
                                    {[...Array(24)].map((_, i) => (
                                        <option key={i+1} value={i+1}>{i+1} hrs</option>
                                    ))}
                                </select>
                                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none z-0" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#3F3F47]">Max Duration</label>
                            <div className="relative">
                                <select
                                    value={maxDuration}
                                    onChange={(e) => setMaxDuration(e.target.value)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`${INPUT} appearance-none bg-transparent relative z-10 text-[#030303] pr-10`}
                                >
                                    <option value="" disabled hidden>hrs</option>
                                    {[...Array(24)].map((_, i) => (
                                        <option key={i+1} value={i+1}>{i+1} hrs</option>
                                    ))}
                                </select>
                                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none z-0" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Capacity & Crew ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Capacity & Crew <span className="text-[#E11D48]">*</span></h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Setup Duration</label>
                    <div className="relative">
                        <select
                            value={setupDuration}
                            onChange={(e) => setSetupDuration(e.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`${INPUT} appearance-none bg-transparent relative z-10 pr-10 ${setupDuration ? 'text-[#030303]' : 'text-[#9F9FA9]'}`}
                        >
                            <option value="" disabled hidden>E.g Upto 2 hours</option>
                            <option value="1">Upto 1 hour</option>
                            <option value="2">Upto 2 hours</option>
                            <option value="3">Upto 3 hours</option>
                            <option value="4">Upto 4 hours</option>
                            <option value="5">Upto 5 hours</option>
                        </select>
                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none z-0" />
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

            {/* ── On-site Requirements ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>On-site Requirements <span className="text-[#E11D48]">*</span></h3>

                {/* Needs from the Venue */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2.5">
                        {['Power', 'Camera', 'Stage', 'Lighting', 'Security'].map((opt) => {
                            const isSelected = venueNeeds.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => toggleVenueNeed(opt)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`px-4 py-2 rounded-[20px] text-[14px] font-medium flex items-center gap-2 transition-all leading-[20px] ${
                                        isSelected 
                                            ? 'bg-[#04222D] text-white' 
                                            : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-[#E4E4E7]'
                                    }`}
                                >
                                    <Plus size={14} className={isSelected ? "text-white" : "text-[#3F3F47]"} />
                                    <span>{opt}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Specific Request with Textarea */}
                <div className="flex flex-col gap-2 mt-2">
                    <textarea
                        placeholder="Anything else you need from the venue?"
                        value={venueRequest}
                        onChange={(e) => setVenueRequest(e.target.value)}
                        onBlur={addVenueRequest}
                        rows={4}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`${INPUT} resize-none rounded-[12px]`}
                    />
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to Input field.</p>
                </div>

                {/* iOS Toggle Switch for Tasting Session */}
                <div className="flex items-center justify-between mt-2 pt-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[14px] font-medium text-[#27272A]">I offer a tasting session</span>
                    <button
                        type="button"
                        onClick={() => setTastingSession(tastingSession === 'Yes' ? 'No' : 'Yes')}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            tastingSession === 'Yes' ? 'bg-[#04222D]' : 'bg-[#E4E4E7]'
                        }`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                tastingSession === 'Yes' ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
