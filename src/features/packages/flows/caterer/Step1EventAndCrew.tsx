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


const SUGGESTIONS = [
    'Wedding', 'Corporate', 'Haldi', 'Birthday', 'Baby shower', 'Anniversary'
];
const DROPDOWN_SUGGESTIONS = [
    'Gala', 'Workshop', 'Conference', 'Exhibition'
];
const ALL_SUGGESTIONS = [...SUGGESTIONS, ...DROPDOWN_SUGGESTIONS];

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
    const categories = eventCategories.split(',').map(c => c.trim()).filter(Boolean);
    const [categoryInput, setCategoryInput] = React.useState('');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

    const filteredSuggestions = ALL_SUGGESTIONS.filter(s => 
        !categories.includes(s) && s.toLowerCase().includes(categoryInput.toLowerCase())
    );

    const handleAddCategoryFromInput = (val?: string) => {
        const text = val !== undefined ? val : categoryInput;
        if (text.trim() && !categories.includes(text.trim())) {
            const newCategories = [...categories, text.trim()];
            setEventCategories(newCategories.join(', '));
        }
        setCategoryInput('');
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isDropdownOpen && highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
                handleAddCategoryFromInput(filteredSuggestions[highlightedIndex]);
            } else {
                handleAddCategoryFromInput();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsDropdownOpen(true);
            setHighlightedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Escape') {
            setIsDropdownOpen(false);
        }
    };

    const handleRemoveCategory = (catToRemove: string) => {
        const newCategories = categories.filter(c => c !== catToRemove);
        setEventCategories(newCategories.join(', '));
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
                    
                    <div className="flex flex-col gap-2 relative">
                        <div className={`flex flex-col gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[8px] focus-within:ring-1 focus-within:ring-gray-300 min-h-[56px] justify-center`}>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Set([...SUGGESTIONS, ...categories])).map(cat => {
                                    const isSelected = categories.includes(cat);
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) handleRemoveCategory(cat);
                                                else {
                                                    const newCategories = [...categories, cat];
                                                    setEventCategories(newCategories.join(', '));
                                                }
                                            }}
                                            style={{ fontFamily: 'Figtree, sans-serif' }}
                                            className={`px-3 py-1.5 rounded-full text-[14px] font-medium flex items-center gap-1.5 transition-colors ${
                                                isSelected 
                                                ? 'bg-[#04222D] text-white' 
                                                : 'bg-[#E6E9EA] text-[#3F3F47] hover:bg-gray-200'
                                            }`}
                                        >
                                            <span>{cat}</span>
                                            {isSelected && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <input
                                type="text"
                                placeholder="Type Events Categories"
                                value={categoryInput}
                                onChange={(e) => {
                                    setCategoryInput(e.target.value);
                                    setIsDropdownOpen(true);
                                    setHighlightedIndex(-1);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                onKeyDown={handleCategoryKeyDown}
                                onBlur={() => {
                                    setTimeout(() => handleAddCategoryFromInput(), 150);
                                }}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className="w-full min-w-0 text-[16px] font-normal text-[#030303] focus:outline-none placeholder:text-[#9F9FA9] bg-transparent"
                            />
                        </div>
                        {isDropdownOpen && filteredSuggestions.length > 0 && (
                            <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg overflow-hidden z-50 py-2">
                                {filteredSuggestions.map((suggestion, index) => (
                                    <div
                                        key={suggestion}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleAddCategoryFromInput(suggestion);
                                        }}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className={`px-4 py-3 cursor-pointer text-[15px] font-medium transition-colors ${
                                            highlightedIndex === index ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
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
