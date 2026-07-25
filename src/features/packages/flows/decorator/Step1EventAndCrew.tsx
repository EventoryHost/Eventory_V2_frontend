'use client';

import React from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';

interface Props {
    packageName: string;
    setPackageName: (v: string) => void;
    eventCategories: string;
    setEventCategories: (v: string) => void;
    eventMinDuration: string;
    setEventMinDuration: (v: string) => void;
    eventMaxDuration: string;
    setEventMaxDuration: (v: string) => void;
    poc: string;
    setPoc: (v: string) => void;
    setupDuration: string;
    setSetupDuration: (v: string) => void;
    supervisors: string;
    setSupervisors: (v: string) => void;
    workers: string;
    setWorkers: (v: string) => void;
    venueNeeds: string[];
    toggleVenueNeed: (v: string) => void;
    venueRequest: string;
    setVenueRequest: (v: string) => void;
    venueNeedsOptions: string[];
}

const CARD = 'bg-white p-6 rounded-[20px] border border-[#E4E4E7] flex flex-col gap-6';
const LABEL = 'text-[14px] font-bold text-[#3F3F47] leading-[20px]';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const HEAD = 'text-[18px] font-bold text-[#030303] leading-[24px]';
const HELPER = 'text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1';

const SUGGESTIONS = [
    'Wedding', 'Corporate Event', 'Haldi Ceremony', 'Birthday Party', 'Baby Shower', 'Anniversary Party'
];
const DROPDOWN_SUGGESTIONS = [
    'Birthday', 'Birthday Celebration', 'Kids Birthday Party', 'Milestone Birthday',
    'Wedding Reception', 'Wedding Ceremony', 'Sangeet & Mehendi', 'Cocktail Party', 'Engagement Ceremony',
    'Corporate Meeting', 'Corporate Conference', 'Corporate Workshop', 'Product Launch', 'Annual Gala',
    'Charity Fundraiser', 'Bachelor Party', 'Bachelorette Party', 'Housewarming Party', 'Pool Party',
    'Farewell Party', 'Exhibition & Seminar', 'Fashion Show', 'Concert & Live Music', 'Private Dining',
    'Festival & Cultural Event', 'Religious Ceremony'
];
const ALL_SUGGESTIONS = Array.from(new Set([...SUGGESTIONS, ...DROPDOWN_SUGGESTIONS]));
const setupDurationOptions = ['Upto 1 hour', 'Upto 2 hours', 'Upto 5 hours', 'Upto 8 hours', 'Upto 10 hours', 'Upto 12 hours'];

export default function DecoratorStep1EventAndCrew({
    packageName,
    setPackageName,
    eventCategories,
    setEventCategories,
    eventMinDuration,
    setEventMinDuration,
    eventMaxDuration,
    setEventMaxDuration,
    poc,
    setPoc,
    setupDuration,
    setSetupDuration,
    supervisors,
    setSupervisors,
    workers,
    setWorkers,
    venueNeeds,
    toggleVenueNeed,
    venueRequest,
    setVenueRequest,
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
        <div className="flex flex-col gap-6 pb-40">
            {/* Package & Event Details */}
            <section className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Package Details *</h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Package name</label>
                    <input
                        type="text"
                        placeholder="Package Name"
                        value={packageName}
                        onChange={(event) => setPackageName(event.target.value)}
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
                            <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg max-h-60 overflow-y-auto z-50 py-2">
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
            
                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Event duration *</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#3F3F47] leading-[18px]">Min Duration</p>
                            <div className="relative">
                                <select
                                    value={eventMinDuration}
                                    onChange={(event) => setEventMinDuration(event.target.value)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`${INPUT} appearance-none pr-12 ${eventMinDuration ? 'text-[#030303]' : 'text-[#9F9FA9]'}`}
                                >
                                    <option value="">hrs</option>
                                    {[...Array(24)].map((_, i) => (
                                        <option key={i+1} value={i+1}>{i+1} hrs</option>
                                    ))}
                                </select>
                                <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#3F3F47] leading-[18px]">Max Duration</p>
                            <div className="relative">
                                <select
                                    value={eventMaxDuration}
                                    onChange={(event) => setEventMaxDuration(event.target.value)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`${INPUT} appearance-none pr-12 ${eventMaxDuration ? 'text-[#030303]' : 'text-[#9F9FA9]'}`}
                                >
                                    <option value="">hrs</option>
                                    {[...Array(24)].map((_, i) => (
                                        <option key={i+1} value={i+1}>{i+1} hrs</option>
                                    ))}
                                </select>
                                <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            {/* Capacity & Crew */}
            <section className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Crew and Setup *</h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Point of Contact(POC)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={poc}
                            onChange={(event) => setPoc(event.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            placeholder="Enter POC name"
                            className={INPUT}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Setup Duration</label>
                    <div className="relative">
                        <select
                            value={setupDuration}
                            onChange={(event) => setSetupDuration(event.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`${INPUT} appearance-none pr-12 ${setupDuration ? 'text-[#030303]' : 'text-[#9F9FA9]'}`}
                        >
                            <option value="">E.g Upto 1 hour</option>
                            {setupDurationOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to Input field.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of people in crew</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Supervisors"
                            value={supervisors}
                            onChange={(event) => setSupervisors(event.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                        <input
                            type="text"
                            placeholder="Workers"
                            value={workers}
                            onChange={(event) => setWorkers(event.target.value.replace(/\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>
            </section>

            {/* Requirement-Focused */}
            <section className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Venue Needs *</h3>

                <div className="flex flex-col gap-3">
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Needs from the Venue</p>
                    <div className="flex flex-wrap gap-2.5">
                        {Array.from(new Set([...venueNeedsOptions, ...venueNeeds])).map((need) => {
                            const isSelected = venueNeeds.includes(need);
                            return (
                                <button
                                    key={need}
                                    type="button"
                                    onClick={() => toggleVenueNeed(need)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`flex items-center justify-center rounded-full px-4 py-2 text-[14px] font-normal leading-[20px] transition-all ${
                                        isSelected
                                            ? 'bg-[#04222D] text-white'
                                            : 'bg-[#F4F4F5] text-[#3F3F47] hover:bg-gray-200'
                                    }`}
                                >
                                    <span>{need}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <textarea
                        placeholder="Anything else you need from the venue?"
                        value={venueRequest}
                        onChange={(event) => setVenueRequest(event.target.value)}
                        rows={4}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`${INPUT} resize-none`}
                    />
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Enter your Venue needs in the text box</p>
                </div>
            </section>
        </div>
    );
}
