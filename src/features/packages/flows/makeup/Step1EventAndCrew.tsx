'use client';

import React from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';

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
const CARD = 'bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col gap-6';
const LABEL = 'text-[14px] font-normal text-[#3F3F47] leading-[20px]';
const INPUT = 'w-full p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const HEAD = 'text-[18px] font-bold text-[#030303] leading-[24px]';
const RADIO_LABEL = 'text-[16px] font-normal text-[#27272A] leading-[24px]';

const SUGGESTIONS = [
    'Wedding', 'Corporate', 'Haldi', 'Birthday', 'Baby shower', 'Anniversary'
];
const DROPDOWN_SUGGESTIONS = [
    'Gala', 'Workshop', 'Conference', 'Exhibition'
];
const ALL_SUGGESTIONS = [...SUGGESTIONS, ...DROPDOWN_SUGGESTIONS];

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

                <div className="flex flex-col gap-2 relative">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Select Categories of Events</label>
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
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1 mt-1">Helper Text according to Input field.</p>
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
                                onChange={(e) => setTeamDurationPerPerson(e.target.value.replace(/\D/g, ''))}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`${INPUT} pr-12`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none text-[16px] font-normal" style={{ fontFamily: 'Figtree, sans-serif' }}>hrs</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Duration of setup</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="hrs"
                                value={teamDurationOfSetup}
                                onChange={(e) => setTeamDurationOfSetup(e.target.value.replace(/\D/g, ''))}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={`${INPUT} pr-12`}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none text-[16px] font-normal" style={{ fontFamily: 'Figtree, sans-serif' }}>hrs</span>
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
                            onChange={(e) => setTeamMinPeople(e.target.value.replace(/\D/g, ''))}
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
                            onChange={(e) => setTeamMaxPeople(e.target.value.replace(/\D/g, ''))}
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
                        {Array.from(new Set([...venueNeedsOptions, ...venueNeeds])).map((opt) => {
                            const isSelected = venueNeeds.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => toggleVenueNeed(opt)}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className={`px-4 py-2 rounded-full text-[14px] font-normal flex items-center gap-2 transition-all leading-[20px] ${isSelected
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

                    <div className="flex flex-col gap-1 mt-2">
                        <textarea
                            placeholder="Ask for your request here... (Press Enter to add)"
                            value={venueRequest}
                            onChange={(e) => setVenueRequest(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (venueRequest.trim() && !venueNeeds.includes(venueRequest.trim())) {
                                        toggleVenueNeed(venueRequest.trim());
                                    }
                                    setVenueRequest('');
                                }
                            }}
                            rows={4}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`${INPUT} resize-none`}
                        />
                        <p style={{ fontFamily: 'Figtree, sans-serif' }} className="text-[12px] font-normal text-[#9F9FA9] leading-[18px] ml-1 mt-1">Helper Text according to Input field.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

