'use client';

import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

interface Props {
    packageName: string; setPackageName: (v: string) => void;
    eventCategories: string; setEventCategories: (v: string) => void;
    poc: string; setPoc: (v: string) => void;
    minDuration: string; setMinDuration: (v: string) => void;
    maxDuration: string; setMaxDuration: (v: string) => void;
    crewSize: string; setCrewSize: (v: string) => void;
    address: string; setAddress: (v: string) => void;
    offerTours: boolean; setOfferTours: (v: boolean) => void;
}

/* ── Shared token classes ── */
const CARD = 'bg-white p-6 rounded-[12px] border border-[#E4E4E7] flex flex-col gap-6 w-full min-w-0';
const LABEL = 'text-[16px] font-[600] text-[#3F3F47] leading-[24px] text-left';
const INPUT = 'w-full min-w-0 p-4 bg-white border border-[#E4E4E7] rounded-[8px] text-[16px] font-normal text-[#030303] focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-[#9F9FA9] placeholder:text-[16px] placeholder:font-normal placeholder:leading-[24px]';
const HEAD = 'text-[20px] font-[600] text-[#030303] leading-[28px] tracking-[0px] text-left';
const SMALL_LABEL = 'text-[14px] font-[500] text-[#3F3F47] leading-[20px] text-left';

const SUGGESTIONS = [
    'Wedding', 'Corporate', 'Haldi', 'Birthday', 'Baby shower', 'Anniversary'
];
const DROPDOWN_SUGGESTIONS = [
    'Gala', 'Workshop', 'Conference', 'Exhibition'
];
const ALL_SUGGESTIONS = [...SUGGESTIONS, ...DROPDOWN_SUGGESTIONS];

export default function VenueStep1PackageAndTeam({
    packageName, setPackageName,
    eventCategories, setEventCategories,
    poc, setPoc,
    minDuration, setMinDuration,
    maxDuration, setMaxDuration,
    crewSize, setCrewSize,
    address, setAddress,
    offerTours, setOfferTours,
}: Props) {
    const categories = eventCategories.split(',').map(c => c.trim()).filter(Boolean);
    const [categoryInput, setCategoryInput] = React.useState('');
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

    const [addressQuery, setAddressQuery] = React.useState(address);
    const [addressSuggestions, setAddressSuggestions] = React.useState<any[]>([]);
    const [showAddressDropdown, setShowAddressDropdown] = React.useState(false);

    React.useEffect(() => {
        setAddressQuery(address);
    }, [address]);

    React.useEffect(() => {
        const handler = setTimeout(async () => {
            if (addressQuery && addressQuery !== address) {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=5`);
                    if (res.ok) {
                        const data = await res.json();
                        setAddressSuggestions(data);
                        setShowAddressDropdown(true);
                    }
                } catch (e) {
                    console.error("Error fetching address suggestions", e);
                }
            } else {
                setShowAddressDropdown(false);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [addressQuery, address]);

    const handleSelectAddress = (suggestion: any) => {
        setAddress(suggestion.display_name);
        setAddressQuery(suggestion.display_name);
        setShowAddressDropdown(false);
    };

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
        <div className="flex flex-col gap-6 pb-32 w-full min-w-0">
            {/* ── Package Details ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Package Details <span className="text-red-500">*</span></h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={SMALL_LABEL}>Package name</label>
                    <input
                        type="text"
                        placeholder="Package Name"
                        value={packageName === 'Untitled Package' ? '' : packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={INPUT}
                    />
                </div>

                <div className="flex flex-col gap-2 relative">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={SMALL_LABEL}>Events you host</label>
                    <div className={`flex flex-col gap-2 p-3 bg-white border border-[#E4E4E7] rounded-[8px] focus-within:ring-1 focus-within:ring-gray-300 min-h-[56px] justify-center`}>
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
                            placeholder={categories.length === 0 ? "Enter your Event type" : "Type more events..."}
                            value={categoryInput}
                            onChange={(e) => {
                                setCategoryInput(e.target.value);
                                setIsDropdownOpen(true);
                                setHighlightedIndex(-1);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            onBlur={() => {
                                setTimeout(() => handleAddCategoryFromInput(), 150);
                            }}
                            onKeyDown={handleCategoryKeyDown}
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

            {/* ── Venue Details ── */}
            <div className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Venue Details <span className="text-red-500">*</span></h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={SMALL_LABEL}>Point of contact(POC)</label>
                    <div className="relative">
                        <select
                            value={poc}
                            onChange={(e) => setPoc(e.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif', appearance: 'none' }}
                            className={`${INPUT} pr-10`}
                        >
                            <option value="" disabled hidden>Text + Dropdown</option>
                            <option value="Owner">Owner</option>
                            <option value="Manager">Manager</option>
                            <option value="Coordinator">Coordinator</option>
                            <option value="Sales">Sales</option>
                        </select>
                        <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none" />
                    </div>
                </div>

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

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={SMALL_LABEL}>Number of People in the Crew</label>
                    <input
                        type="text"
                        placeholder="Number"
                        value={crewSize}
                        onChange={(e) => setCrewSize(e.target.value.replace(/\D/g, ''))}
                        style={{ fontFamily: 'Figtree, sans-serif' }}
                        className={INPUT}
                    />
                </div>

                <div className="flex flex-col gap-2 relative">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={SMALL_LABEL}>Address of the Venue</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Enter the Address"
                            value={addressQuery}
                            onChange={(e) => {
                                setAddressQuery(e.target.value);
                                if (e.target.value === '') setAddress(''); // Clear actual address if input is cleared
                            }}
                            onFocus={() => { if (addressSuggestions.length > 0) setShowAddressDropdown(true); }}
                            onBlur={() => setTimeout(() => setShowAddressDropdown(false), 200)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={`${INPUT} pr-10`}
                        />
                        <MapPin size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9] pointer-events-none" />
                    </div>
                    {showAddressDropdown && addressSuggestions.length > 0 && (
                        <div className="absolute top-[100%] left-0 right-0 mt-2 bg-white border border-[#E4E4E7] rounded-[12px] shadow-lg overflow-y-auto max-h-[250px] z-50 py-2">
                            {addressSuggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelectAddress(suggestion);
                                    }}
                                    style={{ fontFamily: 'Figtree, sans-serif' }}
                                    className="px-4 py-3 cursor-pointer text-[14px] font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                >
                                    {suggestion.display_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={SMALL_LABEL}>I offer venue tours</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={offerTours} onChange={e => setOfferTours(e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#04222D]"></div>
                    </label>
                </div>
            </div>
        </div>
    );
}
