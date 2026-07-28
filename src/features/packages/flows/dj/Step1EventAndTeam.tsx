'use client';

import React from 'react';
import { ChevronDown, Plus, Check, Minus } from 'lucide-react';

interface Props {
    packageName: string; setPackageName: (v: string) => void;
    eventCategories: string; setEventCategories: (v: string) => void;
    minDuration: string; setMinDuration: (v: string) => void;
    maxDuration: string; setMaxDuration: (v: string) => void;
    minGuestCount: string; setMinGuestCount: (v: string) => void;
    maxGuestCount: string; setMaxGuestCount: (v: string) => void;
    totalCrewSize: number; setTotalCrewSize: (v: number) => void;
    performingArtistCount: string; setPerformingArtistCount: (v: string) => void;
    supportingCrewCount: string; setSupportingCrewCount: (v: string) => void;
    performingArtistExperience: string; setPerformingArtistExperience: (v: string) => void;
    venueNeeds: string[]; toggleVenueNeed: (v: string) => void;
    venueRequest: string; setVenueRequest: (v: string) => void;
    siteVisitProvided: boolean; setSiteVisitProvided: (v: boolean) => void;
    venueNeedsOptions: string[];
}

/* ── Shared token classes ── */
const CARD = 'bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col gap-6 w-full min-w-0';
const LABEL = 'text-[16px] font-[600] text-[#3F3F47] leading-[24px] text-left'; // Subheadings like performance durations
const INPUT = 'w-full min-w-0 p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const HEAD = 'text-[20px] font-[600] text-[#030303] leading-[28px] tracking-[0px] text-left'; // Headings
const SMALL_LABEL = 'text-[14px] font-[500] text-[#3F3F47] leading-[20px] text-left'; // headings like min durations

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

export default function DJStep1EventAndTeam({
    packageName, setPackageName,
    eventCategories, setEventCategories,
    minDuration, setMinDuration,
    maxDuration, setMaxDuration,
    minGuestCount, setMinGuestCount,
    maxGuestCount, setMaxGuestCount,
    totalCrewSize, setTotalCrewSize,
    performingArtistCount, setPerformingArtistCount,
    supportingCrewCount, setSupportingCrewCount,
    performingArtistExperience, setPerformingArtistExperience,
    venueNeeds, toggleVenueNeed,
    venueRequest, setVenueRequest,
    siteVisitProvided, setSiteVisitProvided,
    venueNeedsOptions,
}: Props) {
    const categories = eventCategories.split(',').map(c => c.trim()).filter(Boolean);
    const [categoryInput, setCategoryInput] = React.useState('');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

    const filteredSuggestions = ALL_SUGGESTIONS.filter(s => 
        !categories.includes(s) && s.toLowerCase().includes(categoryInput.toLowerCase())
    );
    const hasUnselectedCustomCat = categoryInput.trim().length > 0 && !categories.includes(categoryInput.trim());

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

    const decrementCrewSize = () => setTotalCrewSize(Math.max(1, totalCrewSize - 1));
    const incrementCrewSize = () => setTotalCrewSize(totalCrewSize + 1);

    return (
        <div className="flex flex-col gap-6 pb-32 w-full min-w-0">
            {/* ── Package Details ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Package Details <span className="text-red-500">*</span></h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Package name</label>
                    <input
                        type="text"
                        placeholder="e.g. 3-Hour Premium Wedding Set"
                        value={packageName === 'Untitled Package' ? '' : packageName}
                        onChange={(e) => {
                            // Allow only letters, digits, spaces and hyphens (no hash, symbols or commas)
                            const sanitized = e.target.value.replace(/[#,!@$%^&*()+=\[\]{};':"\\|<>\/?]/g, '');
                            setPackageName(sanitized);
                        }}
                        autoComplete="off"
                        inputMode="text"
                        required
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={INPUT}
                    />
                </div>

                    <div className="flex flex-col gap-2 relative">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Event Types</label>
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
                            <div className="flex items-center gap-2 w-full">
                                <input
                                    type="text"
                                    placeholder="Enter Performance type"
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
                                {hasUnselectedCustomCat && (
                                    <button
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleAddCategoryFromInput(categoryInput);
                                        }}
                                        onClick={() => handleAddCategoryFromInput(categoryInput)}
                                        className="px-3 py-1 bg-[#04222D] text-white rounded-full text-[13px] font-medium transition-colors hover:bg-gray-800 flex items-center gap-1 shrink-0"
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                    >
                                        + Add
                                    </button>
                                )}
                            </div>
                        </div>
                        {isDropdownOpen && categoryInput.trim().length > 0 && (filteredSuggestions.length > 0 || hasUnselectedCustomCat) && (
                            <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg max-h-60 overflow-y-auto z-50 py-2">
                                {hasUnselectedCustomCat && !filteredSuggestions.includes(categoryInput.trim()) && (
                                    <div
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleAddCategoryFromInput(categoryInput);
                                        }}
                                        style={{ fontFamily: 'Figtree, sans-serif' }}
                                        className="px-4 py-3 cursor-pointer text-[15px] font-medium text-[#04222D] bg-[#F4F4F5]/70 hover:bg-[#F4F4F5] transition-colors border-b border-[#E4E4E7]/40 last:border-b-0"
                                    >
                                        + Add "{categoryInput.trim()}"
                                    </div>
                                )}
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

            {/* ── Your Team & Availability ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Your Team & Availability <span className="text-red-500">*</span></h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Performance duration</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className={SMALL_LABEL}>Min Duration</span>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="hrs"
                                    value={minDuration}
                                    onChange={(e) => setMinDuration(e.target.value.replace(/\D/g, ''))}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`${INPUT} pr-10`}
                                />
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span style={{ fontFamily: 'Figtree, sans-serif' }} className={SMALL_LABEL}>Max Duration</span>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="hrs"
                                    value={maxDuration}
                                    onChange={(e) => setMaxDuration(e.target.value.replace(/\D/g, ''))}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`${INPUT} pr-10`}
                                />
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Min Guest count</label>
                        <input
                            type="number"
                            placeholder="Number"
                            min={0}
                            value={minGuestCount}
                            onChange={(e) => setMinGuestCount(e.target.value)}
                            required
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Max Guest count</label>
                        <input
                            type="number"
                            placeholder="Number"
                            min={0}
                            value={maxGuestCount}
                            onChange={(e) => setMaxGuestCount(e.target.value)}
                            required
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Total crew size</label>
                    <div className="flex items-center justify-between px-4 py-3 border border-[#E4E4E7] rounded-[8px]">
                        <button type="button" onClick={decrementCrewSize} className="p-1 rounded-full border border-[#D4D4D8] text-[#9F9FA9] hover:text-[#030303] hover:border-[#030303] transition-colors">
                            <Minus size={16} />
                        </button>
                        <input
                            type="number"
                            min={1}
                            value={totalCrewSize}
                            onChange={(e) => setTotalCrewSize(Math.max(1, parseInt(e.target.value) || 1))}
                            required
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className="text-[16px] font-bold text-[#030303] text-center w-12 focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button type="button" onClick={incrementCrewSize} className="p-1 rounded-full border border-[#D4D4D8] text-[#9F9FA9] hover:text-[#030303] hover:border-[#030303] transition-colors">
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Performing Artist</label>
                        <input
                            type="number"
                            placeholder="Eg - 2"
                            min={0}
                            value={performingArtistCount}
                            onChange={(e) => setPerformingArtistCount(e.target.value)}
                            required
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Supporting crew</label>
                        <input
                            type="number"
                            placeholder="Eg - 4"
                            min={0}
                            value={supportingCrewCount}
                            onChange={(e) => setSupportingCrewCount(e.target.value)}
                            required
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Experience of Performing Artist</label>
                    <div className="relative">
                        <select
                            value={performingArtistExperience}
                            onChange={(e) => setPerformingArtistExperience(e.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`${INPUT} pr-10 appearance-none`}
                        >
                            <option value="" disabled>Eg - 2-4 years</option>
                            <option value="0-1">0-1 years</option>
                            <option value="1-2">1-2 years</option>
                            <option value="2-4">2-4 years</option>
                            <option value="4-6">4-6 years</option>
                            <option value="6-10">6-10 years</option>
                            <option value="10+">10+ years</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* ── Venue Needs ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Venue Needs <span className="text-red-500">*</span></h3>

                <div className="flex flex-wrap gap-2.5">
                    {Array.from(new Set([...venueNeedsOptions, ...venueNeeds])).map((opt) => {
                        const isSelected = venueNeeds.includes(opt);
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => toggleVenueNeed(opt)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`px-4 py-2 rounded-full text-[14px] font-normal transition-all leading-[20px] border ${isSelected
                                    ? 'bg-[#04222D] text-white border-[#04222D]'
                                    : 'bg-[#E6E9EA] text-[#3F3F47] border-[#E6E9EA] hover:bg-gray-200'
                                    }`}
                            >
                                <span>{opt}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-1 mt-2">
                    <textarea
                        placeholder="Anything else you need from the venue?"
                        value={venueRequest}
                        onChange={(e) => {
                            if (e.target.value.length <= 400) setVenueRequest(e.target.value);
                        }}
                        maxLength={400}
                        autoComplete="off"
                        inputMode="text"
                        required
                        rows={4}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={`${INPUT} resize-none`}
                    />
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1 mt-1">Enter your Venue needs in the text box</p>
                </div>

                <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-4 mt-2">
                    <span style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[16px] font-[600] text-[#3F3F47] leading-[24px]">Site visit provided</span>
                    <button
                        type="button"
                        onClick={() => setSiteVisitProvided(!siteVisitProvided)}
                        style={{ width: '52px', height: '32px', padding: '4px' }}
                        className={`rounded-full flex items-center transition-colors ${siteVisitProvided ? 'bg-[#04222D] justify-end' : 'bg-gray-200 justify-start'}`}
                    >
                        <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                    </button>
                </div>
            </div>
        </div>
    );
}
